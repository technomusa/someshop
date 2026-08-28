<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class SaleController extends Controller
{
    /**
     * Get list of sales
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        return Sale::with(["user", "customer", "payments", "items.product", "business", "branch", "shop"])
            ->latest()
            ->paginate(20);
    }

    /**
     * Get specific sale details
     */
    public function show(Sale $sale)
    {
        $this->authorize('view', $sale);

        return $sale->load([
            "items.product",
            "payments",
            "customer",
            "user",
            "shop",
            "business",
            "branch",
        ]);
    }

    /**
     * Create a new sale
     */
    public function store(Request $request)
    {
        $this->authorize('create', Sale::class);
        // Handle data structure differences from frontend (e.g. cart vs items)
        $this->normalizeRequestData($request);

        $validated = $request->validate([
            "customer_id" => "nullable|exists:customers,id",
            "items" => "required|array|min:1",
            "items.*.product_id" => "required|exists:products,id",
            "items.*.variation_id" => "nullable", // Loose check to avoid blocking on dev data
            "items.*.quantity" => "required|integer|min:1",
            "items.*.unit_price" => "required|numeric|min:0",
            "payments" => "required|array|min:1",
            "payments.*.method" => "required|string",
            "payments.*.amount" => "required|numeric",
            "payments.*.cash_breakdown" => "nullable|array",
            "payments.*.exchange_rate" => "nullable|numeric",
            "payments.*.reference_number" => "nullable|string",
            "payments.*.metadata" => "nullable|array",
            "currency" => "nullable|string|size:3",
            "exchange_rates" => "nullable|array",
            "payment_breakdown" => "nullable|array",
            "notes" => "nullable|string",
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $user = $request->user();
            $shopId = $user->shop_id;

            if (!$shopId) {
                // Fallback to first shop if user has no context (safeguard)
                $shopId = $user->shops()->first()?->id;

                if (!$shopId) {
                    throw new \Exception(
                        "User does not have an active shop session.",
                    );
                }
            }

            // Calculate totals
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated["items"] as $item) {
                $lineTotal = $item["quantity"] * $item["unit_price"];
                $subtotal += $lineTotal;

                $productName =
                    Product::where("id", $item["product_id"])->value("name") ??
                    "Unknown Product";

                $itemsData[] = [
                    "product_id" => $item["product_id"],
                    "variation_id" => $item["variation_id"] ?? null,
                    "product_name" => $productName,
                    "quantity" => $item["quantity"],
                    "unit_price" => $item["unit_price"],
                    "subtotal" => $lineTotal,
                    "total_price" => $lineTotal, // Add tax calculation if needed later
                    "tax_amount" => 0,
                    "discount_amount" => 0,
                ];
            }

            // Financials
            $totalAmount = $subtotal; // In future, apply sale-level discount/tax here
            $taxAmount = 0;
            $discountAmount = 0;

            // Determine payment status
            $totalPaid = collect($validated["payments"])->sum("amount");
            $paymentStatus = "unpaid";
            if ($totalPaid >= $totalAmount - 0.01) {
                // Floating point tolerance
                $paymentStatus = "paid";
            } elseif ($totalPaid > 0) {
                $paymentStatus = "partial";
            }

            // Get shop to determine business_id and branch_id
            $shop = \App\Models\Shop::with('branch')->find($shopId);

            // Auto-attach business_id, branch_id, shop_id
            $sale = Sale::create([
                "invoice_number" => "INV-" . strtoupper(Str::random(10)),
                "business_id" => $shop->branch->business_id ?? $user->business_id,
                "branch_id" => $shop->branch_id ?? $user->branch_id,
                "shop_id" => $shopId,
                "user_id" => $user->id,
                "customer_id" => $validated["customer_id"] ?? null,
                "subtotal" => $subtotal,
                "tax_amount" => $taxAmount,
                "discount_amount" => $discountAmount,
                "total_amount" => $totalAmount,
                "status" => "completed",
                "payment_status" => $paymentStatus,
                "payment_method" =>
                    count($validated["payments"]) > 1
                        ? "split"
                        : $validated["payments"][0]["method"],
                "currency" => $validated["currency"] ?? "USD",
                "payment_breakdown" => $validated["payment_breakdown"] ?? null,
                "exchange_rates" => $validated["exchange_rates"] ?? null,
                "notes" => $validated["notes"] ?? null,
            ]);

            // Create Items and Update Inventory
            foreach ($itemsData as $data) {
                $sale->items()->create($data);

                // Inventory Management
                $this->decrementInventory(
                    $data["product_id"],
                    $data["variation_id"] ?? null,
                    $shopId,
                    $data["quantity"],
                );
            }

            // Create Payments
            foreach ($validated["payments"] as $paymentData) {
                $sale->payments()->create([
                    "amount" => $paymentData["amount"],
                    "method" => $paymentData["method"],
                    "cash_breakdown" => $paymentData["cash_breakdown"] ?? null,
                    "exchange_rate" => $paymentData["exchange_rate"] ?? null,
                    "reference_number" =>
                        $paymentData["reference_number"] ?? null,
                    "metadata" => $paymentData["metadata"] ?? null,
                    "transaction_reference" =>
                        $paymentData["reference_number"] ?? null, // Map reference to transaction_reference
                ]);
            }

            return $sale->load(["items", "payments", "customer", "user"]);
        });
    }

    public function update(Request $request, Sale $sale)
    {
        // Implement update logic if needed
        return response()->json(
            ["message" => "Update not implemented yet"],
            501,
        );
    }

    public function destroy(Sale $sale)
    {
        $this->authorize('delete', $sale);

        $sale->update(["status" => "cancelled"]);
        return response()->json(["message" => "Sale cancelled"]);
    }

    /**
     * Helper to normalize request data from frontend
     * Maps frontend specific fields to backend expectations
     */
    private function normalizeRequestData(Request $request)
    {
        // Handle nested cart items (frontend sends { cart: { items: [...] } })
        if ($request->has("cart.items") && !$request->has("items")) {
            $request->merge(["items" => $request->input("cart.items")]);
        }

        // Normalize items structure
        if ($request->has("items")) {
            $items = $request->input("items");
            $normalizedItems = [];

            foreach ($items as $item) {
                $normalizedItem = $item;

                // Extract product_id from nested product object
                if (
                    isset($item["product"]["id"]) &&
                    !isset($item["product_id"])
                ) {
                    $normalizedItem["product_id"] = $item["product"]["id"];
                }

                // Map unitPrice (camelCase) to unit_price (snake_case)
                if (isset($item["unitPrice"]) && !isset($item["unit_price"])) {
                    $normalizedItem["unit_price"] = $item["unitPrice"];
                }

                // Map variant.id to variation_id
                if (
                    isset($item["variant"]["id"]) &&
                    !isset($item["variation_id"])
                ) {
                    $normalizedItem["variation_id"] = $item["variant"]["id"];
                }

                $normalizedItems[] = $normalizedItem;
            }

            $request->merge(["items" => $normalizedItems]);
        }
    }

    /**
     * Decrement inventory helper
     */
    private function decrementInventory(
        $productId,
        $variationId,
        $shopId,
        $quantity,
    ) {
        $query = Inventory::where("product_id", $productId)->where(
            "shop_id",
            $shopId,
        );

        if ($variationId) {
            $query->where("variation_id", $variationId);
        }

        $inventory = $query->first();

        if ($inventory) {
            $inventory->decrement("quantity", $quantity);
        }
    }
}
