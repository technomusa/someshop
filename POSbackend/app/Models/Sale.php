<?php

namespace App\Models;

use App\Traits\HasMultiTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory, HasMultiTenant;

    protected $fillable = [
        'invoice_number',
        'business_id',
        'branch_id',
        'shop_id',
        'user_id',
        'customer_id',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'currency',
        'payment_breakdown',
        'exchange_rates',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'payment_breakdown' => 'array',
        'exchange_rates' => 'array',
    ];

    /**
     * Sale statuses
     */
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';

    /**
     * Payment statuses
     */
    const PAYMENT_STATUS_UNPAID = 'unpaid';
    const PAYMENT_STATUS_PARTIAL = 'partial';
    const PAYMENT_STATUS_PAID = 'paid';
    const PAYMENT_STATUS_REFUNDED = 'refunded';

    /**
     * Get available sale statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_REFUNDED => 'Refunded',
        ];
    }

    /**
     * Get available payment statuses
     */
    public static function getPaymentStatuses(): array
    {
        return [
            self::PAYMENT_STATUS_UNPAID => 'Unpaid',
            self::PAYMENT_STATUS_PARTIAL => 'Partially Paid',
            self::PAYMENT_STATUS_PAID => 'Paid',
            self::PAYMENT_STATUS_REFUNDED => 'Refunded',
        ];
    }

    /**
     * Get the sale items
     */
    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Get the payments for this sale
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the cashier who processed this sale
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the customer for this sale
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the shop where this sale was made
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the currency used for this sale
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency', 'code');
    }

    /**
     * Scope for completed sales
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for pending sales
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for cancelled sales
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    /**
     * Scope for refunded sales
     */
    public function scopeRefunded($query)
    {
        return $query->where('status', self::STATUS_REFUNDED);
    }

    /**
     * Scope for paid sales
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_PAID);
    }

    /**
     * Scope for unpaid sales
     */
    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', self::PAYMENT_STATUS_UNPAID);
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
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for today's sales
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope for this month's sales
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
               ->whereYear('created_at', now()->year);
    }

    /**
     * Check if sale is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if sale is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if sale is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if sale is refunded
     */
    public function isRefunded(): bool
    {
        return $this->status === self::STATUS_REFUNDED;
    }

    /**
     * Check if sale is fully paid
     */
    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_PAID;
    }

    /**
     * Check if sale is unpaid
     */
    public function isUnpaid(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_UNPAID;
    }

    /**
     * Check if sale has partial payment
     */
    public function hasPartialPayment(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_PARTIAL;
    }

    /**
     * Get total amount paid
     */
    public function getTotalPaidAmount(): float
    {
        return $this->payments()->sum('amount');
    }

    /**
     * Get remaining amount to be paid
     */
    public function getRemainingAmount(): float
    {
        return $this->total_amount - $this->getTotalPaidAmount();
    }

    /**
     * Get payment breakdown summary
     */
    public function getPaymentBreakdownSummary(): array
    {
        if (!$this->payment_breakdown) {
            return [];
        }

        return $this->payment_breakdown;
    }

    /**
     * Get cash payments with breakdown
     */
    public function getCashPayments(): array
    {
        return $this->payments()
            ->where('method', 'cash')
            ->whereNotNull('cash_breakdown')
            ->get()
            ->map(function ($payment) {
                return [
                    'amount' => $payment->amount,
                    'breakdown' => $payment->cash_breakdown,
                    'reference' => $payment->reference_number,
                ];
            })
            ->toArray();
    }

    /**
     * Get exchange rate used for specific currency
     */
    public function getExchangeRate(string $currency): ?float
    {
        if (!$this->exchange_rates) {
            return null;
        }

        return $this->exchange_rates[$currency] ?? null;
    }

    /**
     * Format total amount with currency
     */
    public function getFormattedTotalAttribute(): string
    {
        $currency = $this->currency();

        if ($currency) {
            return $currency->formatAmount($this->total_amount);
        }

        return number_format($this->total_amount, 2);
    }

    /**
     * Mark sale as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'payment_status' => $this->getTotalPaidAmount() >= $this->total_amount
                ? self::PAYMENT_STATUS_PAID
                : self::PAYMENT_STATUS_PARTIAL,
        ]);
    }

    /**
     * Mark sale as cancelled
     */
    public function markAsCancelled(): void
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
    }

    /**
     * Process refund
     */
    public function processRefund(float $amount = null): void
    {
        $refundAmount = $amount ?? $this->total_amount;

        $this->update([
            'status' => self::STATUS_REFUNDED,
            'payment_status' => self::PAYMENT_STATUS_REFUNDED,
        ]);

        // Create refund payment record
        $this->payments()->create([
            'amount' => -$refundAmount,
            'method' => 'refund',
            'transaction_reference' => 'REFUND-' . $this->invoice_number,
        ]);
    }

    /**
     * Add payment to sale
     */
    public function addPayment(string $method, float $amount, array $options = []): Payment
    {
        $payment = $this->payments()->create([
            'method' => $method,
            'amount' => $amount,
            'cash_breakdown' => $options['cash_breakdown'] ?? null,
            'exchange_rate' => $options['exchange_rate'] ?? null,
            'reference_number' => $options['reference'] ?? null,
            'metadata' => $options['metadata'] ?? null,
        ]);

        // Update payment status
        $totalPaid = $this->getTotalPaidAmount();
        if ($totalPaid >= $this->total_amount) {
            $this->update(['payment_status' => self::PAYMENT_STATUS_PAID]);
        } elseif ($totalPaid > 0) {
            $this->update(['payment_status' => self::PAYMENT_STATUS_PARTIAL]);
        }

        return $payment;
    }

    /**
     * Calculate tax amount
     */
    public function calculateTaxAmount(float $taxRate): float
    {
        return ($this->subtotal - $this->discount_amount) * $taxRate;
    }

    /**
     * Update payment breakdown
     */
    public function updatePaymentBreakdown(array $breakdown): void
    {
        $this->update(['payment_breakdown' => $breakdown]);
    }

    /**
     * Update exchange rates used
     */
    public function updateExchangeRates(array $rates): void
    {
        $this->update(['exchange_rates' => $rates]);
    }

    /**
     * Get sale summary for reporting
     */
    public function getSummary(): array
    {
        return [
            'invoice_number' => $this->invoice_number,
            'total_amount' => $this->total_amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'items_count' => $this->items()->count(),
            'payments_count' => $this->payments()->count(),
            'customer_name' => $this->customer?->name,
            'cashier_name' => $this->user?->name,
            'shop_name' => $this->shop?->name,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Calculate change amount for cash payments
     */
    public function calculateChange(): float
    {
        $cashPayments = $this->payments()->where('method', 'cash')->sum('amount');
        return max(0, $cashPayments - $this->total_amount);
    }

    /**
     * Boot method to set up model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sale) {
            if (empty($sale->currency)) {
                $sale->currency = $sale->shop?->primary_currency ?? 'USD';
            }
        });
    }
}
