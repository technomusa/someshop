# RBAC + Multi-Tenant Implementation Guide

## Overview

This document describes the Role-Based Access Control (RBAC) and Multi-Tenant implementation for the POS system.

## Architecture

### Multi-Tenant Structure

```
Business (e.g., Cold Store, Laptop Shop)
  └── Branch (e.g., Accra Branch, Kumasi Branch)
      └── Shop (e.g., Shop 1, Shop 2)
          └── User (Employee)
```

### Roles

1. **super_admin**: Full system access across all businesses
2. **admin**: Business-level administrator (manages ONE business)
3. **manager**: Branch-level manager (manages ONE branch)
4. **employee**: Shop-level employee (restricted to ONE shop)
5. **auditor**: Read-only access for compliance and auditing purposes

## Database Structure

### New Tables

- `businesses`: Top-level business entities
- `branches`: Branches within businesses
- Updated `users`: Added `business_id`, `branch_id` (nullable for admin)
- Updated `shops`: Added `branch_id`
- Updated `sales`: Added `business_id`, `branch_id`

### Migrations

Run migrations in order:
```bash
php artisan migrate
```

### Seeders

Seed roles and permissions:
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

## Backend Implementation

### Global Scopes

**MultiTenantScope** (`app/Models/Scopes/MultiTenantScope.php`)
- Automatically filters queries based on user role
- Employees: `shop_id = user.shop_id`
- Managers: `branch_id = user.branch_id`
- Admins: `business_id = user.business_id`
- Super Admin: No filtering (sees all)

### Models

All models that need scoping should use the `HasMultiTenant` trait:

```php
use App\Traits\HasMultiTenant;

class Sale extends Model
{
    use HasMultiTenant;
    // ...
}
```

### Policies

Authorization policies enforce access control:

- `SalePolicy`: Controls sale access
- `ProductPolicy`: Controls product access
- `UserPolicy`: Controls user management
- `InventoryPolicy`: Controls inventory access

### Middleware

**EnsureRole** middleware validates user roles:
```php
Route::middleware(['auth:sanctum', 'role:admin,manager'])->group(function () {
    // Routes
});
```

### User Management

**UserManagementController** handles user creation with role-based restrictions:

**Role Creation Rules:**
- Users **cannot** create users with roles above their own
- Users **cannot** create users with their own role (only roles beneath)
- **Super Admin**: Can create `admin`, `manager`, `employee`, `auditor` (NOT `super_admin`)
- **Admin**: Can create `manager`, `employee`, `auditor` (NOT `admin`)
- **Manager**: Can create `employee`, `auditor` (NOT `manager`)
- **Auditor**: Cannot create users (read-only)
- **Employee**: Cannot create users

**API Endpoints:**
- `GET /api/users` - List users (scoped by role)
- `POST /api/users` - Create user
- `PUT /api/users/{user}` - Update user
- `DELETE /api/users/{user}` - Delete user
- `GET /api/users/businesses` - Get available businesses
- `GET /api/users/branches` - Get available branches
- `GET /api/users/shops` - Get available shops

## Frontend Implementation

### Access Control Utilities

**`lib/access-control.js`** provides:
- `canAccess(module, user, action)`: Check permission
- `getUserRoleLevel(user)`: Get role level
- `getAvailableMenuItems(user)`: Get accessible menu items
- `canAccessRoute(path, user)`: Check route access

### Role Guard Components

**`components/access-control/role-guard.jsx`**:
```jsx
<RoleGuard module="inventory" action="manage">
  <InventoryManagement />
</RoleGuard>
```

## Usage Examples

### Creating a User (Admin)

```php
// Admin creates a manager for their business
POST /api/users
{
    "name": "John Manager",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "manager",
    "branch_id": 1  // Must belong to admin's business
}
```

### Creating a Sale (Auto-scoping)

When creating a sale, `business_id`, `branch_id`, and `shop_id` are automatically attached:

```php
// SaleController automatically sets:
$sale->business_id = $shop->branch->business_id;
$sale->branch_id = $shop->branch_id;
$sale->shop_id = $user->shop_id;
```

### Querying Data (Automatic Scoping)

```php
// Employee querying sales - automatically filtered to their shop
$sales = Sale::all(); // Only returns sales from user's shop

// Manager querying sales - automatically filtered to their branch
$sales = Sale::all(); // Only returns sales from user's branch
```

## Security Features

1. **Global Query Scoping**: All queries automatically filtered by tenant
2. **Policy Authorization**: Every action checked against policies
3. **Role-Based Middleware**: Routes protected by role requirements
4. **ID Tampering Prevention**: Backend validates all IDs belong to user's scope
5. **Indexed Foreign Keys**: Performance optimized with proper indexes

## Testing

### Feature Tests

Test role access:
```php
$employee = User::factory()->create(['role' => 'employee']);
$sale = Sale::factory()->create(['shop_id' => $employee->shop_id]);

$this->actingAs($employee)
    ->getJson('/api/sales')
    ->assertOk()
    ->assertJsonCount(1, 'data'); // Only sees their shop's sales
```

### Cross-Tenant Leakage Tests

Ensure employees cannot see other shops' data:
```php
$employee1 = User::factory()->create(['shop_id' => 1]);
$employee2 = User::factory()->create(['shop_id' => 2]);

Sale::factory()->create(['shop_id' => 2]);

$this->actingAs($employee1)
    ->getJson('/api/sales')
    ->assertJsonCount(0, 'data'); // Cannot see shop 2's sales
```

## Permissions Matrix

| Permission | Super Admin | Admin | Manager | Employee | Auditor |
|------------|-------------|-------|---------|----------|---------|
| view_pos | ✅ | ✅ | ✅ | ✅ | ❌ |
| sell_product | ✅ | ✅ | ✅ | ✅ | ❌ |
| view_inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| manage_inventory | ✅ | ✅ | ✅ | ❌ | ❌ |
| create_users | ✅ | ✅* | ✅** | ❌ | ❌ |
| view_reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| export_reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| manage_settings | ✅ | ✅ | ❌ | ❌ | ❌ |

*Admins can create: manager, employee, auditor (NOT admin)
**Managers can create: employee, auditor (NOT manager)

## Next Steps

1. Run migrations: `php artisan migrate`
2. Seed roles: `php artisan db:seed --class=RolesAndPermissionsSeeder`
3. Create initial super admin user
4. Test role-based access
5. Configure frontend to use access control utilities

## Notes

- All data isolation happens at the database query level (global scopes)
- Frontend filtering is for UX only - backend enforces security
- Employees MUST have `shop_id` set
- Managers MUST have `branch_id` set
- Admins MUST have `business_id` set
