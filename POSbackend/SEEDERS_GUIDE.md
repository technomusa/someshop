# Database Seeders Guide

## Overview

All seeders have been created and updated to work with the multi-tenant RBAC system. The seeders create a complete test environment with businesses, branches, shops, and users.

## Seeder Execution Order

The seeders are designed to run in a specific order due to dependencies:

1. **RolesAndPermissionsSeeder** - Creates roles and permissions
2. **SuperAdminSeeder** - Creates super admin user
3. **BusinessSeeder** - Creates businesses
4. **BranchSeeder** - Creates branches (depends on businesses)
5. **ShopSeeder** - Creates shops (depends on branches)
6. **UserSeeder** - Creates users (depends on businesses, branches, shops)
7. **Other seeders** - Products, inventory, customers, etc.

## Running Seeders

### Run All Seeders

```bash
cd POSbackend
php artisan db:seed
```

### Run Individual Seeders

```bash
# Create businesses
php artisan db:seed --class=BusinessSeeder

# Create branches
php artisan db:seed --class=BranchSeeder

# Create shops
php artisan db:seed --class=ShopSeeder

# Create users
php artisan db:seed --class=UserSeeder

# Create super admin
php artisan db:seed --class=SuperAdminSeeder
```

## Created Data

### Businesses

1. **Cold Store Ghana** (COLD_STORE)
   - Email: info@coldstoregh.com
   - Location: Accra, Ghana

2. **Tech Hub Laptops** (LAPTOP_SHOP)
   - Email: info@techhublaptops.com
   - Location: Kumasi, Ghana

3. **Electronics Plus** (ELECTRONICS)
   - Email: info@electronicsplus.com
   - Location: Tamale, Ghana

### Branches

Each business has branches:
- **Cold Store**: Accra Main Branch, Kumasi Branch
- **Tech Hub Laptops**: Kumasi Main Branch, Accra Branch
- **Electronics Plus**: Tamale Main Branch

### Shops

Each branch has shops:
- Main branches have 2 shops
- Other branches have 1 shop

### Users Created

#### Super Admin
- Email: superadmin@pos.com
- Password: SuperAdmin123!
- Role: super_admin
- Access: All businesses, branches, shops

#### Business Admins
- Email: admin@coldstore.com
- Password: password
- Role: admin
- Business: Cold Store Ghana

- Email: admin@laptops.com
- Password: password
- Role: admin
- Business: Tech Hub Laptops

#### Managers
- Email: manager@coldstore.com
- Password: password
- Role: manager
- Business: Cold Store Ghana
- Branch: Accra Main Branch

#### Employees
- Email: employee@coldstore.com
- Password: password
- Role: employee
- Business: Cold Store Ghana
- Branch: Accra Main Branch
- Shop: CS-ACCRA-001-SHOP1

- Email: employee@laptops.com
- Password: password
- Role: employee
- Business: Tech Hub Laptops
- Branch: Kumasi Main Branch
- Shop: TH-KUMASI-001-SHOP1

#### Auditor
- Email: auditor@pos.com
- Password: password
- Role: auditor
- Business: Cold Store Ghana
- Access: Read-only

#### Legacy Users
- Email: admin@example.com
- Password: password
- Role: admin
- Shop: main-store (for backward compatibility)

## Testing the System

### 1. Login as Super Admin

```bash
POST /api/login
{
    "email": "superadmin@pos.com",
    "password": "SuperAdmin123!"
}
```

### 2. Login as Business Admin

```bash
POST /api/login
{
    "email": "admin@coldstore.com",
    "password": "password"
}
```

### 3. Login as Manager

```bash
POST /api/login
{
    "email": "manager@coldstore.com",
    "password": "password"
}
```

### 4. Login as Employee

```bash
POST /api/login
{
    "email": "employee@coldstore.com",
    "password": "password"
}
```

### 5. Login as Auditor

```bash
POST /api/login
{
    "email": "auditor@pos.com",
    "password": "password"
}
```

## Resetting the Database

To reset and reseed the database:

```bash
php artisan migrate:fresh --seed
```

Or with specific seeders:

```bash
php artisan migrate:fresh
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan db:seed --class=SuperAdminSeeder
php artisan db:seed --class=BusinessSeeder
php artisan db:seed --class=BranchSeeder
php artisan db:seed --class=ShopSeeder
php artisan db:seed --class=UserSeeder
```

## Seeder Files

- `BusinessSeeder.php` - Creates businesses
- `BranchSeeder.php` - Creates branches for businesses
- `ShopSeeder.php` - Creates shops for branches
- `UserSeeder.php` - Creates users with proper tenant assignments
- `SuperAdminSeeder.php` - Creates super admin user
- `RolesAndPermissionsSeeder.php` - Creates roles and permissions

## Notes

- All passwords are set to `password` except super admin (`SuperAdmin123!`)
- **Change all passwords in production!**
- Users are assigned to appropriate businesses, branches, and shops
- The seeders use `updateOrCreate` to prevent duplicates
- Legacy shops (`main-store`, `outlet`) are created for backward compatibility
