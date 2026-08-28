<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'branch_id',
        'location',
        'phone',
        'email',
        'is_active',
        'is_main_branch',
        'shop_type',
        'primary_currency',
        'accepted_currencies',
        'currency_settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_main_branch' => 'boolean',
        'accepted_currencies' => 'array',
        'currency_settings' => 'array',
    ];

    /**
     * Get the branch this shop belongs to
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the business through branch
     */
    public function business()
    {
        return $this->branch?->business();
    }

    /**
     * Get the users assigned to this shop
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'shop_user');
    }

    /**
     * Get the primary currency
     */
    public function primaryCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'primary_currency', 'code');
    }

    /**
     * Get the payment methods enabled for this shop
     */
    public function paymentMethods(): BelongsToMany
    {
        return $this->belongsToMany(PaymentMethod::class, 'shop_payment_methods')
            ->withPivot(['is_enabled', 'settings'])
            ->withTimestamps();
    }

    /**
     * Get the enabled payment methods only
     */
    public function enabledPaymentMethods(): BelongsToMany
    {
        return $this->paymentMethods()->wherePivot('is_enabled', true);
    }

    /**
     * Get the products in this shop
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the sales for this shop
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    /**
     * Get the expenses for this shop
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Get the drawer sessions for this shop
     */
    public function drawerSessions(): HasMany
    {
        return $this->hasMany(DrawerSession::class);
    }

    /**
     * Get the cash drawer transactions for this shop
     */
    public function cashDrawerTransactions(): HasMany
    {
        return $this->hasMany(CashDrawerTransaction::class);
    }

    /**
     * Get the scales for this shop
     */
    public function scales(): HasMany
    {
        return $this->hasMany(Scale::class);
    }

    /**
     * Get the inventories for this shop
     */
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    /**
     * Scope for active shops
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for main branch
     */
    public function scopeMainBranch($query)
    {
        return $query->where('is_main_branch', true);
    }

    /**
     * Scope for specific shop type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('shop_type', $type);
    }

    /**
     * Check if shop accepts a specific currency
     */
    public function acceptsCurrency(string $currencyCode): bool
    {
        if ($this->primary_currency === $currencyCode) {
            return true;
        }

        return in_array($currencyCode, $this->accepted_currencies ?? []);
    }

    /**
     * Get all accepted currencies including primary
     */
    public function getAllAcceptedCurrencies(): array
    {
        $currencies = $this->accepted_currencies ?? [];

        if (!in_array($this->primary_currency, $currencies)) {
            array_unshift($currencies, $this->primary_currency);
        }

        return $currencies;
    }

    /**
     * Add accepted currency
     */
    public function addAcceptedCurrency(string $currencyCode): void
    {
        $currencies = $this->accepted_currencies ?? [];

        if (!in_array($currencyCode, $currencies) && $currencyCode !== $this->primary_currency) {
            $currencies[] = $currencyCode;
            $this->update(['accepted_currencies' => $currencies]);
        }
    }

    /**
     * Remove accepted currency
     */
    public function removeAcceptedCurrency(string $currencyCode): void
    {
        if ($currencyCode === $this->primary_currency) {
            throw new \InvalidArgumentException('Cannot remove primary currency');
        }

        $currencies = array_filter(
            $this->accepted_currencies ?? [],
            fn($code) => $code !== $currencyCode
        );

        $this->update(['accepted_currencies' => array_values($currencies)]);
    }

    /**
     * Get currency setting
     */
    public function getCurrencySetting(string $key, $default = null)
    {
        return data_get($this->currency_settings, $key, $default);
    }

    /**
     * Set currency setting
     */
    public function setCurrencySetting(string $key, $value): void
    {
        $settings = $this->currency_settings ?? [];
        data_set($settings, $key, $value);
        $this->update(['currency_settings' => $settings]);
    }

    /**
     * Check if payment method is enabled
     */
    public function isPaymentMethodEnabled(string $methodCode): bool
    {
        return $this->paymentMethods()
            ->where('code', $methodCode)
            ->wherePivot('is_enabled', true)
            ->exists();
    }

    /**
     * Enable payment method
     */
    public function enablePaymentMethod(PaymentMethod $method, array $settings = []): void
    {
        $this->paymentMethods()->syncWithoutDetaching([
            $method->id => [
                'is_enabled' => true,
                'settings' => $settings,
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Disable payment method
     */
    public function disablePaymentMethod(PaymentMethod $method): void
    {
        $this->paymentMethods()->updateExistingPivot($method->id, [
            'is_enabled' => false,
            'updated_at' => now(),
        ]);
    }

    /**
     * Get payment method settings
     */
    public function getPaymentMethodSettings(string $methodCode): array
    {
        $pivot = $this->paymentMethods()
            ->where('code', $methodCode)
            ->first()?->pivot;

        return $pivot?->settings ?? [];
    }

    /**
     * Get the current cash drawer session
     */
    public function getCurrentDrawerSession(): ?DrawerSession
    {
        return $this->drawerSessions()
            ->where('status', 'open')
            ->first();
    }

    /**
     * Get today's sales total
     */
    public function getTodaySalesTotal(): float
    {
        return $this->sales()
            ->whereDate('created_at', today())
            ->where('status', 'completed')
            ->sum('total_amount');
    }

    /**
     * Get sales by payment method for a period
     */
    public function getSalesByPaymentMethod(\Carbon\Carbon $startDate = null, \Carbon\Carbon $endDate = null): array
    {
        $query = $this->sales()->where('status', 'completed');

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $sales = $query->with('payments')->get();

        $breakdown = [];
        foreach ($sales as $sale) {
            foreach ($sale->payments as $payment) {
                $method = $payment->method;
                $breakdown[$method] = ($breakdown[$method] ?? 0) + $payment->amount;
            }
        }

        return $breakdown;
    }

    /**
     * Get currency breakdown for sales
     */
    public function getSalesByCurrency(\Carbon\Carbon $startDate = null, \Carbon\Carbon $endDate = null): array
    {
        $query = $this->sales()->where('status', 'completed');

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        return $query->groupBy('currency')
            ->selectRaw('currency, COUNT(*) as count, SUM(total_amount) as total')
            ->get()
            ->keyBy('currency')
            ->toArray();
    }

    /**
     * Format amount in shop's primary currency
     */
    public function formatAmount(float $amount): string
    {
        $currency = $this->primaryCurrency;

        if ($currency) {
            return $currency->formatAmount($amount);
        }

        return number_format($amount, 2);
    }

    /**
     * Check if this is the main branch
     */
    public function isMainBranch(): bool
    {
        return $this->is_main_branch;
    }

    /**
     * Check if shop is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }
}
