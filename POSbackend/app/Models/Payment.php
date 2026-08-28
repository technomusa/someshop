<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'amount',
        'method',
        'transaction_reference',
        'cash_breakdown',
        'exchange_rate',
        'reference_number',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'cash_breakdown' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Payment methods
     */
    const METHOD_CASH = 'cash';
    const METHOD_CARD = 'card';
    const METHOD_MOBILE_MONEY = 'mobile_money';
    const METHOD_BANK_TRANSFER = 'bank_transfer';
    const METHOD_GIFT_CARD = 'gift_card';
    const METHOD_STORE_CREDIT = 'store_credit';
    const METHOD_REFUND = 'refund';

    /**
     * Get available payment methods
     */
    public static function getMethods(): array
    {
        return [
            self::METHOD_CASH => 'Cash',
            self::METHOD_CARD => 'Credit/Debit Card',
            self::METHOD_MOBILE_MONEY => 'Mobile Money',
            self::METHOD_BANK_TRANSFER => 'Bank Transfer',
            self::METHOD_GIFT_CARD => 'Gift Card',
            self::METHOD_STORE_CREDIT => 'Store Credit',
            self::METHOD_REFUND => 'Refund',
        ];
    }

    /**
     * Get the sale this payment belongs to
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Get the payment method model
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'method', 'code');
    }

    /**
     * Scope for cash payments
     */
    public function scopeCash($query)
    {
        return $query->where('method', self::METHOD_CASH);
    }

    /**
     * Scope for card payments
     */
    public function scopeCard($query)
    {
        return $query->where('method', self::METHOD_CARD);
    }

    /**
     * Scope for mobile money payments
     */
    public function scopeMobileMoney($query)
    {
        return $query->where('method', self::METHOD_MOBILE_MONEY);
    }

    /**
     * Scope for specific payment method
     */
    public function scopeByMethod($query, string $method)
    {
        return $query->where('method', $method);
    }

    /**
     * Scope for payments with cash breakdown
     */
    public function scopeWithCashBreakdown($query)
    {
        return $query->whereNotNull('cash_breakdown');
    }

    /**
     * Check if this is a cash payment
     */
    public function isCash(): bool
    {
        return $this->method === self::METHOD_CASH;
    }

    /**
     * Check if this is a card payment
     */
    public function isCard(): bool
    {
        return $this->method === self::METHOD_CARD;
    }

    /**
     * Check if this is a refund
     */
    public function isRefund(): bool
    {
        return $this->method === self::METHOD_REFUND || $this->amount < 0;
    }

    /**
     * Check if payment has cash breakdown
     */
    public function hasCashBreakdown(): bool
    {
        return !empty($this->cash_breakdown);
    }

    /**
     * Get formatted payment method name
     */
    public function getFormattedMethodAttribute(): string
    {
        return self::getMethods()[$this->method] ?? ucfirst(str_replace('_', ' ', $this->method));
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        $currency = $this->sale?->currency();

        if ($currency) {
            return $currency->formatAmount($this->amount);
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

        $sale = $this->sale;
        if (!$sale || !$sale->currency()) {
            return [];
        }

        $currency = $sale->currency();
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
     * Validate cash breakdown matches payment amount
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
     * Get metadata value
     */
    public function getMetadata(string $key, $default = null)
    {
        return data_get($this->metadata, $key, $default);
    }

    /**
     * Set metadata value
     */
    public function setMetadata(string $key, $value): void
    {
        $metadata = $this->metadata ?? [];
        data_set($metadata, $key, $value);
        $this->metadata = $metadata;
    }

    /**
     * Create cash payment with breakdown
     */
    public static function createCashPayment(Sale $sale, float $amount, array $breakdown = null, string $reference = null): self
    {
        return self::create([
            'sale_id' => $sale->id,
            'method' => self::METHOD_CASH,
            'amount' => $amount,
            'cash_breakdown' => $breakdown,
            'reference_number' => $reference,
        ]);
    }

    /**
     * Create card payment
     */
    public static function createCardPayment(Sale $sale, float $amount, string $reference = null, array $metadata = null): self
    {
        return self::create([
            'sale_id' => $sale->id,
            'method' => self::METHOD_CARD,
            'amount' => $amount,
            'transaction_reference' => $reference,
            'reference_number' => $reference,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Create mobile money payment
     */
    public static function createMobileMoneyPayment(Sale $sale, float $amount, string $reference = null, array $metadata = null): self
    {
        return self::create([
            'sale_id' => $sale->id,
            'method' => self::METHOD_MOBILE_MONEY,
            'amount' => $amount,
            'transaction_reference' => $reference,
            'reference_number' => $reference,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Create refund payment
     */
    public static function createRefund(Sale $sale, float $amount, string $reference = null): self
    {
        return self::create([
            'sale_id' => $sale->id,
            'method' => self::METHOD_REFUND,
            'amount' => -abs($amount), // Ensure negative amount for refunds
            'transaction_reference' => $reference,
            'reference_number' => $reference,
        ]);
    }

    /**
     * Get the change amount for cash payments
     */
    public function getChangeAmount(): float
    {
        if (!$this->isCash()) {
            return 0.0;
        }

        return max(0, $this->amount - $this->sale->total_amount);
    }

    /**
     * Check if this payment covers the full sale amount
     */
    public function coversFullAmount(): bool
    {
        return $this->amount >= $this->sale->total_amount;
    }

    /**
     * Get payment summary for reporting
     */
    public function getSummary(): array
    {
        return [
            'method' => $this->method,
            'formatted_method' => $this->formatted_method,
            'amount' => $this->amount,
            'formatted_amount' => $this->formatted_amount,
            'reference' => $this->reference_number,
            'transaction_reference' => $this->transaction_reference,
            'has_breakdown' => $this->hasCashBreakdown(),
            'exchange_rate' => $this->exchange_rate,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Boot method to set up model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            // Auto-generate reference number if not provided
            if (empty($payment->reference_number) && $payment->isCash()) {
                $payment->reference_number = 'CASH-' . strtoupper(substr(uniqid(), -8));
            }
        });

        static::created(function ($payment) {
            // Validate cash breakdown after creation
            if ($payment->isCash() && $payment->cash_breakdown && !$payment->validateBreakdown()) {
                \Log::warning("Payment {$payment->id} has invalid cash breakdown", [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount,
                    'breakdown' => $payment->cash_breakdown,
                    'calculated_total' => $payment->calculateBreakdownTotal(),
                ]);
            }
        });
    }
}
