<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Business;
use Illuminate\Support\Str;

/**
 * Business Seeder
 * 
 * Creates example businesses for the multi-tenant POS system
 */
class BusinessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $businesses = [
            [
                'name' => 'Cold Store Ghana',
                'code' => 'COLD_STORE',
                'slug' => 'cold-store-ghana',
                'email' => 'info@coldstoregh.com',
                'phone' => '+233 24 123 4567',
                'address' => 'Accra, Ghana',
                'tax_id' => 'C123456789',
                'is_active' => true,
            ],
            [
                'name' => 'Tech Hub Laptops',
                'code' => 'LAPTOP_SHOP',
                'slug' => 'tech-hub-laptops',
                'email' => 'info@techhublaptops.com',
                'phone' => '+233 24 234 5678',
                'address' => 'Kumasi, Ghana',
                'tax_id' => 'L987654321',
                'is_active' => true,
            ],
            [
                'name' => 'Electronics Plus',
                'code' => 'ELECTRONICS',
                'slug' => 'electronics-plus',
                'email' => 'info@electronicsplus.com',
                'phone' => '+233 24 345 6789',
                'address' => 'Tamale, Ghana',
                'tax_id' => 'E456789123',
                'is_active' => true,
            ],
        ];

        foreach ($businesses as $businessData) {
            Business::updateOrCreate(
                ['code' => $businessData['code']],
                $businessData
            );
        }

        $this->command->info('✅ Businesses created successfully!');
        $this->command->info('Created: ' . implode(', ', array_column($businesses, 'name')));
    }
}
