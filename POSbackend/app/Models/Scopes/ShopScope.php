<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class ShopScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        if (Auth::hasUser()) {
            $user = Auth::user();
            
            // If super admin, see all (Assuming 'Admin' role means this, or specific permission)
            // Or if user->shop_id is null AND they have high privilege. 
            // Better: If user has 'view all shops' permission or is Super Admin.
            // For now, let's look at their relationships.
            
            // If user has specific active shop context (e.g. from header), use that.
            // But here we are in Global Scope.
            
            // Logic:
            // 1. If user is restricted to shops A, B. Query should be IN (A, B).
            // 2. If user is Admin (no restrictions), do nothing (see all).
            
            if ($user->hasRole('Admin')) {
                 return; // See all
            }
            
            // For regular users (Cashier/Manager), filter by their "Active" shop or "Allowed" shops.
            // The prompt says "user see things only for that shop".
            // If we use $user->shop_id as "Current Active Shop", filter by that.
            
            if ($user->shop_id) {
                $builder->where('shop_id', $user->shop_id);
            } else {
                // If user has no active shop_id but is not Admin, maybe filter by all allowed shops?
                // This handles the "Selection of which shop(s)" requirement.
                // If they haven't picked a context, show data from all their allowed shops.
                $allowedShopIds = $user->shops->pluck('id');
                if ($allowedShopIds->isNotEmpty()) {
                    $builder->whereIn('shop_id', $allowedShopIds);
                } else {
                     // No shops assigned? See nothing (safest)
                     $builder->whereRaw('1 = 0');
                }
            }
        }
    }
}
