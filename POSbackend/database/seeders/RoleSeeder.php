<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles
        $roles = [
            'Admin',
            'Manager',
            'Cashier',
            'Stock Officer'
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Create Permissions
        $permissions = [
            'view dashboard',
            'manage users',
            'manage products',
            'manage inventory',
            'process sales',
            'view reports',
            'issue refunds',
            'view products'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign Permissions to Roles
        $adminRole = Role::findByName('Admin');
        $adminRole->syncPermissions(Permission::all());

        $managerRole = Role::findByName('Manager');
        $managerRole->syncPermissions(['view dashboard', 'manage products', 'manage inventory', 'view reports', 'process sales', 'issue refunds']);

        $cashierRole = Role::findByName('Cashier');
        $cashierRole->syncPermissions(['process sales', 'view products']);

        $stockRole = Role::findByName('Stock Officer');
        $stockRole->syncPermissions(['manage inventory', 'view products']);

        // Create Shops
        $mainShop = \App\Models\Shop::firstOrCreate([
            'code' => 'HQ001'
        ], [
            'name' => 'Main Branch (Electronics)',
            'location' => 'Downtown (Main St)',
            'is_main_branch' => true,
            'shop_type' => 'Electronics',
            'is_active' => true
        ]);

        $boutiqueShop = \App\Models\Shop::firstOrCreate([
            'code' => 'BQ002'
        ], [
            'name' => 'Boutique (Fashion)',
            'location' => 'Uptown Mall',
            'shop_type' => 'Fashion',
            'is_active' => true
        ]);
        
        $coldStore = \App\Models\Shop::firstOrCreate([
            'code' => 'CS003'
        ], [
            'name' => 'Cold Store (Groceries)',
            'location' => 'Market Side',
            'shop_type' => 'Grocery',
            'is_active' => true
        ]);

        // Create Admin (Global)
        $admin = User::firstOrCreate(
            ['email' => 'admin@pos.com'],
            ['name' => 'Super Admin', 'password' => Hash::make('password')]
        );
        $admin->assignRole('Admin');
        
        // Scenario 1: Electronics Cashier
        $elecCashier = User::firstOrCreate(
            ['email' => 'cashier.elec@pos.com'],
            ['name' => 'Alex Tech', 'password' => Hash::make('password'), 'shop_id' => $mainShop->id]
        );
        $elecCashier->assignRole('Cashier');
        $elecCashier->shops()->sync([$mainShop->id]); // Access only to this shop
        
        // Scenario 2: Boutique Manager
        $boutiqueMgr = User::firstOrCreate(
            ['email' => 'manager.bq@pos.com'],
            ['name' => 'Bella Fashion', 'password' => Hash::make('password'), 'shop_id' => $boutiqueShop->id]
        );
        $boutiqueMgr->assignRole('Manager');
        $boutiqueMgr->shops()->sync([$boutiqueShop->id]);
        
        // Scenario 3: Area Manager (Access to both Boutique and Cold Store)
        $areaMgr = User::firstOrCreate(
            ['email' => 'areamgr@pos.com'],
            ['name' => 'Charlie Overseer', 'password' => Hash::make('password'), 'shop_id' => $boutiqueShop->id] // Default context
        );
        $areaMgr->assignRole('Manager');
        $areaMgr->shops()->sync([$boutiqueShop->id, $coldStore->id]); // Multi-shop access
        
        // Seed Catalog - Electronics
        $apple = \App\Models\Brand::firstOrCreate(['name' => 'Apple', 'slug' => 'apple']);
        $samsung = \App\Models\Brand::firstOrCreate(['name' => 'Samsung', 'slug' => 'samsung']);
        $catPhones = \App\Models\Category::firstOrCreate(['name' => 'Smartphones', 'slug' => 'smartphones']);
        $catLaptops = \App\Models\Category::firstOrCreate(['name' => 'Laptops', 'slug' => 'laptops']);
        
        $iphone = \App\Models\Product::firstOrCreate(['sku' => 'IP15PRO'], [
            'name' => 'iPhone 15 Pro',
            'slug' => 'iphone-15-pro',
            'category_id' => $catPhones->id,
            'brand_id' => $apple->id,
            'selling_price' => 999.00,
            'cost_price' => 850.00,
            'type' => 'standard',
            'is_active' => true
        ]);
        
        // Seed Stock for iPhone at Main Branch
        \App\Models\Inventory::firstOrCreate(
            ['product_id' => $iphone->id, 'shop_id' => $mainShop->id],
            ['quantity' => 50]
        );

        // Seed Catalog - Fashion (Variable Products)
        $nike = \App\Models\Brand::firstOrCreate(['name' => 'Nike', 'slug' => 'nike']);
        $catClothing = \App\Models\Category::firstOrCreate(['name' => 'Clothing', 'slug' => 'clothing']);
        
        $tshirt = \App\Models\Product::firstOrCreate(['sku' => 'NK-TEE-001'], [
            'name' => 'Nike Basic Tee',
            'slug' => 'nike-basic-tee',
            'category_id' => $catClothing->id,
            'brand_id' => $nike->id,
            'selling_price' => 25.00,
            'cost_price' => 10.00,
            'type' => 'variable',
            'is_active' => true
        ]);
        
        // Variations
        $varL = $tshirt->variations()->firstOrCreate(['name' => 'Large / Black'], [
            'sku' => 'NK-TEE-001-L-BLK',
            'additional_price' => 0
        ]);
        $varM = $tshirt->variations()->firstOrCreate(['name' => 'Medium / Black'], [
            'sku' => 'NK-TEE-001-M-BLK',
            'additional_price' => 0
        ]);
        
        // Stock for T-Shirts at Boutique
        \App\Models\Inventory::firstOrCreate(
            ['product_id' => $tshirt->id, 'variation_id' => $varL->id, 'shop_id' => $boutiqueShop->id],
            ['quantity' => 100]
        );
        \App\Models\Inventory::firstOrCreate(
            ['product_id' => $tshirt->id, 'variation_id' => $varM->id, 'shop_id' => $boutiqueShop->id],
            ['quantity' => 80]
        );
        
        // Seed Catalog - Cold Store (Perishables)
        $catDairy = \App\Models\Category::firstOrCreate(['name' => 'Dairy', 'slug' => 'dairy']);
        $milk = \App\Models\Product::firstOrCreate(['sku' => 'MILK-1L'], [
            'name' => 'Fresh Milk 1L',
            'slug' => 'fresh-milk-1l',
            'category_id' => $catDairy->id,
            'selling_price' => 2.50,
            'cost_price' => 1.50,
            'type' => 'perishable',
            'is_active' => true
        ]);
        
        // Batch stock for milk
        // Note: Inventory aggregate needs to be set too
        $milkInv = \App\Models\Inventory::firstOrCreate(
            ['product_id' => $milk->id, 'shop_id' => $coldStore->id],
            ['quantity' => 0]
        );
        
        // Batch 1: Expiring soon
        \App\Models\InventoryBatch::create([
            'product_id' => $milk->id,
            'shop_id' => $coldStore->id,
            'batch_number' => 'BATCH-NOV',
            'quantity' => 20,
            'expiry_date' => now()->addDays(2),
        ]);
        // Batch 2: Fresh
        \App\Models\InventoryBatch::create([
            'product_id' => $milk->id,
            'shop_id' => $coldStore->id,
            'batch_number' => 'BATCH-DEC',
            'quantity' => 50,
            'expiry_date' => now()->addDays(14),
        ]);
        
        $milkInv->quantity = 70;
        $milkInv->save();
    }
}
