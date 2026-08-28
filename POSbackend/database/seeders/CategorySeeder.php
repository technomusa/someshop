<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Phones', 'slug' => 'phones'],
            ['name' => 'Laptops', 'slug' => 'laptops'],
            ['name' => 'Smartwatches', 'slug' => 'smartwatches'],
            ['name' => 'Accessories', 'slug' => 'accessories'],
            ['name' => 'Clothing', 'slug' => 'clothing'],
            ['name' => 'Cold Store', 'slug' => 'cold-store'],
            ['name' => 'Electronics', 'slug' => 'electronics'],
            ['name' => 'Home Appliances', 'slug' => 'home-appliances'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        $this->command->info('✅ Categories created successfully!');
        $this->command->info('Created: ' . implode(', ', array_column($categories, 'name')));
    }
}
