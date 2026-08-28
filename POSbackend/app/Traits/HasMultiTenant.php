<?php

namespace App\Traits;

use App\Models\Scopes\MultiTenantScope;
use Illuminate\Support\Facades\Auth;

/**
 * Trait for models that need multi-tenant scoping
 * 
 * Automatically applies business/branch/shop scoping based on user role
 * and auto-assigns business_id, branch_id, shop_id on creation
 */
trait HasMultiTenant
{
    /**
     * Boot the trait
     */
    protected static function bootHasMultiTenant()
    {
        // Apply global scope for data isolation
        static::addGlobalScope(new MultiTenantScope);

        // Auto-assign tenant IDs on creation
        static::creating(function ($model) {
            if (Auth::hasUser()) {
                $user = Auth::user();
                
                // Auto-assign business_id if not set
                if (empty($model->business_id) && $user->business_id) {
                    $model->business_id = $user->business_id;
                }

                // Auto-assign branch_id if not set
                if (empty($model->branch_id) && $user->branch_id) {
                    $model->branch_id = $user->branch_id;
                }

                // Auto-assign shop_id if not set (for employee-level models)
                if (empty($model->shop_id) && $user->shop_id) {
                    $model->shop_id = $user->shop_id;
                }
            }
        });
    }

    /**
     * Get the business this model belongs to
     */
    public function business()
    {
        return $this->belongsTo(\App\Models\Business::class);
    }

    /**
     * Get the branch this model belongs to
     */
    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class);
    }

    /**
     * Get the shop this model belongs to
     */
    public function shop()
    {
        return $this->belongsTo(\App\Models\Shop::class);
    }
}
