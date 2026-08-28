<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Grab some products (or exit if none exist)
        $products = Product::all();
        if ($products->isEmpty()) {
            return; // nothing to seed
        }

        $shops = Shop::all();
        if ($shops->isEmpty()) {
            return; // inventories require shops
        }

        foreach ($products as $product) {
            // ensure each shop has an inventory row for the product
            foreach ($shops as $shop) {
                Inventory::updateOrCreate(
                    ['product_id' => $product->id, 'shop_id' => $shop->id],
                    [
                        'quantity'     => rand(5, 200),
                        'variation_id' => null,
                    ]
                );
            }
        }

        // Additionally, create some random inventory rows through the factory
        $extra = max(0, 100 - Inventory::count());
        if ($extra > 0) {
            Inventory::factory()->count($extra)->create();
        }
    }
}
