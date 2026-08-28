<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryBatch;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Get inventory list with product details
     */
    public function index(Request $request)
    {
        $query = Inventory::with(['product.category', 'product.brand', 'shop']);
        
        // Filter by shop (user's shop by default)
        $shopId = $request->user()->shop_id;
        if ($shopId) {
            $query->where('shop_id', $shopId);
        }
        
        // Search by product name or SKU
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('product', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }
        
        return $query->paginate(50);
    }
    
    /**
     * Get stock movements (adjustment history)
     */
    public function movements(Request $request)
    {
        $query = \App\Models\StockMovement::with(['product', 'user'])
            ->orderBy('created_at', 'desc');
        
        // Filter by shop (user's shop by default)
        $shopId = $request->user()->shop_id;
        if ($shopId) {
            $query->where('shop_id', $shopId);
        }
        
        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        return $query->paginate(50);
    }
    
    // Adjust Stock (Increase/Decrease/Set)
    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variation_id' => 'nullable|exists:variations,id',
            'quantity' => 'required|integer', // Can be negative for removal
            'type' => 'required|in:add,subtract,set',
            'reason' => 'nullable|string',
            // shop_id is inferred from user, unless admin wants to adjust another shop (omitted for now)
        ]);
        
        $shopId = $request->user()->shop_id;
        if (!$shopId) {
             // Fallback or error if user has no shop (e.g. strict Admin must switch context)
             return response()->json(['error' => 'User not assigned to a shop'], 400);
        }
        
        $movement = DB::transaction(function () use ($validated, $shopId, $request) {
            $inventory = Inventory::firstOrCreate(
                [
                    'product_id' => $validated['product_id'],
                    'variation_id' => $validated['variation_id'] ?? null,
                    'shop_id' => $shopId
                ],
                ['quantity' => 0]
            );

            $oldQty = $inventory->quantity;
            
            if ($validated['type'] === 'set') {
                $inventory->quantity = $validated['quantity'];
            } elseif ($validated['type'] === 'add') {
                $inventory->quantity += $validated['quantity'];
            } elseif ($validated['type'] === 'subtract') {
                $inventory->quantity -= $validated['quantity'];
            }
            
            $inventory->save();
            
            // Log movement
            $movement = \App\Models\StockMovement::create([
                'product_id' => $validated['product_id'],
                'variation_id' => $validated['variation_id'] ?? null,
                'type' => 'adjustment',
                'quantity' => $inventory->quantity - $oldQty,
                'reason' => $validated['reason'] ?? 'Manual Adjustment',
                'user_id' => $request->user()->id,
                'shop_id' => $shopId,
            ]);
            
            return $movement->load('product', 'user');
        });
        
        return response()->json([
            'message' => 'Stock updated successfully',
            'data' => $movement
        ]);
    }
    
    // Receive Stock (Purchase Order / GRN) - Supports Batches
    public function receive(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variation_id' => 'nullable|exists:variations,id',
            'quantity' => 'required|integer|min:1',
            'batch_number' => 'nullable|string', // Required if perishable
            'expiry_date' => 'nullable|date',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'cost_price' => 'nullable|numeric',
        ]);

        $shopId = $request->user()->shop_id;
        if (!$shopId) {
             return response()->json(['error' => 'User not assigned to a shop'], 400);
        }

        DB::transaction(function () use ($validated, $request, $shopId) {
            // Update aggregate inventory
            $inventory = Inventory::firstOrCreate(
                [
                    'product_id' => $validated['product_id'],
                    'variation_id' => $validated['variation_id'] ?? null,
                    'shop_id' => $shopId
                ],
                ['quantity' => 0]
            );
            $inventory->increment('quantity', $validated['quantity']);
            
            // Create Batch if provided
            if (!empty($validated['batch_number'])) {
                InventoryBatch::create([
                    'product_id' => $validated['product_id'],
                    'variation_id' => $validated['variation_id'] ?? null,
                    'batch_number' => $validated['batch_number'],
                    'quantity' => $validated['quantity'],
                    'expiry_date' => $validated['expiry_date'] ?? null,
                    'cost_price' => $validated['cost_price'] ?? null,
                    'supplier_id' => $validated['supplier_id'] ?? null,
                    'shop_id' => $shopId,
                ]);
            }
            
            // Log Movement
             \App\Models\StockMovement::create([
                'product_id' => $validated['product_id'],
                'variation_id' => $validated['variation_id'] ?? null,
                'type' => 'in',
                'quantity' => $validated['quantity'], // Positive
                'reason' => 'GRN / Receive',
                'user_id' => $request->user()->id,
                'shop_id' => $shopId,
            ]);
        });
        
        return response()->json(['message' => 'Stock received successfully']);
    }

    public function transfer(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variation_id' => 'nullable|exists:variations,id',
            'quantity' => 'required|integer|min:1',
            'to_shop_id' => 'required|exists:shops,id|different:from_shop', // validation logic might need custom rule or simple check
        ]);
        
        $fromShopId = $request->user()->shop_id;
        if (!$fromShopId) {
             return response()->json(['error' => 'User not assigned to a source shop'], 400);
        }
        
        if ($fromShopId == $validated['to_shop_id']) {
            return response()->json(['error' => 'Cannot transfer to the same shop'], 400);
        }

        DB::transaction(function () use ($validated, $request, $fromShopId) {
            // Deduct from Source (need to bypass scope to access other shops)
            $sourceInv = Inventory::withoutGlobalScopes()
                ->where('shop_id', $fromShopId)
                ->where('product_id', $validated['product_id'])
                ->where('variation_id', $validated['variation_id'] ?? null)
                ->first();
                
            if (!$sourceInv || $sourceInv->quantity < $validated['quantity']) {
                throw \Illuminate\Validation\ValidationException::withMessages(['quantity' => 'Insufficient stock in source shop']);
            }
            
            $sourceInv->decrement('quantity', $validated['quantity']);
            
            // Add to Target (need to bypass scope to access other shops)
            $targetInv = Inventory::withoutGlobalScopes()
                ->firstOrCreate([
                    'shop_id' => $validated['to_shop_id'],
                    'product_id' => $validated['product_id'],
                    'variation_id' => $validated['variation_id'] ?? null,
                ], ['quantity' => 0]);
                
            $targetInv->increment('quantity', $validated['quantity']);
            
            // Log Movement
             \App\Models\StockMovement::create([
                'product_id' => $validated['product_id'],
                'variation_id' => $validated['variation_id'] ?? null,
                'type' => 'transfer',
                'quantity' => $validated['quantity'],
                'reason' => 'Stock Transfer',
                'user_id' => $request->user()->id,
                'shop_id' => $fromShopId, // recorded under sender
                'from_shop_id' => $fromShopId,
                'to_shop_id' => $validated['to_shop_id']
            ]);
        });
        
        return response()->json(['message' => 'Stock transferred successfully']);
    }
}
