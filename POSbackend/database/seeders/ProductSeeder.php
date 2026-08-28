<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Inventory;
use App\Models\Shop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name'        => 'iPhone 15',
                'sku'         => 'IP15',
                'barcode'     => '1234567890123',
                'base_price'  => 999.00,
                'stock'       => 30,
                'category'    => 'phones',
                'brand'       => 'apple',
                'is_active'   => true,
            ],
            [
                'name'        => 'Galaxy S24',
                'sku'         => 'GS24',
                'barcode'     => '1234567890124',
                'base_price'  => 899.00,
                'stock'       => 25,
                'category'    => 'phones',
                'brand'       => 'samsung',
                'is_active'   => true,
            ],
            [
                'name'        => 'Dell XPS 13',
                'sku'         => 'DX13',
                'barcode'     => '1234567890125',
                'base_price'  => 1199.00,
                'stock'       => 15,
                'category'    => 'laptops',
                'brand'       => 'dell',
                'is_active'   => true,
            ],
            [
                'name'        => 'Nike Running Shoes',
                'sku'         => 'NRS',
                'barcode'     => '1234567890126',
                'base_price'  => 120.00,
                'stock'       => 80,
                'category'    => 'clothing',
                'brand'       => 'nike',
                'is_active'   => true,
            ],
        ];

        // Get all shops to distribute products across them
        $shops = Shop::with('branch.business')->get();
        if ($shops->isEmpty()) {
            $this->command->warn('No shops found. Please run ShopSeeder first.');
            return;
        }

        foreach ($products as $data) {
            $category = Category::firstWhere('slug', $data['category']);
            $brand    = Brand::firstWhere('slug', $data['brand']);

            $product = Product::updateOrCreate(
                ['sku' => $data['sku']],
                [
                    'name'        => $data['name'],
                    'slug'        => Str::slug($data['name']),
                    'barcode'     => $data['barcode'],
                    'selling_price'  => $data['base_price'],
                    'cost_price'     => 0,
                    'category_id' => $category ? $category->id : null,
                    'brand_id'    => $brand ? $brand->id : null,
                    'is_active'   => $data['is_active'],
                ]
            );

            // Create inventory for each shop (distribute stock)
            foreach ($shops as $shop) {
                $stock = $data['stock'] ?? rand(10, 100);
                Inventory::updateOrCreate(
                    ['product_id' => $product->id, 'shop_id' => $shop->id],
                    [
                        'quantity' => $stock,
                        'variation_id' => null
                    ]
                );
            }
        }

        // Generate additional products from the factory to reach a healthy sample size
        $desired = 60;
        $current = Product::count();
        $categories = Category::all();
        $brands = Brand::all();

        if ($current < $desired && $categories->isNotEmpty() && $brands->isNotEmpty() && $shops->isNotEmpty()) {
            Product::factory()->count($desired - $current)->create()->each(function ($product) use ($categories, $brands, $shops) {
                // ensure category and brand associations
                $product->category_id = $product->category_id ?? $categories->random()->id;
                $product->brand_id = $product->brand_id ?? $brands->random()->id;

                // ensure selling price exists
                if (empty($product->selling_price)) {
                    $product->selling_price = max(1, $product->cost_price * 1.3);
                }

                $product->save();

                // create inventory rows for all shops
                foreach ($shops as $shop) {
                    Inventory::updateOrCreate(
                        ['product_id' => $product->id, 'shop_id' => $shop->id],
                        [
                            'quantity' => rand(5, 100),
                            'variation_id' => null
                        ]
                    );
                }
            });
        }
    }
}
