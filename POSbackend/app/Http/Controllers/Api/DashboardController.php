<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Customer;
use App\Models\User;
use App\Models\DrawerSession;
use App\Models\CashDrawerTransaction;
use App\Models\Currency;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview with multi-currency support
     */
    public function overview(Request $request): JsonResponse
    {
        $user = Auth::user();
        $shopId = $request->input('shop_id', $user->shop_id);

        // Verify user has access to the requested shop
        if (!$user->hasAccessToShop($shopId)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to shop data',
            ], 403);
        }

        $shop = Shop::find($shopId);
        $primaryCurrency = $shop->primary_currency ?? 'USD';
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Basic statistics
        $stats = [
            'today' => [
                'sales_count' => Sale::where('shop_id', $shopId)
                    ->whereDate('created_at', $today)
                    ->where('status', 'completed')
                    ->count(),
                'sales_total' => Sale::where('shop_id', $shopId)
                    ->whereDate('created_at', $today)
                    ->where('status', 'completed')
                    ->sum('total_amount'),
                'currency' => $primaryCurrency,
            ],
            'this_month' => [
                'sales_count' => Sale::where('shop_id', $shopId)
                    ->where('created_at', '>=', $thisMonth)
                    ->where('status', 'completed')
                    ->count(),
                'sales_total' => Sale::where('shop_id', $shopId)
                    ->where('created_at', '>=', $thisMonth)
                    ->where('status', 'completed')
                    ->sum('total_amount'),
                'currency' => $primaryCurrency,
            ],
            'customers_count' => Customer::count(),
            'products_count' => Product::where('shop_id', $shopId)->count(),
        ];

        // Payment method breakdown for today
        $paymentBreakdown = $this->getPaymentMethodBreakdown($shopId, $today, $today->copy()->endOfDay());

        // Currency breakdown
        $currencyBreakdown = $this->getCurrencyBreakdown($shopId, $today, $today->copy()->endOfDay());

        // Recent sales
        $recentSales = Sale::where('shop_id', $shopId)
            ->where('status', 'completed')
            ->with(['customer', 'user', 'payments'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'invoice_number' => $sale->invoice_number,
                    'total_amount' => $sale->total_amount,
                    'currency' => $sale->currency,
                    'formatted_total' => $sale->formatted_total,
                    'customer_name' => $sale->customer?->name ?? 'Walk-in',
                    'cashier_name' => $sale->user?->name,
                    'payment_methods' => $sale->payments->pluck('method')->unique()->values(),
                    'created_at' => $sale->created_at,
                ];
            });

        // Top selling products (today)
        $topProducts = Product::where('shop_id', $shopId)
            ->whereHas('saleItems', function ($query) use ($today) {
                $query->whereHas('sale', function ($q) use ($today) {
                    $q->whereDate('created_at', $today)
                        ->where('status', 'completed');
                });
            })
            ->withSum(['saleItems' => function ($query) use ($today) {
                $query->whereHas('sale', function ($q) use ($today) {
                    $q->whereDate('created_at', $today)
                        ->where('status', 'completed');
                });
            }], 'quantity')
            ->orderBy('sale_items_sum_quantity', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'total_sold' => $product->sale_items_sum_quantity ?? 0,
                    'images' => $product->images ?? [],
                ];
            });

        // Current drawer session info
        $currentDrawerSession = $user->getCurrentDrawerSession();
        $drawerInfo = null;
        if ($currentDrawerSession) {
            $drawerInfo = [
                'id' => $currentDrawerSession->id,
                'started_at' => $currentDrawerSession->started_at,
                'opening_cash' => $currentDrawerSession->opening_cash,
                'currency' => $currentDrawerSession->currency,
                'status' => $currentDrawerSession->status,
                'expected_cash' => $currentDrawerSession->opening_cash + $stats['today']['sales_total'], // Simplified calculation
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'shop' => [
                    'id' => $shop->id,
                    'name' => $shop->name,
                    'primary_currency' => $shop->primary_currency,
                    'accepted_currencies' => $shop->accepted_currencies,
                ],
                'statistics' => $stats,
                'payment_breakdown' => $paymentBreakdown,
                'currency_breakdown' => $currencyBreakdown,
                'recent_sales' => $recentSales,
                'top_products' => $topProducts,
                'drawer_session' => $drawerInfo,
                'generated_at' => now(),
            ],
        ]);
    }

    /**
     * Get sales analytics with currency breakdown
     */
    public function salesAnalytics(Request $request): JsonResponse
    {
        $user = Auth::user();
        $shopId = $request->input('shop_id', $user->shop_id);
        $period = $request->input('period', '7days'); // 7days, 30days, 3months, 1year

        if (!$user->hasAccessToShop($shopId)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to shop data',
            ], 403);
        }

        $startDate = $this->getPeriodStartDate($period);
        $endDate = Carbon::now();

        $shop = Shop::find($shopId);
        $primaryCurrency = $shop->primary_currency ?? 'USD';

        // Sales trend data
        $salesTrend = $this->getSalesTrend($shopId, $startDate, $endDate, $period);

        // Payment method breakdown
        $paymentBreakdown = $this->getPaymentMethodBreakdown($shopId, $startDate, $endDate);

        // Currency breakdown
        $currencyBreakdown = $this->getCurrencyBreakdown($shopId, $startDate, $endDate);

        // Hourly sales pattern (for today only)
        $hourlySales = [];
        if ($period === '1day') {
            $hourlySales = $this->getHourlySalesPattern($shopId, $startDate);
        }

        // Sales by cashier
        $salesByCashier = Sale::where('shop_id', $shopId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->with('user')
            ->selectRaw('user_id, COUNT(*) as sales_count, SUM(total_amount) as total_amount')
            ->groupBy('user_id')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($sale) use ($primaryCurrency) {
                return [
                    'cashier_name' => $sale->user?->name ?? 'Unknown',
                    'sales_count' => $sale->sales_count,
                    'total_amount' => $sale->total_amount,
                    'currency' => $primaryCurrency,
                    'formatted_amount' => Currency::where('code', $primaryCurrency)->first()?->formatAmount($sale->total_amount) ?? number_format($sale->total_amount, 2),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'primary_currency' => $primaryCurrency,
                'sales_trend' => $salesTrend,
                'payment_breakdown' => $paymentBreakdown,
                'currency_breakdown' => $currencyBreakdown,
                'hourly_sales' => $hourlySales,
                'sales_by_cashier' => $salesByCashier,
            ],
        ]);
    }

    /**
     * Get cash flow analytics
     */
    public function cashFlow(Request $request): JsonResponse
    {
        $user = Auth::user();
        $shopId = $request->input('shop_id', $user->shop_id);
        $period = $request->input('period', '30days');

        if (!$user->hasAccessToShop($shopId)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to shop data',
            ], 403);
        }

        $startDate = $this->getPeriodStartDate($period);
        $endDate = Carbon::now();

        $shop = Shop::find($shopId);
        $primaryCurrency = $shop->primary_currency ?? 'USD';

        // Cash drawer transactions
        $cashTransactions = CashDrawerTransaction::where('shop_id', $shopId)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->with('user')
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'formatted_type' => $transaction->formatted_type,
                    'amount' => $transaction->amount,
                    'formatted_amount' => $transaction->formatted_amount,
                    'currency' => $transaction->currency,
                    'net_impact' => $transaction->net_impact,
                    'user_name' => $transaction->user?->name,
                    'notes' => $transaction->notes,
                    'transaction_date' => $transaction->transaction_date,
                    'has_breakdown' => !empty($transaction->cash_breakdown),
                ];
            });

        // Cash flow summary
        $cashSummary = [
            'total_openings' => CashDrawerTransaction::where('shop_id', $shopId)
                ->where('type', 'opening')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount'),
            'total_drops' => CashDrawerTransaction::where('shop_id', $shopId)
                ->where('type', 'drop')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount'),
            'total_withdrawals' => CashDrawerTransaction::where('shop_id', $shopId)
                ->where('type', 'withdrawal')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount'),
            'total_adjustments' => CashDrawerTransaction::where('shop_id', $shopId)
                ->where('type', 'adjustment')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount'),
        ];

        // Drawer sessions summary
        $drawerSessions = DrawerSession::where('shop_id', $shopId)
            ->whereBetween('started_at', [$startDate, $endDate])
            ->with('user')
            ->orderBy('started_at', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'user_name' => $session->user?->name,
                    'started_at' => $session->started_at,
                    'ended_at' => $session->ended_at,
                    'opening_cash' => $session->opening_cash,
                    'closing_cash' => $session->closing_cash,
                    'actual_cash' => $session->actual_cash,
                    'difference' => $session->difference,
                    'currency' => $session->currency,
                    'status' => $session->status,
                    'card_total' => $session->card_total ?? 0,
                    'mobile_money_total' => $session->mobile_money_total ?? 0,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'primary_currency' => $primaryCurrency,
                'cash_transactions' => $cashTransactions,
                'cash_summary' => $cashSummary,
                'drawer_sessions' => $drawerSessions,
            ],
        ]);
    }

    /**
     * Get inventory alerts with multi-shop support
     */
    public function inventoryAlerts(Request $request): JsonResponse
    {
        $user = Auth::user();
        $shopId = $request->input('shop_id', $user->shop_id);

        if (!$user->hasAccessToShop($shopId)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to shop data',
            ], 403);
        }

        $lowStockThreshold = 10; // This should come from shop settings

        $lowStockProducts = Product::where('shop_id', $shopId)
            ->whereHas('inventories', function ($query) use ($lowStockThreshold) {
                $query->where('quantity', '<=', $lowStockThreshold)
                      ->where('quantity', '>', 0);
            })
            ->with(['inventories', 'category'])
            ->get()
            ->map(function ($product) {
                $totalStock = $product->inventories->sum('quantity');
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'category' => $product->category?->name,
                    'current_stock' => $totalStock,
                    'selling_price' => $product->selling_price,
                    'images' => $product->images ?? [],
                    'alert_level' => $totalStock <= 5 ? 'critical' : 'warning',
                ];
            });

        $outOfStockProducts = Product::where('shop_id', $shopId)
            ->whereHas('inventories', function ($query) {
                $query->where('quantity', '<=', 0);
            })
            ->with(['inventories', 'category'])
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'category' => $product->category?->name,
                    'selling_price' => $product->selling_price,
                    'images' => $product->images ?? [],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'low_stock_products' => $lowStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
                'alerts_summary' => [
                    'low_stock_count' => $lowStockProducts->count(),
                    'out_of_stock_count' => $outOfStockProducts->count(),
                    'critical_count' => $lowStockProducts->where('alert_level', 'critical')->count(),
                ],
            ],
        ]);
    }

    /**
     * Get payment method breakdown for a period
     */
    private function getPaymentMethodBreakdown(int $shopId, Carbon $startDate, Carbon $endDate): array
    {
        $payments = Payment::whereHas('sale', function ($query) use ($shopId, $startDate, $endDate) {
            $query->where('shop_id', $shopId)
                  ->whereBetween('created_at', [$startDate, $endDate])
                  ->where('status', 'completed');
        })->get();

        $breakdown = [];
        foreach ($payments as $payment) {
            $method = $payment->method;
            if (!isset($breakdown[$method])) {
                $breakdown[$method] = [
                    'method' => $method,
                    'formatted_method' => $payment->formatted_method,
                    'count' => 0,
                    'total_amount' => 0,
                    'has_cash_breakdown' => false,
                ];
            }

            $breakdown[$method]['count']++;
            $breakdown[$method]['total_amount'] += $payment->amount;

            if ($method === 'cash' && $payment->hasCashBreakdown()) {
                $breakdown[$method]['has_cash_breakdown'] = true;
            }
        }

        return array_values($breakdown);
    }

    /**
     * Get currency breakdown for a period
     */
    private function getCurrencyBreakdown(int $shopId, Carbon $startDate, Carbon $endDate): array
    {
        $sales = Sale::where('shop_id', $shopId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw('currency, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('currency')
            ->get();

        return $sales->map(function ($sale) {
            $currency = Currency::where('code', $sale->currency)->first();
            return [
                'currency' => $sale->currency,
                'currency_name' => $currency?->name ?? $sale->currency,
                'symbol' => $currency?->symbol ?? $sale->currency,
                'count' => $sale->count,
                'total_amount' => $sale->total,
                'formatted_amount' => $currency?->formatAmount($sale->total) ?? number_format($sale->total, 2),
            ];
        })->toArray();
    }

    /**
     * Get sales trend data
     */
    private function getSalesTrend(int $shopId, Carbon $startDate, Carbon $endDate, string $period): array
    {
        $format = $this->getDateFormat($period);

        $sales = Sale::where('shop_id', $shopId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->selectRaw("DATE_FORMAT(created_at, '{$format}') as period, COUNT(*) as count, SUM(total_amount) as total")
            ->groupByRaw("DATE_FORMAT(created_at, '{$format}')")
            ->orderBy('period')
            ->get();

        return $sales->map(function ($sale) {
            return [
                'period' => $sale->period,
                'sales_count' => $sale->count,
                'total_amount' => $sale->total,
            ];
        })->toArray();
    }

    /**
     * Get hourly sales pattern for a specific date
     */
    private function getHourlySalesPattern(int $shopId, Carbon $date): array
    {
        $sales = Sale::where('shop_id', $shopId)
            ->whereDate('created_at', $date)
            ->where('status', 'completed')
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Fill in missing hours with zero values
        $hourlySales = [];
        for ($hour = 0; $hour < 24; $hour++) {
            $saleData = $sales->firstWhere('hour', $hour);
            $hourlySales[] = [
                'hour' => $hour,
                'formatted_hour' => sprintf('%02d:00', $hour),
                'sales_count' => $saleData ? $saleData->count : 0,
                'total_amount' => $saleData ? $saleData->total : 0,
            ];
        }

        return $hourlySales;
    }

    /**
     * Get start date based on period
     */
    private function getPeriodStartDate(string $period): Carbon
    {
        return match ($period) {
            '1day' => Carbon::today(),
            '7days' => Carbon::now()->subDays(7),
            '30days' => Carbon::now()->subDays(30),
            '3months' => Carbon::now()->subMonths(3),
            '1year' => Carbon::now()->subYear(),
            default => Carbon::now()->subDays(7),
        };
    }

    /**
     * Get date format for SQL grouping based on period
     */
    private function getDateFormat(string $period): string
    {
        return match ($period) {
            '1day' => '%Y-%m-%d %H:00:00',
            '7days' => '%Y-%m-%d',
            '30days' => '%Y-%m-%d',
            '3months' => '%Y-%m',
            '1year' => '%Y-%m',
            default => '%Y-%m-%d',
        };
    }
}
