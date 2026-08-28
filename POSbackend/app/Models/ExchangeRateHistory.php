<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangeRateHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_currency',
        'to_currency',
        'rate',
        'provider',
        'rate_date',
    ];

    protected $casts = [
        'rate' => 'decimal:6',
        'rate_date' => 'datetime',
    ];

    /**
     * Get the from currency
     */
    public function fromCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'from_currency', 'code');
    }

    /**
     * Get the to currency
     */
    public function toCurrency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'to_currency', 'code');
    }

    /**
     * Scope for rates from a specific currency
     */
    public function scopeFromCurrency($query, string $currency)
    {
        return $query->where('from_currency', $currency);
    }

    /**
     * Scope for rates to a specific currency
     */
    public function scopeToCurrency($query, string $currency)
    {
        return $query->where('to_currency', $currency);
    }

    /**
     * Scope for rates by provider
     */
    public function scopeByProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Scope for recent rates
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('rate_date', '>=', now()->subHours($hours));
    }

    /**
     * Scope for latest rates
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('rate_date', 'desc');
    }

    /**
     * Get the latest rate between two currencies
     */
    public static function getLatestRate(string $from, string $to): ?float
    {
        if ($from === $to) {
            return 1.0;
        }

        $rate = static::where('from_currency', $from)
            ->where('to_currency', $to)
            ->latest('rate_date')
            ->value('rate');

        if ($rate) {
            return $rate;
        }

        // Try inverse rate
        $inverseRate = static::where('from_currency', $to)
            ->where('to_currency', $from)
            ->latest('rate_date')
            ->value('rate');

        if ($inverseRate) {
            return 1.0 / $inverseRate;
        }

        return null;
    }

    /**
     * Store exchange rate
     */
    public static function storeRate(string $from, string $to, float $rate, string $provider = null): self
    {
        return static::create([
            'from_currency' => $from,
            'to_currency' => $to,
            'rate' => $rate,
            'provider' => $provider,
            'rate_date' => now(),
        ]);
    }

    /**
     * Get rate history for a currency pair
     */
    public static function getHistory(string $from, string $to, int $days = 30): array
    {
        $rates = static::where('from_currency', $from)
            ->where('to_currency', $to)
            ->where('rate_date', '>=', now()->subDays($days))
            ->orderBy('rate_date')
            ->get(['rate', 'rate_date', 'provider']);

        return $rates->map(function ($rate) {
            return [
                'date' => $rate->rate_date->format('Y-m-d H:i:s'),
                'rate' => $rate->rate,
                'provider' => $rate->provider,
            ];
        })->toArray();
    }

    /**
     * Get average rate over period
     */
    public static function getAverageRate(string $from, string $to, int $days = 7): ?float
    {
        return static::where('from_currency', $from)
            ->where('to_currency', $to)
            ->where('rate_date', '>=', now()->subDays($days))
            ->avg('rate');
    }

    /**
     * Clean old rates (keep only latest per day)
     */
    public static function cleanOldRates(int $keepDays = 90): int
    {
        // Keep the latest rate for each day for each currency pair
        $cutoffDate = now()->subDays($keepDays);

        return static::where('rate_date', '<', $cutoffDate)->delete();
    }

    /**
     * Check if rate is stale
     */
    public function isStale(int $hours = 1): bool
    {
        return $this->rate_date->lt(now()->subHours($hours));
    }

    /**
     * Get formatted rate string
     */
    public function getFormattedRateAttribute(): string
    {
        return "1 {$this->from_currency} = {$this->rate} {$this->to_currency}";
    }

    /**
     * Get inverse rate
     */
    public function getInverseRateAttribute(): float
    {
        return 1.0 / $this->rate;
    }

    /**
     * Convert amount using this rate
     */
    public function convertAmount(float $amount): float
    {
        return $amount * $this->rate;
    }
}
