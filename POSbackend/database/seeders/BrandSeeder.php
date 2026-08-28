<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            ['name' => 'Apple',   'slug' => 'apple'],
            ['name' => 'Samsung', 'slug' => 'samsung'],
            ['name' => 'Dell',    'slug' => 'dell'],
            ['name' => 'Sony',    'slug' => 'sony'],
            ['name' => 'Nike',    'slug' => 'nike'],
            ['name' => 'Adidas',  'slug' => 'adidas'],
            ['name' => 'HP',      'slug' => 'hp'],
            ['name' => 'Lenovo',  'slug' => 'lenovo'],
            ['name' => 'LG',      'slug' => 'lg'],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(['slug' => $brand['slug']], $brand);
        }

        $this->command->info('✅ Brands created successfully!');
        $this->command->info('Created: ' . implode(', ', array_column($brands, 'name')));
    }
}
