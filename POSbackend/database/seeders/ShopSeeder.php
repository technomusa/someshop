<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Shop;

/**
 * Shop Seeder
 * 
 * Creates shops for each branch
 */
class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure currencies exist (needed for primary_currency)
        $this->call(CurrencySeeder::class);
        
        // Ensure branches exist
        $this->call(BranchSeeder::class);

        $shops = [];

        // Get all branches
        $branches = Branch::with('business')->get();

        foreach ($branches as $branch) {
            $businessCode = $branch->business->code ?? 'UNKNOWN';
            
            // Create main shop for each branch
            $shops[] = [
                'branch_id' => $branch->id,
                'name' => $branch->name . ' - Shop 1',
                'code' => $branch->code . '-SHOP1',
                'location' => $branch->location,
                'phone' => $branch->phone,
                'email' => $branch->email,
                'is_active' => true,
                'is_main_branch' => $branch->is_main_branch,
                'shop_type' => $this->getShopTypeFromBusiness($businessCode),
                'primary_currency' => 'GHS',
                'accepted_currencies' => ['GHS', 'USD'],
            ];

            // Create additional shops for main branches
            if ($branch->is_main_branch) {
                $shops[] = [
                    'branch_id' => $branch->id,
                    'name' => $branch->name . ' - Shop 2',
                    'code' => $branch->code . '-SHOP2',
                    'location' => $branch->location,
                    'phone' => $branch->phone,
                    'email' => $branch->email,
                    'is_active' => true,
                    'is_main_branch' => false,
                    'shop_type' => $this->getShopTypeFromBusiness($businessCode),
                    'primary_currency' => 'GHS',
                    'accepted_currencies' => ['GHS', 'USD'],
                ];
            }
        }

        // Also create legacy shops if they don't exist (for backward compatibility)
        $legacyShops = [
            [
                'branch_id' => null,
                'name' => 'Main Store',
                'code' => 'main-store',
                'location' => 'Default Location',
                'is_active' => true,
                'is_main_branch' => true,
                'shop_type' => 'general',
                'primary_currency' => 'GHS',
            ],
            [
                'branch_id' => null,
                'name' => 'Outlet',
                'code' => 'outlet',
                'location' => 'Default Location',
                'is_active' => true,
                'is_main_branch' => false,
                'shop_type' => 'general',
                'primary_currency' => 'GHS',
            ],
        ];

        foreach ($legacyShops as $shopData) {
            $existing = Shop::where('code', $shopData['code'])->first();
            if (!$existing) {
                Shop::create($shopData);
            }
        }

        foreach ($shops as $shopData) {
            Shop::updateOrCreate(
                ['code' => $shopData['code']],
                $shopData
            );
        }

        $this->command->info('✅ Shops created successfully!');
        $this->command->info('Created ' . count($shops) . ' new shops');
    }

    /**
     * Get shop type from business code
     */
    private function getShopTypeFromBusiness(string $businessCode): string
    {
        return match($businessCode) {
            'COLD_STORE' => 'cold-store',
            'LAPTOP_SHOP' => 'laptop-shop',
            'ELECTRONICS' => 'electronics',
            default => 'general',
        };
    }
}
