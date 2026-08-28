<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * Multi-Tenant Global Scope
 * 
 * Enforces strict data isolation based on user role:
 * - super_admin: sees all data (no filtering)
 * - admin: sees only their business data
 * - manager: sees only their branch data
 * - employee: sees only their shop data
 */
class MultiTenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (!Auth::hasUser()) {
            // No user authenticated - deny all access
            $builder->whereRaw('1 = 0');
            return;
        }

        $user = Auth::user();
        $roleLevel = $user->getRoleLevel();

        // Super admin sees everything
        if ($roleLevel === 'super_admin') {
            return;
        }

        // Apply scoping based on role
        switch ($roleLevel) {
            case 'admin':
                // Admin sees all data in their business
                if ($user->business_id) {
                    $this->scopeByBusiness($builder, $model, $user->business_id);
                } else {
                    // Admin without business_id - deny access (shouldn't happen)
                    $builder->whereRaw('1 = 0');
                }
                break;

            case 'manager':
                // Manager sees all data in their branch
                if ($user->branch_id) {
                    $this->scopeByBranch($builder, $model, $user->branch_id);
                } else {
                    // Manager without branch_id - deny access
                    $builder->whereRaw('1 = 0');
                }
                break;

            case 'employee':
            case 'cashier':
                // Employee and cashier see only their shop data
                if ($user->shop_id) {
                    $this->scopeByShop($builder, $model, $user->shop_id);
                } else {
                    // Employee/cashier without shop_id - deny access
                    $builder->whereRaw('1 = 0');
                }
                break;

            case 'auditor':
                // Auditor sees data based on their business/branch assignment (read-only)
                if ($user->business_id) {
                    $this->scopeByBusiness($builder, $model, $user->business_id);
                } elseif ($user->branch_id) {
                    $this->scopeByBranch($builder, $model, $user->branch_id);
                } else {
                    // Auditor without assignment - deny access
                    $builder->whereRaw('1 = 0');
                }
                break;

            default:
                // Unknown role - deny access
                $builder->whereRaw('1 = 0');
        }
    }

    /**
     * Scope query by business_id
     */
    protected function scopeByBusiness(Builder $builder, Model $model, int $businessId): void
    {
        // Check if model has business_id column
        if ($this->hasColumn($model, 'business_id')) {
            $builder->where('business_id', $businessId);
        } 
        // If model has branch_id, scope through branch
        elseif ($this->hasColumn($model, 'branch_id')) {
            $builder->whereHas('branch', function ($q) use ($businessId) {
                $q->where('business_id', $businessId);
            });
        }
        // If model has shop_id, scope through shop -> branch -> business
        elseif ($this->hasColumn($model, 'shop_id')) {
            $builder->whereHas('shop.branch', function ($q) use ($businessId) {
                $q->where('business_id', $businessId);
            });
        }
    }

    /**
     * Scope query by branch_id
     */
    protected function scopeByBranch(Builder $builder, Model $model, int $branchId): void
    {
        // Check if model has branch_id column
        if ($this->hasColumn($model, 'branch_id')) {
            $builder->where('branch_id', $branchId);
        }
        // If model has shop_id, scope through shop
        elseif ($this->hasColumn($model, 'shop_id')) {
            $builder->whereHas('shop', function ($q) use ($branchId) {
                $q->where('branch_id', $branchId);
            });
        }
    }

    /**
     * Scope query by shop_id
     */
    protected function scopeByShop(Builder $builder, Model $model, int $shopId): void
    {
        if ($this->hasColumn($model, 'shop_id')) {
            $builder->where('shop_id', $shopId);
        }
    }

    /**
     * Check if model has a specific column
     */
    protected function hasColumn(Model $model, string $column): bool
    {
        return in_array($column, $model->getFillable()) || 
               in_array($column, $model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()));
    }
}
