# Complete Seeders Documentation

## Overview

All seeders have been created and updated to work with the multi-tenant RBAC system. This document provides a complete overview of all seeders and their dependencies.

## Seeder Execution Order

The seeders must run in this specific order due to dependencies:

```bash
php artisan db:seed
```

Or run individually:

1. **RolesAndPermissionsSeeder** - Creates roles and permissions
2. **SuperAdminSeeder** - Creates super admin user
3. **BusinessSeeder** - Creates businesses
4. **BranchSeeder** - Creates branches (depends on businesses)
5. **ShopSeeder** - Creates shops (depends on branches)
6. **UserSeeder** - Creates users (depends on businesses, branches, shops)
7. **CategorySeeder** - Creates product categories
8. **BrandSeeder** - Creates product brands
9. **CurrencySeeder** - Creates currencies and denominations
10. **PaymentMethodSeeder** - Creates payment methods
11. **ProductSeeder** - Creates products (depends on categories, brands, shops)
12. **InventorySeeder** - Creates inventory records (depends on products, shops)
13. **CustomerSeeder** - Creates customers (depends on businesses)
14. **SupplierSeeder** - Creates suppliers (depends on businesses)
15. **ScaleSeeder** - Creates scales (depends on shops)

## Seeder Details

### 1. RolesAndPermissionsSeeder
- Creates all roles: `super_admin`, `admin`, `manager`, `employee`, `auditor`
- Creates all permissions and assigns them to roles
- **Dependencies**: None

### 2. SuperAdminSeeder
- Creates super admin user: `superadmin@pos.com` / `SuperAdmin123!`
- **Dependencies**: RolesAndPermissionsSeeder

### 3. BusinessSeeder
- Creates 3 businesses:
  - Cold Store Ghana (COLD_STORE)
  - Tech Hub Laptops (LAPTOP_SHOP)
  - Electronics Plus (ELECTRONICS)
- **Dependencies**: None

### 4. BranchSeeder
- Creates branches for each business
- Main branches and additional branches
- **Dependencies**: BusinessSeeder

### 5. ShopSeeder
- Creates shops for each branch
- Main branches get 2 shops, others get 1
- Creates legacy shops for backward compatibility
- **Dependencies**: BranchSeeder

### 6. UserSeeder
- Creates users for different roles:
  - Business admins
  - Managers
  - Employees
  - Auditor
- Assigns users to businesses, branches, and shops
- **Dependencies**: RolesAndPermissionsSeeder, BusinessSeeder, BranchSeeder, ShopSeeder

### 7. CategorySeeder
- Creates product categories:
  - Phones, Laptops, Smartwatches, Accessories, Clothing, Cold Store, Electronics, Home Appliances
- **Dependencies**: None

### 8. BrandSeeder
- Creates product brands:
  - Apple, Samsung, Dell, Sony, Nike, Adidas, HP, Lenovo, LG
- **Dependencies**: None

### 9. CurrencySeeder
- Creates currencies: USD, EUR, GBP, KES, CAD, AUD, JPY, INR, **GHS**
- Creates denominations for each currency
- **Dependencies**: None

### 10. PaymentMethodSeeder
- Creates payment methods:
  - Cash, Card, Mobile Money, Bank Transfer, Gift Card, Store Credit, Check, Cryptocurrency, Buy Now Pay Later, Loyalty Points
- **Dependencies**: None

### 11. ProductSeeder
- Creates sample products (iPhone 15, Galaxy S24, Dell XPS 13, Nike Running Shoes)
- Generates additional products via factory (up to 60 total)
- Creates inventory for all shops
- **Dependencies**: CategorySeeder, BrandSeeder, ShopSeeder

### 12. InventorySeeder
- Ensures each product has inventory in each shop
- Generates additional inventory records (up to 100 total)
- **Dependencies**: ProductSeeder, ShopSeeder

### 13. CustomerSeeder
- Creates sample customers (John Doe, Jane Smith)
- Generates additional customers via factory (up to 50 total)
- Assigns customers to businesses if business_id field exists
- **Dependencies**: BusinessSeeder

### 14. SupplierSeeder
- Creates sample suppliers (TechSupply Co., FashionHub Ltd.)
- Generates additional suppliers via factory (up to 20 total)
- Assigns suppliers to businesses if business_id field exists
- **Dependencies**: BusinessSeeder

### 15. ScaleSeeder
- Creates 1-2 scales per shop
- **Dependencies**: ShopSeeder

## Multi-Tenant Support

All seeders that create tenant-specific data (products, inventory, customers, suppliers) now:
- Check for required dependencies (businesses, branches, shops)
- Assign data to appropriate tenants
- Distribute data across multiple shops/branches where applicable
- Use `updateOrCreate` to prevent duplicates

## Test Data Created

### Users
- **Super Admin**: superadmin@pos.com / SuperAdmin123!
- **Business Admins**: admin@coldstore.com, admin@laptops.com / password
- **Managers**: manager@coldstore.com / password
- **Employees**: employee@coldstore.com, employee@laptops.com / password
- **Auditor**: auditor@pos.com / password

### Businesses
- Cold Store Ghana (Accra, Kumasi branches)
- Tech Hub Laptops (Kumasi, Accra branches)
- Electronics Plus (Tamale branch)

### Products
- 4 predefined products + up to 56 generated products
- Inventory distributed across all shops

### Other Data
- 8 categories
- 9 brands
- 9 currencies (including GHS)
- 10 payment methods
- 50 customers
- 20 suppliers
- Scales for all shops

## Running Seeders

### Run All Seeders
```bash
cd POSbackend
php artisan db:seed
```

### Run Specific Seeder
```bash
php artisan db:seed --class=ProductSeeder
```

### Reset and Reseed
```bash
php artisan migrate:fresh --seed
```

## Notes

- All passwords are `password` except super admin (`SuperAdmin123!`)
- **Change all passwords in production!**
- Seeders use `updateOrCreate` to prevent duplicates
- Seeders check for dependencies and warn if missing
- Multi-tenant data is properly distributed across businesses/branches/shops
