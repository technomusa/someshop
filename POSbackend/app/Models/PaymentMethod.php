<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'icon',
        'requires_breakdown',
        'can_calculate_change',
        'supports_partial_payment',
        'is_active',
        'config',
    ];

    protected $casts = [
        'requires_breakdown' => 'boolean',
        'can_calculate_change' => 'boolean',
        'supports_partial_payment' => 'boolean',
        'is_active' => 'boolean',
        'config' => 'array',
    ];

    /**
     * Get the shops that have enabled this payment method
     */
    public function shops(): BelongsToMany
    {
        return $this->belongsToMany(Shop::class, 'shop_payment_methods')
            ->withPivot(['is_enabled', 'settings'])
            ->withTimestamps();
    }

    /**
     * Get the payments made with this method
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'method', 'code');
    }

    /**
     * Scope for active payment methods
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for methods that require cash breakdown
     */
    public function scopeRequiresBreakdown($query)
    {
        return $query->where('requires_breakdown', true);
    }

    /**
     * Scope for methods that can calculate change
     */
    public function scopeCanCalculateChange($query)
    {
        return $query->where('can_calculate_change', true);
    }

    /**
     * Scope for methods that support partial payments
     */
    public function scopeSupportsPartialPayment($query)
    {
        return $query->where('supports_partial_payment', true);
    }

    /**
     * Check if this method requires cash breakdown
     */
    public function requiresBreakdown(): bool
    {
        return $this->requires_breakdown;
    }

    /**
     * Check if this method can calculate change
     */
    public function canCalculateChange(): bool
    {
        return $this->can_calculate_change;
    }

    /**
     * Check if this method supports partial payments
     */
    public function supportsPartialPayment(): bool
    {
        return $this->supports_partial_payment;
    }

    /**
     * Get the icon class for UI display
     */
    public function getIconClassAttribute(): string
    {
        $iconMap = [
            'banknote' => 'fa-money-bill',
            'credit-card' => 'fa-credit-card',
            'smartphone' => 'fa-mobile-alt',
            'building-2' => 'fa-building',
            'gift' => 'fa-gift',
            'wallet' => 'fa-wallet',
        ];

        return $iconMap[$this->icon] ?? 'fa-payment';
    }

    /**
     * Get configuration value
     */
    public function getConfig(string $key, $default = null)
    {
        return data_get($this->config, $key, $default);
    }

    /**
     * Set configuration value
     */
    public function setConfig(string $key, $value): void
    {
        $config = $this->config ?? [];
        data_set($config, $key, $value);
        $this->config = $config;
    }

    /**
     * Check if method is enabled for a specific shop
     */
    public function isEnabledForShop(Shop $shop): bool
    {
        return $this->shops()
            ->wherePivot('shop_id', $shop->id)
            ->wherePivot('is_enabled', true)
            ->exists();
    }

    /**
     * Get shop-specific settings for this payment method
     */
    public function getShopSettings(Shop $shop): array
    {
        $pivot = $this->shops()
            ->wherePivot('shop_id', $shop->id)
            ->first()?->pivot;

        return $pivot?->settings ?? [];
    }

    /**
     * Enable for shop with optional settings
     */
    public function enableForShop(Shop $shop, array $settings = []): void
    {
        $this->shops()->syncWithoutDetaching([
            $shop->id => [
                'is_enabled' => true,
                'settings' => $settings,
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Disable for shop
     */
    public function disableForShop(Shop $shop): void
    {
        $this->shops()->updateExistingPivot($shop->id, [
            'is_enabled' => false,
            'updated_at' => now(),
        ]);
    }

    /**
     * Get default payment methods configuration
     */
    public static function getDefaults(): array
    {
        return [
            [
                'code' => 'cash',
                'name' => 'Cash',
                'icon' => 'banknote',
                'requires_breakdown' => true,
                'can_calculate_change' => true,
                'supports_partial_payment' => true,
                'is_active' => true,
            ],
            [
                'code' => 'card',
                'name' => 'Credit/Debit Card',
                'icon' => 'credit-card',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => true,
            ],
            [
                'code' => 'mobile_money',
                'name' => 'Mobile Money',
                'icon' => 'smartphone',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => true,
            ],
            [
                'code' => 'bank_transfer',
                'name' => 'Bank Transfer',
                'icon' => 'building-2',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => true,
            ],
            [
                'code' => 'gift_card',
                'name' => 'Gift Card',
                'icon' => 'gift',
                'requires_breakdown' => false,
                'can_calculate_change' => true,
                'supports_partial_payment' => true,
                'is_active' => true,
            ],
            [
                'code' => 'store_credit',
                'name' => 'Store Credit',
                'icon' => 'wallet',
                'requires_breakdown' => false,
                'can_calculate_change' => true,
                'supports_partial_payment' => true,
                'is_active' => true,
            ],
        ];
    }
}
