<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;

/**
 * Sale Policy
 * 
 * Enforces authorization for sale operations based on:
 * - User role (super_admin, admin, manager, employee)
 * - Tenant scoping (business_id, branch_id, shop_id)
 */
class SalePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_sales');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Sale $sale): bool
    {
        if (!$user->can('view_sales')) {
            return false;
        }

        // Check tenant scoping
        return $this->belongsToUserTenant($user, $sale);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('sell_product');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Sale $sale): bool
    {
        if (!$user->can('sell_product')) {
            return false;
        }

        // Only allow updates if sale is pending and belongs to user's tenant
        return $sale->isPending() && $this->belongsToUserTenant($user, $sale);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Sale $sale): bool
    {
        if (!$user->can('void_sale')) {
            return false;
        }

        // Only allow deletion if sale is pending and belongs to user's tenant
        return $sale->isPending() && $this->belongsToUserTenant($user, $sale);
    }

    /**
     * Determine whether the user can process refund.
     */
    public function refund(User $user, Sale $sale): bool
    {
        if (!$user->can('process_refund')) {
            return false;
        }

        return $this->belongsToUserTenant($user, $sale);
    }

    /**
     * Check if sale belongs to user's tenant scope
     */
    protected function belongsToUserTenant(User $user, Sale $sale): bool
    {
        $roleLevel = $user->getRoleLevel();

        switch ($roleLevel) {
            case 'super_admin':
                return true; // Super admin can see all

            case 'admin':
                // Admin can see sales in their business
                return $sale->business_id === $user->business_id;

            case 'manager':
                // Manager can see sales in their branch
                return $sale->branch_id === $user->branch_id;

            case 'employee':
                // Employee can only see sales in their shop
                return $sale->shop_id === $user->shop_id;

            default:
                return false;
        }
    }
}
