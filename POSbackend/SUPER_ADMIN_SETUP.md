# Super Admin Setup Guide

## Quick Setup

Run the seeder to create a super admin user:

```bash
cd POSbackend
php artisan db:seed --class=SuperAdminSeeder
```

Or run all seeders (which includes super admin):

```bash
php artisan db:seed
```

## Default Credentials

After running the seeder, you can login with:

- **Email**: `superadmin@pos.com`
- **Password**: `SuperAdmin123!`

⚠️ **Important**: Change the password immediately after first login!

## What Gets Created

1. **User Account**
   - Name: Super Administrator
   - Email: superadmin@pos.com
   - Role: super_admin
   - Business/Branch/Shop: null (super admin has access to all)

2. **Permissions**
   - Full system access
   - Can create any user (admin, manager, employee, auditor)
   - Can access all businesses, branches, and shops
   - Can manage all settings

## Creating Additional Super Admins

To create additional super admin users, you can:

1. **Via Seeder** (modify SuperAdminSeeder.php)
2. **Via Tinker**:
   ```bash
   php artisan tinker
   ```
   ```php
   $user = App\Models\User::create([
       'name' => 'Another Super Admin',
       'email' => 'admin2@pos.com',
       'password' => Hash::make('YourPassword123!'),
   ]);
   $user->assignRole('super_admin');
   ```

3. **Via API** (if logged in as super admin):
   ```bash
   POST /api/users
   {
       "name": "Another Super Admin",
       "email": "admin2@pos.com",
       "password": "YourPassword123!",
       "password_confirmation": "YourPassword123!",
       "role": "super_admin"
   }
   ```

## Security Notes

- Super admin has access to ALL data across ALL businesses
- Use super admin account only for system administration
- Create business-specific admin accounts for day-to-day operations
- Regularly audit super admin access
