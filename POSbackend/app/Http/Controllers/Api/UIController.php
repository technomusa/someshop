<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Customer;

class UIController extends Controller
{
    /**
     * Get sales and inventory reports
     */
    // public function reports(Request $request)
    // {
    //     try {
    //         $request->validate([
    //             'start' => 'nullable|date',
    //             'end' => 'nullable|date|after_or_equal:start',
    //             'type' => 'nullable|in:sales,inventory,financial'
    //         ]);

    //         $shopId = $request->user()->current_shop_id ?? null;
    //         $startDate = $request->input('start', now()->subDays(30)->toDateString());
    //         $endDate = $request->input('end', now()->toDateString());
    //         $reportType = $request->input('type', 'sales');

    //         $data = [];

    //         if ($reportType === 'sales') {
    //             $data = $this->getSalesReport($shopId, $startDate, $endDate);
    //         } elseif ($reportType === 'inventory') {
    //             $data = $this->getInventoryReport($shopId);
    //         } else {
    //             $data = $this->getFinancialReport($shopId, $startDate, $endDate);
    //         }

    //         return response()->json([
    //             'success' => true,
    //             'data' => $data,
    //             'meta' => [
    //                 'start_date' => $startDate,
    //                 'end_date' => $endDate,
    //                 'type' => $reportType
    //             ]
    //         ]);

    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to generate report',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * Generate sales report data
     */
    private function getSalesReport($shopId, $startDate, $endDate)
    {
        $sales = Sale::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('SUM(discount_amount) as total_discounts')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->when($shopId, fn($q) => $q->where('sales.shop_id', $shopId))
            ->whereBetween('sales.created_at', [$startDate, $endDate])
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(sale_items.quantity) as quantity_sold'),
                DB::raw('SUM(sale_items.quantity * sale_items.unit_price) as revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('quantity_sold')
            ->limit(10)
            ->get();

        return [
            'sales_trend' => $sales,
            'top_products' => $topProducts,
            'summary' => [
                'total_sales' => $sales->sum('total_sales'),
                'total_orders' => $sales->sum('total_orders'),
                'average_order_value' => $sales->avg('total_sales'),
                'total_discounts' => $sales->sum('total_discounts')
            ]
        ];
    }

    /**
     * Generate inventory report data
     */
    private function getInventoryReport($shopId)
    {
        $inventory = \App\Models\Inventory::with(['product', 'product.category'])
            ->when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as current_stock'),
                DB::raw('SUM(quantity * cost_price) as inventory_value')
            )
            ->groupBy('product_id')
            ->get();

        $lowStock = $inventory->filter(fn($item) => $item->current_stock <= $item->product->reorder_level);
        $outOfStock = $inventory->filter(fn($item) => $item->current_stock <= 0);

        return [
            'inventory_summary' => [
                'total_products' => $inventory->count(),
                'total_inventory_value' => $inventory->sum('inventory_value'),
                'low_stock_count' => $lowStock->count(),
                'out_of_stock_count' => $outOfStock->count(),
            ],
            'low_stock_items' => $lowStock->values(),
            'out_of_stock_items' => $outOfStock->values()
        ];
    }

    /**
     * Generate financial report data
     */
    private function getFinancialReport($shopId, $startDate, $endDate)
    {
        $income = \App\Models\Transaction::where('type', 'income')
            ->when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $expenses = \App\Models\Transaction::where('type', 'expense')
            ->when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $profit = $income - $expenses;

        $transactions = \App\Models\Transaction::with('category')
            ->when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->limit(50)
            ->get();

        return [
            'summary' => [
                'total_income' => $income,
                'total_expenses' => $expenses,
                'net_profit' => $profit,
                'profit_margin' => $income > 0 ? ($profit / $income) * 100 : 0
            ],
            'recent_transactions' => $transactions
        ];
    }
    // Return aggregated data for dashboard widgets
    /**
     * Get dashboard statistics and recent data
     */
    public function dashboard(Request $request)
    {
        try {
            $shopId = $request->user()->current_shop_id ?? null;

        $today = now()->startOfDay();
        $endOfToday = now()->endOfDay();

        $totalSalesToday = Sale::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereBetween('created_at', [$today, $endOfToday])
            ->sum('total_amount');

        $totalSalesThisMonth = Sale::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total_amount');

        $recentSales = Sale::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->with(['customer','user'])
            ->latest()
            ->take(5)
            ->get();

        $totalCustomers = Customer::when($shopId, fn($q) => $q->where('shop_id', $shopId))->count();

        // Top products by quantity sold (join sale_items)
        $topProducts = DB::table('sale_items')
            ->select('product_id', DB::raw('SUM(quantity) as qty_sold'))
            ->join('sales','sale_items.sale_id','=','sales.id')
            ->when($shopId, fn($q) => $q->where('sales.shop_id', $shopId))
            ->groupBy('product_id')
            ->orderByDesc('qty_sold')
            ->limit(5)
            ->get();

        // Low stock count
        $lowStockCount = Product::withSum(['inventories' => function($q) use ($shopId) {
                if ($shopId) {
                    $q->where('shop_id', $shopId);
                }
            }], 'quantity')
            ->whereHas('inventories', function($q) use ($shopId) {
                if ($shopId) {
                    $q->where('shop_id', $shopId);
                }
                $q->whereColumn('inventories.quantity', '<=', 'products.reorder_level');
            })
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_sales_today' => $totalSalesToday,
                'total_sales_month' => $totalSalesThisMonth,
                'total_customers' => $totalCustomers,
                'recent_sales' => $recentSales,
                'top_products' => $topProducts,
                'low_stock_count' => $lowStockCount
            ]
        ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Products endpoint for frontend (paginated with inventory sums)
    /**
     * Get paginated products with search and filtering
     */
    /**
     * Get paginated products with search and filtering
     */
    public function products(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:1|max:100',
                'page' => 'sometimes|integer|min:1',
                'q' => 'nullable|string|max:255',
                'category_id' => 'nullable|exists:categories,id',
                'brand_id' => 'nullable|exists:brands,id',
                'in_stock' => 'nullable|boolean',
                'sort_by' => 'nullable|in:name,price,created_at',
                'sort_order' => 'nullable|in:asc,desc'
            ]);

