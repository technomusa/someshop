# Frontend RBAC & Multi-Tenant UI Updates

## Overview

The frontend has been updated to fully integrate with the backend RBAC and multi-tenant system.

## Key Changes

### 1. **Role-Based Navigation (Sidebar)**

**File**: `components/pos/sidebar.jsx`

- Updated to use `getAvailableMenuItems()` from access control utilities
- Menu items are dynamically filtered based on user role and permissions
- Role display shows proper role names (Super Admin, Admin, Manager, Employee, Auditor)
- Management section only visible to super_admin and admin

### 2. **User Management Component**

**File**: `components/settings/user-management.jsx`

- Complete rewrite to work with backend API
- Integrated with React Query for data fetching and mutations
- Role creation rules enforced:
  - Super Admin: can create admin, manager, employee, auditor
  - Admin: can create manager, employee, auditor (NOT admin)
  - Manager: can create employee, auditor (NOT manager)
- Business/Branch/Shop selection based on user role
- Real-time validation and error handling
- Toast notifications for success/error states

### 3. **Users Page**

**File**: `app/(app)/users/page.jsx`

- New page for user management
- Protected with RoleGuard component
- Shows access denied message for unauthorized users

### 4. **Access Control Utilities**

**File**: `lib/access-control.js`

- Already includes all role checking functions
- `canAccess()` - Check module permissions
- `getUserRoleLevel()` - Get user's role level
- `getAvailableMenuItems()` - Get filtered menu items
- `canAccessRoute()` - Check route access

### 5. **Role Guard Component**

**File**: `components/access-control/role-guard.jsx`

- Updated to accept optional `user` prop
- Can be used to conditionally render components based on permissions

### 6. **Layout Updates**

**File**: `app/(app)/layout.jsx`

- Command dialog (⌘K) now shows role-filtered navigation
- Added users page to PAGE_META
- Integrated with access control for navigation filtering

## Usage Examples

### Protecting a Component

```jsx
import { RoleGuard } from "@/components/access-control/role-guard";

<RoleGuard module="inventory" action="manage">
  <InventoryManagement />
</RoleGuard>
```

### Checking Permissions in Code

```jsx
import { canAccess, getUserRoleLevel } from "@/lib/access-control";
import { useSession } from "next-auth/react";

const { data: session } = useSession();
const user = session?.user;

if (canAccess('users', user, 'create')) {
  // Show create user button
}
```

### Getting Role-Filtered Menu Items

```jsx
import { getAvailableMenuItems } from "@/lib/access-control";

const menuItems = getAvailableMenuItems(user);
// Returns only items user can access
```

## API Integration

### User Management Endpoints

- `GET /api/users` - List users (scoped by role)
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/businesses` - Get available businesses
- `GET /api/users/branches?business_id=X` - Get available branches
- `GET /api/users/shops?branch_id=X` - Get available shops

### React Query Integration

All user management operations use React Query for:
- Automatic caching
- Optimistic updates
- Error handling
- Loading states

## Role-Based UI Features

### Menu Visibility

- **Super Admin**: All menus
- **Admin**: All except super admin features
- **Manager**: POS, Products, Inventory, Sales, Reports, Customers, Users (create employees only)
- **Employee**: POS, Sales, Customers
- **Auditor**: Reports, Sales (read-only)

### User Creation Rules

The UI enforces backend rules:
- Cannot create users with same role
- Cannot create users with higher roles
- Role dropdown only shows allowed roles
- Business/Branch/Shop selection based on user's scope

## Testing Checklist

- [ ] Login as different roles and verify menu visibility
- [ ] Test user creation with different roles
- [ ] Verify role creation restrictions work
- [ ] Test business/branch/shop selection
- [ ] Verify route protection works
- [ ] Test permission-based component rendering

## Next Steps

1. Test all role-based features
2. Add more role-specific dashboard variants
3. Implement audit logging UI for auditors
4. Add role-based reporting filters
