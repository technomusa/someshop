<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

/**
 * Roles and Permissions Seeder
 *
 * Creates the RBAC structure for the POS system:
 * - super_admin: Full system access
 * - admin: Business-level access
 * - manager: Branch-level access
 * - employee: Shop-level access
 * - cashier: Shop-level cashier (similar to employee but focused on POS operations)
 * - auditor: Read-only access for auditing purposes
 */
class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            // POS Operations
            'view_pos',
            'sell_product',
            'process_refund',
            'void_sale',

            // Inventory Management
            'view_inventory',
            'manage_inventory',
            'receive_stock',
            'adjust_stock',
            'transfer_stock',

            // Product Management
            'view_products',
            'create_products',
            'edit_products',
            'delete_products',

            // Sales & Reports
            'view_sales',
            'view_reports',
            'export_reports',
            'view_analytics',

            // Customer Management
            'view_customers',
            'create_customers',
            'edit_customers',
            'delete_customers',

            // User Management
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'assign_roles',

            // Business Management
            'view_business',
            'manage_business',
            'view_branches',
            'manage_branches',
            'view_shops',
            'manage_shops',

            // Accounting
            'view_accounting',
            'manage_accounting',
            'open_drawer',
            'close_drawer',
            'view_expenses',
            'manage_expenses',

            // Settings
            'view_settings',
            'manage_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles
        $roles = [
            'super_admin' => [
                'description' => 'Full system access across all businesses',
                'permissions' => ['*'], // All permissions
            ],
            'admin' => [
                'description' => 'Business-level administrator',
                'permissions' => [
                    'view_pos',
                    'sell_product',
                    'process_refund',
                    'view_inventory',
                    'manage_inventory',
                    'receive_stock',
                    'adjust_stock',
                    'transfer_stock',
                    'view_products',
                    'create_products',
                    'edit_products',
                    'delete_products',
                    'view_sales',
                    'view_reports',
                    'export_reports',
                    'view_analytics',
                    'view_customers',
                    'create_customers',
                    'edit_customers',
                    'delete_customers',
                    'view_users',
                    'create_users',
                    'edit_users',
                    'delete_users',
                    'assign_roles',
                    'view_business',
                    'manage_business',
                    'view_branches',
                    'manage_branches',
                    'view_shops',
                    'manage_shops',
                    'view_accounting',
                    'manage_accounting',
                    'open_drawer',
                    'close_drawer',
                    'view_expenses',
                    'manage_expenses',
                    'view_settings',
                    'manage_settings',
                ],
            ],
            'manager' => [
                'description' => 'Branch-level manager',
                'permissions' => [
                    'view_pos',
                    'sell_product',
                    'process_refund',
                    'view_inventory',
                    'manage_inventory',
                    'receive_stock',
                    'adjust_stock',
                    'transfer_stock',
                    'view_products',
                    'create_products',
                    'edit_products',
                    'view_sales',
                    'view_reports',
                    'view_analytics',
                    'view_customers',
                    'create_customers',
                    'edit_customers',
                    'view_users',
                    'create_users', // Can create employees
                    'view_branches',
                    'view_shops',
                    'view_accounting',
                    'open_drawer',
                    'close_drawer',
                    'view_expenses',
                    'manage_expenses',
                ],
            ],
            'employee' => [
                'description' => 'Shop-level employee',
                'permissions' => [
                    'view_pos',
                    'sell_product',
                    'process_refund',
                    'view_inventory',
                    'view_products',
                    'view_sales',
                    'view_customers',
                    'create_customers',
                    'open_drawer',
                    'close_drawer',
                ],
            ],
            'cashier' => [
                'description' => 'Shop-level cashier (focused on POS operations)',
                'permissions' => [
                    'view_pos',
                    'sell_product',
                    'process_refund',
                    'view_products',
                    'view_sales',
                    'view_customers',
                    'create_customers',
                    'open_drawer',
                    'close_drawer',
                ],
            ],
            'auditor' => [
                'description' => 'Read-only auditor for compliance and auditing',
                'permissions' => [
                    'view_sales',
                    'view_reports',
                    'export_reports',
                    'view_analytics',
                    'view_inventory',
                    'view_products',
                    'view_customers',
                    'view_accounting',
                    'view_expenses',
                    'view_business',
                    'view_branches',
                    'view_shops',
                ],
            ],
        ];

        foreach ($roles as $roleName => $roleData) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            if ($roleData['permissions'] === ['*']) {
                // Super admin gets all permissions
                $role->givePermissionTo(Permission::all());
            } else {
                $role->syncPermissions($roleData['permissions']);
            }
        }

        $this->command->info('Roles and permissions created successfully!');
        $this->command->info('Roles: ' . implode(', ', array_keys($roles)));
    }
}
