<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get businesses to assign suppliers
        $businesses = \App\Models\Business::all();
        if ($businesses->isEmpty()) {
            $this->command->warn('No businesses found. Please run BusinessSeeder first.');
            return;
        }

        $suppliers = [
            [
                'name' => 'TechSupply Co.',
                'email' => 'contact@techsupply.com',
                'phone' => '555-1111',
                'address' => '100 Tech Blvd, Silicon City',
            ],
            [
                'name' => 'FashionHub Ltd.',
                'email' => 'info@fashionhub.com',
                'phone' => '555-2222',
                'address' => '200 Style St, Trendy Town',
            ],
        ];

        foreach ($suppliers as $data) {
            // Assign to random business if business_id field exists
            $supplierData = $data;
            if (in_array('business_id', (new Supplier())->getFillable())) {
                $supplierData['business_id'] = $businesses->random()->id;
            }
            
            Supplier::updateOrCreate(['email' => $data['email']], $supplierData);
        }

        // Generate additional suppliers from factory to reach a sample size
        $desired = 20;
        $current = Supplier::count();
        if ($current < $desired) {
            $factory = Supplier::factory();
            if (in_array('business_id', (new Supplier())->getFillable())) {
                $factory = $factory->count($desired - $current)->create([
                    'business_id' => $businesses->random()->id
                ]);
            } else {
                $factory = $factory->count($desired - $current)->create();
            }
        }
    }
}
