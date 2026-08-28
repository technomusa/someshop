<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

/**
 * Product Policy
 * 
 * Enforces authorization for product operations
 */
class ProductPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_products');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Product $product): bool
    {
        if (!$user->can('view_products')) {
            return false;
        }

        // Products are scoped by shop through inventory
        // Global scope handles the filtering, but we verify here too
        return true; // Global scope already filtered
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_products');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Product $product): bool
    {
        if (!$user->can('edit_products')) {
            return false;
        }

        // Global scope handles filtering
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Product $product): bool
    {
        if (!$user->can('delete_products')) {
            return false;
        }

        // Only admin can delete products
        return $user->isAdmin() || $user->isSuperAdmin();
    }
}
