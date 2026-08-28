<?php

namespace App\Traits;

use App\Models\Scopes\ShopScope;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait HasShop
{
    protected static function bootHasShop()
    {
        static::addGlobalScope(new ShopScope);

        // Auto-assign shop_id on creation if not set and user has one
        static::creating(function ($model) {
            if (Auth::hasUser() && Auth::user()->shop_id && !$model->shop_id) {
                $model->shop_id = Auth::user()->shop_id;
            }
        });
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
