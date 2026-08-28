<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true); // Generate a 2-word product name
        return [
            'name' => ucfirst($name),
            'slug' => \Illuminate\Support\Str::slug($name),
            'sku' => strtoupper($this->faker->unique()->bothify('??-#####')),
            'barcode' => $this->faker->ean13(),
            'description' => $this->faker->sentence(),
            'category_id' => null,
            'brand_id' => null,
            'cost_price' => $this->faker->randomFloat(2, 5, 500),
            'selling_price' => $this->faker->randomFloat(2, 10, 1000),
            'tax_rate' => 0,
            'type' => 'standard',
            'image' => null,
            'is_active' => true,
            'alert_quantity' => 5,
        ];
    }
}
