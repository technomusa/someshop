<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Core RBAC setup
            RolesAndPermissionsSeeder::class,
            SuperAdminSeeder::class,
            
            // 2. System configuration (needed before shops)
            CurrencySeeder::class,
            PaymentMethodSeeder::class,
            
            // 3. Multi-tenant structure (Business -> Branch -> Shop)
            BusinessSeeder::class,
            BranchSeeder::class,
            ShopSeeder::class,
            
            // 4. Users with proper tenant assignments
            UserSeeder::class,
            
            // 5. Catalog and inventory
            CategorySeeder::class,
            BrandSeeder::class,
            ProductSeeder::class,
            InventorySeeder::class,
            
            // 6. Customers and suppliers
            CustomerSeeder::class,
            SupplierSeeder::class,
            
            // 7. Other seeders
            ScaleSeeder::class,
            // SaleSeeder::class, // Uncomment if needed
        ]);
    }
}
