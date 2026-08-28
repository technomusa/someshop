<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Variation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'variations', 'inventories']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Filter by Category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return $query->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku',
            'barcode' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'cost_price' => 'numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'type' => 'in:standard,variable,perishable,service',
            'tax_rate' => 'numeric|min:0',
            'alert_quantity' => 'integer|min:0',
            'variations' => 'array|required_if:type,variable',
            'variations.*.name' => 'required_with:variations|string',
            'variations.*.additional_price' => 'numeric',
            'variations.*.selling_price' => 'nullable|numeric',
        ]);

        DB::beginTransaction();
        try {
            $productData = collect($validated)->except('variations')->toArray();
            $productData['slug'] = Str::slug($productData['name']);

            $product = Product::create($productData);

            if ($product->type === 'variable' && isset($validated['variations'])) {
                foreach ($validated['variations'] as $v) {
                    $product->variations()->create([
                        'name' => $v['name'],
                        'additional_price' => $v['additional_price'] ?? 0,
                        'selling_price' => $v['selling_price'] ?? null,
                        // Add more fields as needed
                    ]);
                }
            }

            DB::commit();
            return response()->json($product->load('variations'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Product $product)
    {
        return $product->load(['category', 'brand', 'variations', 'inventories']);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'selling_price' => 'sometimes|numeric',
            // Add other validations as needed
        ]);

        $product->update($validated);

        // Handle variations update logic if complex, for now simple update

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->noContent();
    }
}
