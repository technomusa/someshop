<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurrencyDenomination extends Model
{
    use HasFactory;

    protected $fillable = [
        'currency_id',
        'value',
        'label',
        'type',
        'color',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:6',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the currency this denomination belongs to
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Scope for active denominations
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for bills only
     */
    public function scopeBills($query)
    {
        return $query->where('type', 'bill');
    }

    /**
     * Scope for coins only
     */
    public function scopeCoins($query)
    {
        return $query->where('type', 'coin');
    }

    /**
     * Scope ordered by value descending
     */
    public function scopeOrderByValue($query, $direction = 'desc')
    {
        return $query->orderBy('value', $direction);
    }

    /**
     * Scope ordered by sort order
     */
    public function scopeOrderBySortOrder($query, $direction = 'asc')
    {
        return $query->orderBy('sort_order', $direction);
    }

    /**
     * Get the color class for UI display
     */
    public function getColorClassAttribute(): string
    {
        $colorMap = [
            'green' => 'bg-green-100 border-green-300 text-green-800',
            'blue' => 'bg-blue-100 border-blue-300 text-blue-800',
            'red' => 'bg-red-100 border-red-300 text-red-800',
            'purple' => 'bg-purple-100 border-purple-300 text-purple-800',
            'orange' => 'bg-orange-100 border-orange-300 text-orange-800',
            'yellow' => 'bg-yellow-100 border-yellow-300 text-yellow-800',
            'gold' => 'bg-yellow-200 border-yellow-400 text-yellow-800',
            'silver' => 'bg-gray-100 border-gray-300 text-gray-800',
            'copper' => 'bg-orange-200 border-orange-400 text-orange-800',
            'brown' => 'bg-amber-100 border-amber-300 text-amber-800',
            'pink' => 'bg-pink-100 border-pink-300 text-pink-800',
        ];

        return $colorMap[$this->color] ?? 'bg-gray-100 border-gray-300 text-gray-800';
    }

    /**
     * Check if this is a bill denomination
     */
    public function isBill(): bool
    {
        return $this->type === 'bill';
    }

    /**
     * Check if this is a coin denomination
     */
    public function isCoin(): bool
    {
        return $this->type === 'coin';
    }

    /**
     * Calculate total value for given count
     */
    public function calculateTotal(int $count): float
    {
        return $this->value * $count;
    }

    /**
     * Format the denomination with currency symbol
     */
    public function getFormattedValueAttribute(): string
    {
        return $this->currency->formatAmount($this->value);
    }
}
