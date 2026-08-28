<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\Currency;
use App\Models\DrawerSession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ShopContextController extends Controller
{
    /**
     * Get available shops for the current user with currency information
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $shopsQuery = $user->hasRole('Admin')
            ? Shop::query()
            : $user->shops();

        $shops = $shopsQuery->with([
            'primaryCurrency:code,name,symbol,symbol_position,decimals',
            'paymentMethods' => function ($query) {
                $query->where('shop_payment_methods.is_enabled', true)
                      ->select('payment_methods.*', 'shop_payment_methods.settings');
            }
        ])->get();

        $shopsData = $shops->map(function ($shop) use ($user) {
            $primaryCurrency = Currency::where('code', $shop->primary_currency)->first();

            return [
                'id' => $shop->id,
                'name' => $shop->name,
                'code' => $shop->code,
                'location' => $shop->location,
                'phone' => $shop->phone,
                'email' => $shop->email,
                'is_active' => $shop->is_active,
                'is_current' => $shop->id === $user->shop_id,
                'primary_currency' => $primaryCurrency ? [
                    'code' => $primaryCurrency->code,
                    'name' => $primaryCurrency->name,
                    'symbol' => $primaryCurrency->symbol,
                    'symbol_position' => $primaryCurrency->symbol_position,
                    'decimals' => $primaryCurrency->decimals,
                ] : null,
                'accepted_currencies' => $shop->accepted_currencies ?? [$shop->primary_currency],
                'currency_settings' => $shop->currency_settings,
                'enabled_payment_methods' => $shop->paymentMethods->map(function ($pm) {
                    return [
                        'id' => $pm->id,
                        'code' => $pm->code,
                        'name' => $pm->name,
                        'icon' => $pm->icon,
                        'requires_breakdown' => $pm->requires_breakdown,
                        'can_calculate_change' => $pm->can_calculate_change,
                        'supports_partial_payment' => $pm->supports_partial_payment,
                    ];
                }),
                'user_role' => $user->getRoleNames()->first() ?? 'Cashier',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'shops' => $shopsData,
                'current_shop_id' => $user->shop_id,
            ],
        ]);
    }

    /**
     * Switch active shop context with validation
     */
    public function switchShop(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'shop_id' => 'required|exists:shops,id',
                'force' => 'boolean',
            ]);

            $user = $request->user();
            $shopId = $validated['shop_id'];
            $force = $validated['force'] ?? false;

            // Authorization: Can this user access this shop?
            $hasAccess = $user->hasRole('Admin') || $user->shops()->where('shops.id', $shopId)->exists();

            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this shop.',
                ], 403);
            }

            // Check if user has an open drawer session
            if (!$force && $user->shop_id !== $shopId) {
                $openSession = DrawerSession::where('user_id', $user->id)
                    ->where('shop_id', $user->shop_id)
                    ->where('status', 'open')
                    ->first();

                if ($openSession) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You have an open drawer session. Please close it before switching shops.',
                        'requires_confirmation' => true,
                        'open_session' => [
                            'id' => $openSession->id,
                            'started_at' => $openSession->started_at,
                            'opening_cash' => $openSession->opening_cash,
                        ],
                    ], 409);
                }
            }

            // Update user's shop context
            $user->shop_id = $shopId;
            $user->save();

            // Load complete shop data
            $shop = Shop::with([
                'currency:code,name,symbol,symbol_position,decimals',
                'paymentMethods' => function ($query) {
                    $query->where('shop_payment_methods.is_enabled', true);
                }
            ])->find($shopId);

            $primaryCurrency = Currency::where('code', $shop->primary_currency)->first();

            return response()->json([
                'success' => true,
                'message' => 'Shop context switched successfully',
                'data' => [
                    'user' => $user->toApiResponse(),
                    'shop' => [
                        'id' => $shop->id,
                        'name' => $shop->name,
                        'code' => $shop->code,
                        'location' => $shop->location,
                        'primary_currency' => $primaryCurrency ? [
                            'code' => $primaryCurrency->code,
                            'name' => $primaryCurrency->name,
                            'symbol' => $primaryCurrency->symbol,
                            'symbol_position' => $primaryCurrency->symbol_position,
                            'decimals' => $primaryCurrency->decimals,
                        ] : null,
                        'accepted_currencies' => $shop->accepted_currencies ?? [$shop->primary_currency],
                        'enabled_payment_methods' => $shop->paymentMethods,
                    ],
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $ve->errors()
            ], 422);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Failed to switch shop',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current shop context with complete details
     */
    public function getCurrentShop(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->shop_id) {
            return response()->json([
                'success' => false,
                'message' => 'No active shop context',
            ], 404);
        }

        $shop = Shop::with([
            'currency:code,name,symbol,symbol_position,decimals',
            'paymentMethods' => function ($query) {
                $query->where('shop_payment_methods.is_enabled', true);
            }
        ])->find($user->shop_id);

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop not found',
            ], 404);
        }

        $primaryCurrency = Currency::where('code', $shop->primary_currency)->first();

        // Get current drawer session if any
        $drawerSession = DrawerSession::where('user_id', $user->id)
            ->where('shop_id', $shop->id)
            ->where('status', 'open')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $shop->id,
                'name' => $shop->name,
                'code' => $shop->code,
                'location' => $shop->location,
                'phone' => $shop->phone,
                'email' => $shop->email,
                'is_active' => $shop->is_active,
                'primary_currency' => $primaryCurrency ? [
                    'code' => $primaryCurrency->code,
                    'name' => $primaryCurrency->name,
                    'symbol' => $primaryCurrency->symbol,
                    'symbol_position' => $primaryCurrency->symbol_position,
                    'decimals' => $primaryCurrency->decimals,
                    'exchange_rate' => $primaryCurrency->exchange_rate,
                ] : null,
                'accepted_currencies' => $shop->accepted_currencies ?? [$shop->primary_currency],
                'currency_settings' => $shop->currency_settings,
                'enabled_payment_methods' => $shop->paymentMethods,
                'current_drawer_session' => $drawerSession ? [
                    'id' => $drawerSession->id,
                    'started_at' => $drawerSession->started_at,
                    'opening_cash' => $drawerSession->opening_cash,
                    'currency' => $drawerSession->currency,
                ] : null,
            ],
        ]);
    }

    /**
     * Update shop currency settings (Manager+ only)
     */
    public function updateCurrencySettings(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasAnyRole(['Admin', 'Manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions',
            ], 403);
        }

        if (!$user->shop_id) {
            return response()->json([
                'success' => false,
                'message' => 'No active shop context',
            ], 400);
        }

        $validated = $request->validate([
            'primary_currency' => 'sometimes|string|size:3|exists:currencies,code',
            'accepted_currencies' => 'sometimes|array',
            'accepted_currencies.*' => 'string|size:3|exists:currencies,code',
            'currency_settings' => 'sometimes|array',
            'currency_settings.auto_convert' => 'boolean',
            'currency_settings.default_rate_provider' => 'string|max:50',
        ]);

        $shop = Shop::find($user->shop_id);

        if (isset($validated['primary_currency'])) {
            $shop->primary_currency = $validated['primary_currency'];
        }

        if (isset($validated['accepted_currencies'])) {
            // Ensure primary currency is in accepted currencies
            $acceptedCurrencies = $validated['accepted_currencies'];
            if (!in_array($shop->primary_currency, $acceptedCurrencies)) {
                $acceptedCurrencies[] = $shop->primary_currency;
            }
            $shop->accepted_currencies = $acceptedCurrencies;
        }

        if (isset($validated['currency_settings'])) {
            $currentSettings = $shop->currency_settings ?? [];
            $shop->currency_settings = array_merge($currentSettings, $validated['currency_settings']);
        }

        $shop->save();

        return response()->json([
            'success' => true,
            'message' => 'Currency settings updated successfully',
            'data' => [
                'primary_currency' => $shop->primary_currency,
                'accepted_currencies' => $shop->accepted_currencies,
                'currency_settings' => $shop->currency_settings,
            ],
        ]);
    }
}
