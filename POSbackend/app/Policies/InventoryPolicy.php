<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Inventory;

/**
 * Inventory Policy
 * 
 * Enforces authorization for inventory operations
 */
class InventoryPolicy
{
    /**
     * Determine whether the user can view inventory.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_inventory');
    }

    /**
     * Determine whether the user can view specific inventory.
     */
    public function view(User $user, Inventory $inventory): bool
    {
        if (!$user->can('view_inventory')) {
            return false;
        }

        // Check tenant scoping
        return $this->belongsToUserTenant($user, $inventory);
    }

    /**
     * Determine whether the user can receive stock.
     */
    public function receiveStock(User $user): bool
    {
        return $user->can('receive_stock');
    }

    /**
     * Determine whether the user can adjust stock.
     */
    public function adjustStock(User $user, Inventory $inventory): bool
    {
        if (!$user->can('adjust_stock')) {
            return false;
        }

        return $this->belongsToUserTenant($user, $inventory);
    }

    /**
     * Determine whether the user can transfer stock.
     */
    public function transferStock(User $user, Inventory $inventory): bool
    {
        if (!$user->can('transfer_stock')) {
            return false;
        }

        return $this->belongsToUserTenant($user, $inventory);
    }

    /**
     * Determine whether the user can manage inventory.
     */
    public function manage(User $user): bool
    {
        return $user->can('manage_inventory');
    }

    /**
     * Check if inventory belongs to user's tenant scope
     */
    protected function belongsToUserTenant(User $user, Inventory $inventory): bool
    {
        $roleLevel = $user->getRoleLevel();

        switch ($roleLevel) {
            case 'super_admin':
                return true;

            case 'admin':
                // Admin can see inventory in their business
                return $inventory->shop?->branch?->business_id === $user->business_id;

            case 'manager':
                // Manager can see inventory in their branch
                return $inventory->shop?->branch_id === $user->branch_id;

            case 'employee':
                // Employee can only see inventory in their shop
                return $inventory->shop_id === $user->shop_id;

            default:
                return false;
        }
    }
}
