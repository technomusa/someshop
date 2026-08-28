<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'symbol_position',
        'decimals',
        'is_active',
        'exchange_rate',
        'rate_updated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'decimals' => 'integer',
        'exchange_rate' => 'decimal:6',
        'rate_updated_at' => 'datetime',
    ];

    /**
     * Get the currency denominations
     */
    public function denominations(): HasMany
    {
        return $this->hasMany(CurrencyDenomination::class)->orderBy('sort_order');
    }

    /**
     * Get the active denominations
     */
    public function activeDenominations(): HasMany
    {
        return $this->denominations()->where('is_active', true);
    }

    /**
     * Get bills only
     */
    public function bills(): HasMany
    {
        return $this->activeDenominations()->where('type', 'bill')->orderByDesc('value');
    }

    /**
     * Get coins only
     */
    public function coins(): HasMany
    {
        return $this->activeDenominations()->where('type', 'coin')->orderByDesc('value');
    }

    /**
     * Get shops using this currency as primary
     */
    public function primaryShops(): HasMany
    {
        return $this->hasMany(Shop::class, 'primary_currency', 'code');
    }

    /**
     * Get sales in this currency
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'currency', 'code');
    }

    /**
     * Get exchange rate history from this currency
     */
    public function fromExchangeRates(): HasMany
    {
        return $this->hasMany(ExchangeRateHistory::class, 'from_currency', 'code');
    }

    /**
     * Get exchange rate history to this currency
     */
    public function toExchangeRates(): HasMany
    {
        return $this->hasMany(ExchangeRateHistory::class, 'to_currency', 'code');
    }

    /**
     * Format amount according to currency settings
     */
    public function formatAmount($amount): string
    {
        $formatted = number_format($amount, $this->decimals);

        return $this->symbol_position === 'before'
            ? $this->symbol . $formatted
            : $formatted . $this->symbol;
    }

    /**
     * Calculate optimal change breakdown for given amount
     */
    public function calculateOptimalChange($amount): array
    {
        $denominations = $this->activeDenominations()
            ->orderByDesc('value')
            ->get();

        $breakdown = [];
        $remaining = round($amount, $this->decimals);

        foreach ($denominations as $denomination) {
            if ($remaining >= $denomination->value) {
                $count = intval($remaining / $denomination->value);
                $breakdown[$denomination->value] = $count;
                $remaining = round($remaining - ($count * $denomination->value), $this->decimals);
            }
        }

        return $breakdown;
    }

    /**
     * Get exchange rate to another currency
     */
    public function getExchangeRateTo(string $toCurrency): ?float
    {
        if ($this->code === $toCurrency) {
            return 1.0;
        }

        // First try direct rate
        $directRate = ExchangeRateHistory::where('from_currency', $this->code)
            ->where('to_currency', $toCurrency)
            ->latest('rate_date')
            ->value('rate');

        if ($directRate) {
            return $directRate;
        }

        // Try inverse rate
        $inverseRate = ExchangeRateHistory::where('from_currency', $toCurrency)
            ->where('to_currency', $this->code)
            ->latest('rate_date')
            ->value('rate');

        if ($inverseRate) {
            return 1.0 / $inverseRate;
        }

        return null;
    }

    /**
     * Convert amount to another currency
     */
    public function convertTo(float $amount, string $toCurrency): ?float
    {
        $rate = $this->getExchangeRateTo($toCurrency);

        if ($rate === null) {
            return null;
        }

        return $amount * $rate;
    }

    /**
     * Scope for active currencies
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for currencies with recent exchange rates
     */
    public function scopeWithRecentRates($query, $hours = 24)
    {
        return $query->where('rate_updated_at', '>=', now()->subHours($hours));
    }

    /**
     * Get default quick amounts for this currency
     */
    public function getQuickAmounts(): array
    {
        // Default quick amounts based on currency
        $defaults = [
            'USD' => [5, 10, 20, 50, 100],
            'EUR' => [5, 10, 20, 50, 100],
            'GBP' => [5, 10, 20, 50],
            'KES' => [50, 100, 500, 1000],
            'CAD' => [5, 10, 20, 50, 100],
            'AUD' => [5, 10, 20, 50, 100],
            'JPY' => [1000, 5000, 10000],
            'INR' => [50, 100, 500, 2000],
        ];

        return $defaults[$this->code] ?? [10, 20, 50, 100];
    }

    /**
     * Check if currency needs rate update
     */
    public function needsRateUpdate($hours = 1): bool
    {
        if (!$this->rate_updated_at) {
            return true;
        }

        return $this->rate_updated_at->lt(now()->subHours($hours));
    }

    /**
     * Update exchange rate
     */
    public function updateExchangeRate(float $rate, string $provider = null): void
    {
        $this->update([
            'exchange_rate' => $rate,
            'rate_updated_at' => now(),
        ]);

        // Store in history
        ExchangeRateHistory::create([
            'from_currency' => 'USD', // Assuming USD as base
            'to_currency' => $this->code,
            'rate' => $rate,
            'provider' => $provider,
            'rate_date' => now(),
        ]);
    }
}
