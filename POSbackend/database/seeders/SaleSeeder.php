<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have some users and products
        $user = User::first();
        $products = Product::take(3)->get();
        if (!$user || $products->isEmpty()) {
            return; // nothing to seed
        }

        // Create a simple sale with line items
        $shop = \App\Models\Shop::first();
        $subtotal = $products->sum(fn($p) => $p->base_price);
        $sale = Sale::create([
            'shop_id'        => $shop->id,
            'user_id'        => $user->id,
            'subtotal'       => $subtotal,
            'tax_amount'     => 0,
            'discount_amount'=> 0,
            'total_amount'   => $subtotal,
            'status'         => 'completed',
            'sold_at'        => now(),
        ]);

        // Attach products via pivot (sale_items) with detailed fields
        foreach ($products as $product) {
            $sale->products()->attach($product->id, [
                'quantity'       => 1,
                'unit_price'    => $product->base_price,
                'subtotal'      => $product->base_price,
                'tax_amount'    => 0,
                'discount_amount'=> 0,
                'total_price'   => $product->base_price,
            ]);
        }
    }
}
