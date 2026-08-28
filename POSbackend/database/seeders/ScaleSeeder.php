<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Scale;
use App\Models\Shop;

class ScaleSeeder extends Seeder
{
    public function run()
    {
        // Ensure shops exist
        $this->call(ShopSeeder::class);
        
        // Get all shops and create scales for each
        $shops = Shop::all();
        if ($shops->isEmpty()) {
            $this->command->warn('No shops found. Please run ShopSeeder first.');
            return;
        }

        // Create 1-2 scales per shop
        foreach ($shops as $shop) {
            $scaleCount = rand(1, 2);
            Scale::factory()->count($scaleCount)->create([
                'shop_id' => $shop->id
            ]);
        }

        $this->command->info('✅ Scales created successfully!');
        $this->command->info('Created scales for ' . $shops->count() . ' shops');
    }
}
