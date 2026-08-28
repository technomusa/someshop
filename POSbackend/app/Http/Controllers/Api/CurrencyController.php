<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\CurrencyDenomination;
use App\Models\ExchangeRateHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class CurrencyController extends Controller
{
    /**
     * Get all currencies with denominations
     */
    public function index(Request $request): JsonResponse
    {
        $query = Currency::with(['denominations' => function ($q) {
            $q->where('is_active', true)->orderBy('sort_order');
        }]);

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $currencies = $query->get();

        return response()->json([
            'success' => true,
            'data' => $currencies->map(function ($currency) {
                return [
                    'id' => $currency->id,
                    'code' => $currency->code,
                    'name' => $currency->name,
                    'symbol' => $currency->symbol,
                    'symbol_position' => $currency->symbol_position,
                    'decimals' => $currency->decimals,
                    'is_active' => $currency->is_active,
                    'exchange_rate' => $currency->exchange_rate,
                    'rate_updated_at' => $currency->rate_updated_at,
                    'denominations' => $currency->denominations->map(function ($denom) {
                        return [
                            'id' => $denom->id,
                            'value' => $denom->value,
                            'label' => $denom->label,
                            'type' => $denom->type,
                            'color' => $denom->color,
                            'sort_order' => $denom->sort_order,
                            'is_active' => $denom->is_active,
                            'color_class' => $denom->color_class,
                            'formatted_value' => $denom->formatted_value,
                        ];
                    }),
                    'quick_amounts' => $currency->getQuickAmounts(),
                    'formatted_sample' => $currency->formatAmount(100),
                ];
            }),
        ]);
    }

    /**
     * Get a specific currency with full details
     */
    public function show(string $code): JsonResponse
    {
        $currency = Currency::with(['denominations', 'bills', 'coins'])
            ->where('code', $code)
            ->first();

        if (!$currency) {
            return response()->json([
                'success' => false,
                'message' => 'Currency not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $currency->id,
                'code' => $currency->code,
                'name' => $currency->name,
                'symbol' => $currency->symbol,
                'symbol_position' => $currency->symbol_position,
                'decimals' => $currency->decimals,
                'is_active' => $currency->is_active,
                'exchange_rate' => $currency->exchange_rate,
                'rate_updated_at' => $currency->rate_updated_at,
                'denominations' => [
                    'bills' => $currency->bills->map(function ($denom) {
                        return [
                            'value' => $denom->value,
                            'label' => $denom->label,
                            'color' => $denom->color,
                            'color_class' => $denom->color_class,
                        ];
                    }),
                    'coins' => $currency->coins->map(function ($denom) {
                        return [
                            'value' => $denom->value,
                            'label' => $denom->label,
                            'color' => $denom->color,
                            'color_class' => $denom->color_class,
                        ];
                    }),
                ],
                'quick_amounts' => $currency->getQuickAmounts(),
                'needs_rate_update' => $currency->needsRateUpdate(),
            ],
        ]);
    }

    /**
     * Create a new currency
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:3|unique:currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'symbol_position' => 'required|in:before,after',
            'decimals' => 'required|integer|min:0|max:6',
            'is_active' => 'boolean',
            'exchange_rate' => 'numeric|min:0',
            'denominations' => 'array',
            'denominations.*.value' => 'required_with:denominations|numeric|min:0',
            'denominations.*.label' => 'required_with:denominations|string|max:20',
            'denominations.*.type' => 'required_with:denominations|in:bill,coin',
            'denominations.*.color' => 'nullable|string|max:20',
            'denominations.*.sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $currency = Currency::create([
            'code' => strtoupper($request->code),
            'name' => $request->name,
            'symbol' => $request->symbol,
            'symbol_position' => $request->symbol_position,
            'decimals' => $request->decimals,
            'is_active' => $request->boolean('is_active', true),
            'exchange_rate' => $request->exchange_rate ?? 1.0,
            'rate_updated_at' => now(),
        ]);

        // Add denominations if provided
        if ($request->has('denominations')) {
            foreach ($request->denominations as $index => $denomData) {
                $currency->denominations()->create([
                    'value' => $denomData['value'],
                    'label' => $denomData['label'],
                    'type' => $denomData['type'],
                    'color' => $denomData['color'] ?? 'gray',
                    'sort_order' => $denomData['sort_order'] ?? $index + 1,
                    'is_active' => true,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Currency created successfully',
            'data' => $currency->load('denominations'),
        ], 201);
    }

    /**
     * Update a currency
     */
    public function update(Request $request, string $code): JsonResponse
    {
        $currency = Currency::where('code', $code)->first();

        if (!$currency) {
            return response()->json([
                'success' => false,
                'message' => 'Currency not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'symbol' => 'string|max:10',
            'symbol_position' => 'in:before,after',
            'decimals' => 'integer|min:0|max:6',
            'is_active' => 'boolean',
            'exchange_rate' => 'numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = $request->only([
            'name', 'symbol', 'symbol_position', 'decimals', 'is_active', 'exchange_rate'
        ]);

        if (isset($updateData['exchange_rate'])) {
            $updateData['rate_updated_at'] = now();
        }

        $currency->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Currency updated successfully',
            'data' => $currency->load('denominations'),
        ]);
    }

    /**
     * Delete a currency
     */
    public function destroy(string $code): JsonResponse
    {
        $currency = Currency::where('code', $code)->first();

        if (!$currency) {
            return response()->json([
                'success' => false,
                'message' => 'Currency not found',
            ], 404);
        }

        // Check if currency is in use
        if ($currency->sales()->exists() || $currency->primaryShops()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete currency that is in use',
            ], 409);
        }

        $currency->delete();

        return response()->json([
            'success' => true,
            'message' => 'Currency deleted successfully',
        ]);
    }

    /**
     * Calculate optimal change breakdown
     */
    public function calculateChange(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3|exists:currencies,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $currency = Currency::where('code', $request->currency)->first();
        $breakdown = $currency->calculateOptimalChange($request->amount);

        return response()->json([
            'success' => true,
            'data' => [
                'amount' => $request->amount,
                'currency' => $currency->code,
                'breakdown' => $breakdown,
                'total_pieces' => array_sum($breakdown),
                'formatted_amount' => $currency->formatAmount($request->amount),
            ],
        ]);
    }

    /**
     * Validate cash breakdown
     */
    public function validateBreakdown(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'breakdown' => 'required|array',
            'expected_amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3|exists:currencies,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $currency = Currency::where('code', $request->currency)->first();
        $denominations = $currency->activeDenominations;

        $calculatedTotal = 0;
        $stats = [
            'total_pieces' => 0,
            'bills' => ['count' => 0, 'value' => 0],
            'coins' => ['count' => 0, 'value' => 0],
        ];

        foreach ($request->breakdown as $value => $count) {
            $denomination = $denominations->firstWhere('value', $value);
            if ($denomination && $count > 0) {
                $total = $denomination->value * $count;
                $calculatedTotal += $total;
                $stats['total_pieces'] += $count;

                if ($denomination->type === 'bill') {
                    $stats['bills']['count'] += $count;
                    $stats['bills']['value'] += $total;
                } else {
                    $stats['coins']['count'] += $count;
                    $stats['coins']['value'] += $total;
                }
            }
        }

        $difference = $calculatedTotal - $request->expected_amount;
        $isValid = abs($difference) < 0.01;

        return response()->json([
            'success' => true,
            'data' => [
                'is_valid' => $isValid,
                'calculated_total' => round($calculatedTotal, 2),
                'expected_amount' => $request->expected_amount,
                'difference' => round($difference, 2),
                'stats' => $stats,
                'formatted_calculated' => $currency->formatAmount($calculatedTotal),
                'formatted_expected' => $currency->formatAmount($request->expected_amount),
            ],
        ]);
    }

    /**
     * Get exchange rates for a currency
     */
    public function getExchangeRates(string $code): JsonResponse
    {
        $currency = Currency::where('code', $code)->first();

        if (!$currency) {
            return response()->json([
                'success' => false,
                'message' => 'Currency not found',
            ], 404);
        }

        $rates = [];
        $allCurrencies = Currency::active()->where('code', '!=', $code)->get();

        foreach ($allCurrencies as $targetCurrency) {
            $rate = $currency->getExchangeRateTo($targetCurrency->code);
            if ($rate) {
                $rates[] = [
                    'to_currency' => $targetCurrency->code,
                    'currency_name' => $targetCurrency->name,
                    'rate' => $rate,
                    'formatted_rate' => "1 {$code} = {$rate} {$targetCurrency->code}",
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'from_currency' => $code,
                'rates' => $rates,
                'last_updated' => $currency->rate_updated_at,
            ],
        ]);
    }

    /**
     * Convert amount between currencies
     */
    public function convert(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'from_currency' => 'required|string|size:3|exists:currencies,code',
            'to_currency' => 'required|string|size:3|exists:currencies,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $fromCurrency = Currency::where('code', $request->from_currency)->first();
        $toCurrency = Currency::where('code', $request->to_currency)->first();

        $convertedAmount = $fromCurrency->convertTo($request->amount, $request->to_currency);

        if ($convertedAmount === null) {
            return response()->json([
                'success' => false,
                'message' => 'Exchange rate not available for this currency pair',
            ], 404);
        }

        $rate = $fromCurrency->getExchangeRateTo($request->to_currency);

        return response()->json([
            'success' => true,
            'data' => [
                'original_amount' => $request->amount,
                'converted_amount' => round($convertedAmount, $toCurrency->decimals),
                'from_currency' => $request->from_currency,
                'to_currency' => $request->to_currency,
                'exchange_rate' => $rate,
                'formatted_original' => $fromCurrency->formatAmount($request->amount),
                'formatted_converted' => $toCurrency->formatAmount($convertedAmount),
            ],
        ]);
    }

    /**
     * Update exchange rates (batch update)
     */
    public function updateExchangeRates(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rates' => 'required|array',
            'rates.*.currency' => 'required|string|size:3|exists:currencies,code',
            'rates.*.rate' => 'required|numeric|min:0',
            'provider' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updatedRates = [];
        $provider = $request->provider ?? 'manual';

        foreach ($request->rates as $rateData) {
            $currency = Currency::where('code', $rateData['currency'])->first();
            if ($currency) {
                $currency->updateExchangeRate($rateData['rate'], $provider);
                $updatedRates[] = [
                    'currency' => $currency->code,
                    'old_rate' => $currency->getOriginal('exchange_rate'),
                    'new_rate' => $rateData['rate'],
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Exchange rates updated successfully',
            'data' => [
                'updated_rates' => $updatedRates,
                'provider' => $provider,
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Get supported currencies list (minimal data)
     */
    public function supported(): JsonResponse
    {
        $currencies = Currency::active()
            ->select(['code', 'name', 'symbol', 'symbol_position', 'decimals'])
            ->get()
            ->map(function ($currency) {
                return [
                    'code' => $currency->code,
                    'name' => $currency->name,
                    'symbol' => $currency->symbol,
                    'symbol_position' => $currency->symbol_position,
                    'decimals' => $currency->decimals,
                    'quick_amounts' => $currency->getQuickAmounts(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $currencies,
        ]);
    }

    /**
     * Get exchange rate history
     */
    public function rateHistory(string $code): JsonResponse
    {
        $currency = Currency::where('code', $code)->first();

        if (!$currency) {
            return response()->json([
                'success' => false,
                'message' => 'Currency not found',
            ], 404);
        }

        $days = request('days', 30);
        $history = ExchangeRateHistory::getHistory('USD', $code, $days);

        return response()->json([
            'success' => true,
            'data' => [
                'currency' => $code,
                'base_currency' => 'USD',
                'days' => $days,
                'history' => $history,
            ],
        ]);
    }
}
