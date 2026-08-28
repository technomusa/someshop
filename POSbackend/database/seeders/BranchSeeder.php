<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Business;
use App\Models\Branch;

/**
 * Branch Seeder
 * 
 * Creates branches for each business
 */
class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure businesses exist
        $this->call(BusinessSeeder::class);

        $coldStore = Business::where('code', 'COLD_STORE')->first();
        $laptopShop = Business::where('code', 'LAPTOP_SHOP')->first();
        $electronics = Business::where('code', 'ELECTRONICS')->first();

        $branches = [];

        // Cold Store branches
        if ($coldStore) {
            $branches[] = [
                'business_id' => $coldStore->id,
                'name' => 'Accra Main Branch',
                'code' => 'CS-ACCRA-001',
                'location' => 'Accra Central',
                'phone' => '+233 24 123 4567',
                'email' => 'accra@coldstoregh.com',
                'address' => 'Accra Central, Ghana',
                'is_active' => true,
                'is_main_branch' => true,
            ];
            $branches[] = [
                'business_id' => $coldStore->id,
                'name' => 'Kumasi Branch',
                'code' => 'CS-KUMASI-001',
                'location' => 'Kumasi',
                'phone' => '+233 24 123 4568',
                'email' => 'kumasi@coldstoregh.com',
                'address' => 'Kumasi, Ghana',
                'is_active' => true,
                'is_main_branch' => false,
            ];
        }

        // Laptop Shop branches
        if ($laptopShop) {
            $branches[] = [
                'business_id' => $laptopShop->id,
                'name' => 'Kumasi Main Branch',
                'code' => 'TH-KUMASI-001',
                'location' => 'Kumasi Central',
                'phone' => '+233 24 234 5678',
                'email' => 'kumasi@techhublaptops.com',
                'address' => 'Kumasi Central, Ghana',
                'is_active' => true,
                'is_main_branch' => true,
            ];
            $branches[] = [
                'business_id' => $laptopShop->id,
                'name' => 'Accra Branch',
                'code' => 'TH-ACCRA-001',
                'location' => 'Accra',
                'phone' => '+233 24 234 5679',
                'email' => 'accra@techhublaptops.com',
                'address' => 'Accra, Ghana',
                'is_active' => true,
                'is_main_branch' => false,
            ];
        }

        // Electronics branches
        if ($electronics) {
            $branches[] = [
                'business_id' => $electronics->id,
                'name' => 'Tamale Main Branch',
                'code' => 'EP-TAMALE-001',
                'location' => 'Tamale Central',
                'phone' => '+233 24 345 6789',
                'email' => 'tamale@electronicsplus.com',
                'address' => 'Tamale Central, Ghana',
                'is_active' => true,
                'is_main_branch' => true,
            ];
        }

        foreach ($branches as $branchData) {
            Branch::updateOrCreate(
                ['code' => $branchData['code']],
                $branchData
            );
        }

        $this->command->info('✅ Branches created successfully!');
        $this->command->info('Created ' . count($branches) . ' branches');
    }
}
