<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * Super Admin Seeder
 * 
 * Creates a super admin user with full system access
 * 
 * Default Credentials:
 * Email: superadmin@pos.com
 * Password: SuperAdmin123!
 */
class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles are seeded first
        $this->call(RolesAndPermissionsSeeder::class);

        // Check if super admin already exists
        $existingSuperAdmin = User::whereHas('roles', function ($query) {
            $query->where('name', 'super_admin');
        })->first();

        if ($existingSuperAdmin) {
            $this->command->warn('Super admin user already exists. Skipping creation.');
            $this->command->info('Existing super admin: ' . $existingSuperAdmin->email);
            return;
        }

        // Create super admin user
        $superAdmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'superadmin@pos.com',
            'password' => Hash::make('SuperAdmin123!'),
            'business_id' => null, // Super admin doesn't belong to a specific business
            'branch_id' => null,   // Super admin doesn't belong to a specific branch
            'shop_id' => null,     // Super admin doesn't belong to a specific shop
            'email_verified_at' => now(),
        ]);

        // Assign super_admin role
        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $superAdmin->assignRole($superAdminRole);
        }

        $this->command->info('✅ Super Admin created successfully!');
        $this->command->info('');
        $this->command->info('📧 Email: superadmin@pos.com');
        $this->command->info('🔑 Password: SuperAdmin123!');
        $this->command->info('');
        $this->command->warn('⚠️  Please change the password after first login!');
    }
}
