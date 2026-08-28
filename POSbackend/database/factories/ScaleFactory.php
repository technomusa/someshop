<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Scale>
 */
class ScaleFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->company . ' Scale',
            'type' => 'generic',
            'config' => ['port' => '/dev/ttyUSB0', 'baud' => 9600],
            'shop_id' => null,
            'is_active' => $this->faker->boolean(80),
        ];
    }
}