            $perPage = $request->input('per_page', 20);
            $search = $request->input('q');
            $shopId = $request->user()->current_shop_id;

            $query = Product::with(['category', 'brand', 'inventories' => function($q) use ($shopId) {
                if ($shopId) {
                    $q->where('shop_id', $shopId);
                }
            }]);

            // Apply search
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhereHas('category', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
                });
            }

            // Apply filters
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('brand_id')) {
                $query->where('brand_id', $request->brand_id);
            }

            if ($request->boolean('in_stock')) {
                $query->whereHas('inventories', function($q) use ($shopId) {
                    $q->where('quantity', '>', 0);
                    if ($shopId) {
                        $q->where('shop_id', $shopId);
                    }
                });
            }

            // Apply sorting
            $sortBy = $request->input('sort_by', 'name');
            $sortOrder = $request->input('sort_order', 'asc');

            if (in_array($sortBy, ['name', 'price', 'created_at'])) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('name', 'asc');
            }

            $products = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $products->items(),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get paginated customers with search and filtering
     */
    public function customers(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:1|max:100',
                'page' => 'sometimes|integer|min:1',
                'q' => 'nullable|string|max:255',
                'sort_by' => 'nullable|in:name,email,created_at',
                'sort_order' => 'nullable|in:asc,desc'
            ]);

            $perPage = (int) $request->get('per_page', 25);
            $search = $request->input('q');
            $shopId = $request->user()->current_shop_id;

            $query = Customer::when($shopId, function($q) use ($shopId) {
                return $q->where('shop_id', $shopId);
            });

            // Apply search
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $sortBy = $request->input('sort_by', 'name');
            $sortOrder = $request->input('sort_order', 'asc');

            if (in_array($sortBy, ['name', 'email', 'created_at'])) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('name', 'asc');
            }

            $customers = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $customers->items(),
                'meta' => [
                    'current_page' => $customers->currentPage(),
                    'last_page' => $customers->lastPage(),
                    'per_page' => $customers->perPage(),
                    'total' => $customers->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get scales for the current shop
     */
    public function scales(Request $request)
    {
        $shopId = $request->user()->current_shop_id;

        try {
            if (class_exists('\App\\Models\\Scale')) {
                $query = \App\Models\Scale::query();
                if ($shopId) {
                    $query->where('shop_id', $shopId);
                }
                $scales = $query->orderByDesc('is_active')->get();
                return response()->json([
                    'success' => true,
                    'data' => $scales
                ]);
            }
        } catch (\Throwable $e) {
            // Log error and fallback to config
            \Log::error('Failed to fetch scales: ' . $e->getMessage());
        }

        $scales = config('scales.devices', []);
        return response()->json(array_values($scales));
    }

    /**
     * Generate sales, inventory, or financial reports
     */
    public function reports(Request $request)
    {
        try {
            $request->validate([
                'start' => 'nullable|date',
                'end' => 'nullable|date|after_or_equal:start',
                'type' => 'nullable|in:sales,inventory,financial',
                'group_by' => 'nullable|in:day,week,month,year,product,category'
            ]);

            $shopId = $request->user()->current_shop_id;
            $start = $request->get('start') ? now()->parse($request->get('start')) : now()->subDays(30);
            $end = $request->get('end') ? now()->parse($request->get('end'))->endOfDay() : now();
            $type = $request->get('type', 'sales');
            $groupBy = $request->get('group_by', 'day');

            $data = [];

            switch ($type) {
                case 'inventory':
                    $data = $this->getInventoryReport($shopId);
                    break;
                case 'financial':
                    $data = $this->getFinancialReport($shopId, $start, $end);
                    break;
                case 'sales':
                default:
                    $data = $this->getSalesReport($shopId, $start, $end, $groupBy);
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'start_date' => $start->toDateString(),
                    'end_date' => $end->toDateString(),
                    'type' => $type,
                    'group_by' => $groupBy
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report',
                'error' => $e->getMessage()
            ], 500);
        }
        $shopId = $request->user()->current_shop_id ?? null;

        // Sales summary by day
        $byDay = Sale::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
            ->when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereBetween('created_at', [$start, $end])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // Top products in range
        $topProducts = DB::table('sale_items')
            ->select('product_id', DB::raw('SUM(quantity) as qty_sold'), DB::raw('SUM(total_price) as revenue'))
            ->join('sales','sale_items.sale_id','=','sales.id')
            ->when($shopId, fn($q) => $q->where('sales.shop_id', $shopId))
            ->whereBetween('sales.created_at', [$start, $end])
            ->groupBy('product_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        return response()->json([
            'byDay' => $byDay,
            'topProducts' => $topProducts,
        ]);
    }
}
