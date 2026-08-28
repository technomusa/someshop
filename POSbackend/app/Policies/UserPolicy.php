<?php

namespace App\Policies;

use App\Models\User;

/**
 * User Policy
 * 
 * Enforces authorization for user management operations
 * 
 * Rules:
 * - super_admin: Can manage all users
 * - admin: Can create managers and employees for their business
 * - manager: Can create employees for their branch
 * - employee: Cannot create users
 */
class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_users');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        if (!$user->can('view_users')) {
            return false;
        }

        // Check if model belongs to user's tenant scope
        return $this->belongsToUserTenant($user, $model);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_users');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        if (!$user->can('edit_users')) {
            return false;
        }

        // Cannot update super_admin unless you are super_admin
        if ($model->isSuperAdmin() && !$user->isSuperAdmin()) {
            return false;
        }

        return $this->belongsToUserTenant($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        if (!$user->can('delete_users')) {
            return false;
        }

        // Cannot delete yourself
        if ($user->id === $model->id) {
            return false;
        }

        // Cannot delete super_admin unless you are super_admin
        if ($model->isSuperAdmin() && !$user->isSuperAdmin()) {
            return false;
        }

        return $this->belongsToUserTenant($user, $model);
    }

    /**
     * Determine whether the user can assign roles.
     */
    public function assignRole(User $user, User $model, string $role): bool
    {
        if (!$user->can('assign_roles')) {
            return false;
        }

        $roleLevel = $user->getRoleLevel();

        // Super admin can assign any role
        if ($roleLevel === 'super_admin') {
            return true;
        }

        // Admin can assign manager, employee, and auditor roles within their business (NOT admin)
        if ($roleLevel === 'admin') {
            return in_array($role, ['manager', 'employee', 'auditor']) && 
                   $role !== 'admin' &&
                   $this->belongsToUserTenant($user, $model);
        }

        // Manager can assign employee and auditor roles within their branch (NOT manager)
        if ($roleLevel === 'manager') {
            return in_array($role, ['employee', 'auditor']) && 
                   $role !== 'manager' &&
                   $model->branch_id === $user->branch_id;
        }

        return false;
    }

    /**
     * Check if user model belongs to user's tenant scope
     */
    protected function belongsToUserTenant(User $user, User $model): bool
    {
        $roleLevel = $user->getRoleLevel();

        switch ($roleLevel) {
            case 'super_admin':
                return true;

            case 'admin':
                return $model->business_id === $user->business_id;

            case 'manager':
                return $model->branch_id === $user->branch_id;

            case 'employee':
            case 'auditor':
                return false; // Employees and auditors cannot view other users

            default:
                return false;
        }
    }
}
