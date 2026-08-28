<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get businesses to assign customers
        $businesses = \App\Models\Business::all();
        if ($businesses->isEmpty()) {
            $this->command->warn('No businesses found. Please run BusinessSeeder first.');
            return;
        }

        $customers = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '555-1234',
                'address' => '123 Main St, City',
                'loyalty_points' => 120,
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'phone' => '555-5678',
                'address' => '456 Oak Ave, Town',
                'loyalty_points' => 45,
            ],
        ];

        foreach ($customers as $data) {
            // Assign to random business if business_id field exists
            $customerData = $data;
            if (in_array('business_id', (new Customer())->getFillable())) {
                $customerData['business_id'] = $businesses->random()->id;
            }
            
            Customer::updateOrCreate(['email' => $data['email']], $customerData);
        }

        // Generate additional customers from factory to reach a sample size
        $desired = 50;
        $current = Customer::count();
        if ($current < $desired) {
            $factory = Customer::factory();
            if (in_array('business_id', (new Customer())->getFillable())) {
                $factory = $factory->count($desired - $current)->create([
                    'business_id' => $businesses->random()->id
                ]);
            } else {
                $factory = $factory->count($desired - $current)->create();
            }
        }
    }
}
