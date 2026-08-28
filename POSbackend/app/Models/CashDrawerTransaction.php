<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashDrawerTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'user_id',
        'type',
        'amount',
        'currency',
        'cash_breakdown',
        'notes',
        'drawer_session_id',
        'transaction_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'cash_breakdown' => 'array',
        'transaction_date' => 'datetime',
    ];

    /**
     * Transaction types
     */
    const TYPE_OPENING = 'opening';
    const TYPE_CLOSING = 'closing';
    const TYPE_DROP = 'drop';
    const TYPE_WITHDRAWAL = 'withdrawal';
    const TYPE_ADJUSTMENT = 'adjustment';

    /**
     * Get available transaction types
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_OPENING => 'Opening Cash',
            self::TYPE_CLOSING => 'Closing Count',
            self::TYPE_DROP => 'Cash Drop',
            self::TYPE_WITHDRAWAL => 'Cash Withdrawal',
            self::TYPE_ADJUSTMENT => 'Cash Adjustment',
        ];
    }

    /**
     * Get the shop this transaction belongs to
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the user who performed this transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the currency
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency', 'code');
    }

    /**
     * Get the drawer session this transaction belongs to
     */
    public function drawerSession(): BelongsTo
    {
        return $this->belongsTo(DrawerSession::class);
    }

    /**
     * Scope for specific transaction type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for specific shop
     */
    public function scopeForShop($query, int $shopId)
    {
        return $query->where('shop_id', $shopId);
    }

    /**
     * Scope for specific user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for specific currency
     */
    public function scopeForCurrency($query, string $currency)
    {
        return $query->where('currency', $currency);
    }

    /**
     * Scope for date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Scope for today's transactions
     */
    public function scopeToday($query)
    {
        return $query->whereDate('transaction_date', today());
    }

    /**
     * Scope for this week's transactions
     */
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('transaction_date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    /**
     * Scope for this month's transactions
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('transaction_date', now()->month)
               ->whereYear('transaction_date', now()->year);
    }

    /**
     * Check if transaction is cash addition
     */
    public function isCashAddition(): bool
    {
        return in_array($this->type, [self::TYPE_OPENING, self::TYPE_ADJUSTMENT]) && $this->amount > 0;
    }

    /**
     * Check if transaction is cash removal
     */
    public function isCashRemoval(): bool
    {
        return in_array($this->type, [self::TYPE_DROP, self::TYPE_WITHDRAWAL]) ||
               ($this->type === self::TYPE_ADJUSTMENT && $this->amount < 0);
    }

    /**
     * Get formatted transaction type
     */
    public function getFormattedTypeAttribute(): string
    {
        return self::getTypes()[$this->type] ?? $this->type;
    }

    /**
     * Get formatted amount with currency
     */
    public function getFormattedAmountAttribute(): string
    {
        $currencyModel = $this->currency();
        if ($currencyModel) {
            return $currencyModel->formatAmount($this->amount);
        }

        return number_format($this->amount, 2);
    }

    /**
     * Get cash breakdown summary
     */
    public function getCashBreakdownSummary(): array
    {
        if (!$this->cash_breakdown) {
            return [];
        }

        $currency = $this->currency();
        if (!$currency) {
            return [];
        }

        $denominations = $currency->activeDenominations;
        $summary = [];

        foreach ($this->cash_breakdown as $value => $count) {
            if ($count > 0) {
                $denomination = $denominations->firstWhere('value', $value);
                if ($denomination) {
                    $summary[] = [
                        'denomination' => $denomination,
                        'count' => $count,
                        'total' => $denomination->calculateTotal($count),
                    ];
                }
            }
        }

        return $summary;
    }

    /**
     * Calculate total from cash breakdown
     */
    public function calculateBreakdownTotal(): float
    {
        if (!$this->cash_breakdown) {
            return 0.0;
        }

        $total = 0.0;
        foreach ($this->cash_breakdown as $value => $count) {
            $total += (float)$value * (int)$count;
        }

        return $total;
    }

    /**
     * Validate cash breakdown matches amount
     */
    public function validateBreakdown(): bool
    {
        if (!$this->cash_breakdown) {
            return true; // No breakdown to validate
        }

        $calculatedTotal = $this->calculateBreakdownTotal();
        return abs($calculatedTotal - $this->amount) < 0.01; // Allow 1 cent tolerance
    }

    /**
     * Get the net impact on cash drawer
     */
    public function getNetImpactAttribute(): float
    {
        switch ($this->type) {
            case self::TYPE_OPENING:
                return $this->amount;
            case self::TYPE_DROP:
            case self::TYPE_WITHDRAWAL:
                return -$this->amount;
            case self::TYPE_ADJUSTMENT:
                return $this->amount; // Can be positive or negative
            case self::TYPE_CLOSING:
                return 0; // Closing doesn't change drawer, it's just a count
            default:
                return 0;
        }
    }

    /**
     * Create opening transaction
     */
    public static function createOpening(int $shopId, int $userId, float $amount, string $currency = 'USD', array $breakdown = null, int $sessionId = null): self
    {
        return self::create([
            'shop_id' => $shopId,
            'user_id' => $userId,
            'type' => self::TYPE_OPENING,
            'amount' => $amount,
            'currency' => $currency,
            'cash_breakdown' => $breakdown,
            'drawer_session_id' => $sessionId,
            'transaction_date' => now(),
        ]);
    }

    /**
     * Create cash drop transaction
     */
    public static function createDrop(int $shopId, int $userId, float $amount, string $currency = 'USD', array $breakdown = null, string $notes = null): self
    {
        return self::create([
            'shop_id' => $shopId,
            'user_id' => $userId,
            'type' => self::TYPE_DROP,
            'amount' => $amount,
            'currency' => $currency,
            'cash_breakdown' => $breakdown,
            'notes' => $notes,
            'transaction_date' => now(),
        ]);
    }

    /**
     * Create closing transaction
     */
    public static function createClosing(int $shopId, int $userId, float $amount, string $currency = 'USD', array $breakdown = null, int $sessionId = null): self
    {
        return self::create([
            'shop_id' => $shopId,
            'user_id' => $userId,
            'type' => self::TYPE_CLOSING,
            'amount' => $amount,
            'currency' => $currency,
            'cash_breakdown' => $breakdown,
            'drawer_session_id' => $sessionId,
            'transaction_date' => now(),
        ]);
    }

    /**
     * Create adjustment transaction
     */
    public static function createAdjustment(int $shopId, int $userId, float $amount, string $currency = 'USD', string $notes = null, array $breakdown = null): self
    {
        return self::create([
            'shop_id' => $shopId,
            'user_id' => $userId,
            'type' => self::TYPE_ADJUSTMENT,
            'amount' => $amount,
            'currency' => $currency,
            'cash_breakdown' => $breakdown,
            'notes' => $notes,
            'transaction_date' => now(),
        ]);
    }
}
