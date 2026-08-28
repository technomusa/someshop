<?php

namespace Database\Factories;

use App\Models\Inventory;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    public function definition(): array
    {
        return [
            'product_id' => null,
            'variation_id' => null,
            'quantity' => $this->faker->numberBetween(0, 200),
            'shop_id' => null,
        ];
    }
}
