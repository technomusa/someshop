<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Business;
use App\Models\Branch;
use App\Models\Shop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * User Seeder
 * 
 * Creates example users for different roles in the multi-tenant system
 */
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles, businesses, branches, and shops exist
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(BusinessSeeder::class);
        $this->call(BranchSeeder::class);
        $this->call(ShopSeeder::class);

        // Get businesses
        $coldStore = Business::where('code', 'COLD_STORE')->first();
        $laptopShop = Business::where('code', 'LAPTOP_SHOP')->first();
        $electronics = Business::where('code', 'ELECTRONICS')->first();

        // Get branches
        $coldStoreBranch = Branch::where('code', 'CS-ACCRA-001')->first();
        $laptopBranch = Branch::where('code', 'TH-KUMASI-001')->first();

        // Get shops
        $coldStoreShop = Shop::where('code', 'CS-ACCRA-001-SHOP1')->first();
        $laptopShop1 = Shop::where('code', 'TH-KUMASI-001-SHOP1')->first();
        $mainShop = Shop::where('code', 'main-store')->first();

        // Create Admin for Cold Store
        if ($coldStore && $coldStoreBranch) {
            $admin = User::updateOrCreate(
                ['email' => 'admin@coldstore.com'],
                [
                    'name' => 'Cold Store Admin',
                    'password' => Hash::make('password'),
                    'business_id' => $coldStore->id,
                    'branch_id' => null, // Admin can access all branches
                    'shop_id' => null,  // Admin can access all shops
                    'email_verified_at' => now(),
                ]
            );
            $admin->assignRole('admin');
            $this->command->info('Created: admin@coldstore.com (password: password)');
        }

        // Create Manager for Cold Store Branch
        if ($coldStore && $coldStoreBranch && $coldStoreShop) {
            $manager = User::updateOrCreate(
                ['email' => 'manager@coldstore.com'],
                [
                    'name' => 'Cold Store Manager',
                    'password' => Hash::make('password'),
                    'business_id' => $coldStore->id,
                    'branch_id' => $coldStoreBranch->id,
                    'shop_id' => null, // Manager can access all shops in branch
                    'email_verified_at' => now(),
                ]
            );
            $manager->assignRole('manager');
            $this->command->info('Created: manager@coldstore.com (password: password)');
        }

        // Create Employee for Cold Store Shop
        if ($coldStore && $coldStoreBranch && $coldStoreShop) {
            $employee = User::updateOrCreate(
                ['email' => 'employee@coldstore.com'],
                [
                    'name' => 'Cold Store Employee',
                    'password' => Hash::make('password'),
                    'business_id' => $coldStore->id,
                    'branch_id' => $coldStoreBranch->id,
                    'shop_id' => $coldStoreShop->id, // Employee restricted to one shop
                    'email_verified_at' => now(),
                ]
            );
            $employee->assignRole('employee');
            $this->command->info('Created: employee@coldstore.com (password: password)');
        }

        // Create Admin for Laptop Shop
        if ($laptopShop && $laptopBranch) {
            $laptopAdmin = User::updateOrCreate(
                ['email' => 'admin@laptops.com'],
                [
                    'name' => 'Laptop Shop Admin',
                    'password' => Hash::make('password'),
                    'business_id' => $laptopShop->id,
                    'branch_id' => null,
                    'shop_id' => null,
                    'email_verified_at' => now(),
                ]
            );
            $laptopAdmin->assignRole('admin');
            $this->command->info('Created: admin@laptops.com (password: password)');
        }

        // Create Employee for Laptop Shop
        if ($laptopShop && $laptopBranch && $laptopShop1) {
            $laptopEmployee = User::updateOrCreate(
                ['email' => 'employee@laptops.com'],
                [
                    'name' => 'Laptop Shop Employee',
                    'password' => Hash::make('password'),
                    'business_id' => $laptopShop->id,
                    'branch_id' => $laptopBranch->id,
                    'shop_id' => $laptopShop1->id,
                    'email_verified_at' => now(),
                ]
            );
            $laptopEmployee->assignRole('employee');
            $this->command->info('Created: employee@laptops.com (password: password)');
        }

        // Create Auditor
        if ($coldStore) {
            $auditor = User::updateOrCreate(
                ['email' => 'auditor@pos.com'],
                [
                    'name' => 'System Auditor',
                    'password' => Hash::make('password'),
                    'business_id' => $coldStore->id, // Can be assigned to any business
                    'branch_id' => null,
                    'shop_id' => null,
                    'email_verified_at' => now(),
                ]
            );
            $auditor->assignRole('auditor');
            $this->command->info('Created: auditor@pos.com (password: password)');
        }

        // Legacy users (for backward compatibility)
        if ($mainShop) {
            $legacyAdmin = User::updateOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin',
                    'password' => Hash::make('password'),
                    'shop_id' => $mainShop->id,
                    'email_verified_at' => now(),
                ]
            );
            if (!$legacyAdmin->hasRole('admin')) {
                $legacyAdmin->assignRole('admin');
            }
            $this->command->info('Created: admin@example.com (password: password)');
        }

        $this->command->info('');
        $this->command->info('✅ Users created successfully!');
        $this->command->info('All users have password: password');
        $this->command->warn('⚠️  Please change passwords in production!');
    }
}
