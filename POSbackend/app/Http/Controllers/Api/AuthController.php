<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login with enhanced shop and currency information
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is active
        // TEMP: Comment out for testing
        // if (!$user->email_verified_at) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Account is not verified. Please contact administrator.',
        //     ], 401);
        // }

        // Generate authentication token
        $token = $user->createToken($request->device_name)->plainTextToken;

        // Load user with comprehensive shop and currency information
        $user->load([
            'roles.permissions',
            'shop.primaryCurrency.denominations',
            'shops.primaryCurrency',
        ]);

        // Get user's accessible shops with currency information
        $accessibleShops = [];
        if ($user->hasRole('admin')) {
            $accessibleShops = Shop::active()
                ->with(['primaryCurrency', 'enabledPaymentMethods'])
                ->get();
        } else {
            $shopIds = $user->shops->pluck('id')->toArray();
            if ($user->shop_id && !in_array($user->shop_id, $shopIds)) {
                $shopIds[] = $user->shop_id;
            }
            $accessibleShops = Shop::active()
                ->whereIn('id', $shopIds)
                ->with(['primaryCurrency', 'enabledPaymentMethods'])
                ->get();
        }

        // Format shops data
        $formattedShops = $accessibleShops->map(function ($shop) use ($user) {
            return [
                'id' => $shop->id,
                'name' => $shop->name,
                'code' => $shop->code,
                'location' => $shop->location,
                'is_main_branch' => $shop->is_main_branch,
                'shop_type' => $shop->shop_type,
                'primary_currency' => [
                    'code' => $shop->primary_currency,
                    'name' => $shop->primaryCurrency?->name,
                    'symbol' => $shop->primaryCurrency?->symbol,
                    'symbol_position' => $shop->primaryCurrency?->symbol_position,
                    'decimals' => $shop->primaryCurrency?->decimals ?? 2,
                ],
                'accepted_currencies' => $shop->getAllAcceptedCurrencies(),
                'enabled_payment_methods' => $shop->enabledPaymentMethods->map(function ($method) {
                    return [
                        'code' => $method->code,
                        'name' => $method->name,
                        'icon' => $method->icon,
                        'requires_breakdown' => $method->requires_breakdown,
                        'can_calculate_change' => $method->can_calculate_change,
                        'supports_partial_payment' => $method->supports_partial_payment,
                    ];
                }),
                'is_current' => $shop->id === $user->shop_id,
                'user_role' => $user->getShopRole($shop->id),
            ];
        });

        // Get current shop information if available
        $currentShop = null;
        if ($user->shop_id) {
            $currentShopData = $formattedShops->firstWhere('id', $user->shop_id);
            if ($currentShopData) {
                $currentShop = $currentShopData;

                // Add denominations for current shop's primary currency
                if ($user->shop && $user->shop->primaryCurrency) {
                    $currentShop['primary_currency']['denominations'] = $user->shop->primaryCurrency->activeDenominations->map(function ($denom) {
                        return [
                            'value' => $denom->value,
                            'label' => $denom->label,
                            'type' => $denom->type,
                            'color' => $denom->color,
                            'sort_order' => $denom->sort_order,
                            'is_active' => $denom->is_active,
                        ];
                    });
                }
            }
        }

        // Check for active drawer session
        $activeDrawerSession = $user->getCurrentDrawerSession();
        $drawerSessionInfo = null;
        if ($activeDrawerSession) {
            $drawerSessionInfo = [
                'id' => $activeDrawerSession->id,
                'shop_id' => $activeDrawerSession->shop_id,
                'shop_name' => $activeDrawerSession->shop->name,
                'started_at' => $activeDrawerSession->started_at,
                'opening_cash' => $activeDrawerSession->opening_cash,
                'currency' => $activeDrawerSession->currency,
                'status' => $activeDrawerSession->status,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'shop_id' => $user->shop_id,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                    'is_admin' => $user->isAdmin(),
                    'is_manager' => $user->isManager(),
                    'is_cashier' => $user->isCashier(),
                    'preferred_currency' => $user->getPreferredCurrency(),
                    'statistics' => $user->getSalesStatistics(),
                ],
                'current_shop' => $currentShop,
                'accessible_shops' => $formattedShops,
                'drawer_session' => $drawerSessionInfo,
                'login_time' => now(),
            ],
        ]);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Revoke current access token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
                'data' => [
                    'user_id' => $user->id,
                    'logout_time' => now(),
                ],
            ]);

        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get current authenticated user with shop context
     */
    public function user(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Load relationships
            $user->load([
                'roles.permissions',
                'shop.primaryCurrency.denominations',
                'shops.primaryCurrency',
            ]);

            // Get current drawer session
            $activeDrawerSession = $user->getCurrentDrawerSession();
            $drawerSessionInfo = null;
            if ($activeDrawerSession) {
                $drawerSessionInfo = [
                    'id' => $activeDrawerSession->id,
                    'shop_id' => $activeDrawerSession->shop_id,
                    'shop_name' => $activeDrawerSession->shop->name,
                    'started_at' => $activeDrawerSession->started_at,
                    'opening_cash' => $activeDrawerSession->opening_cash,
                    'currency' => $activeDrawerSession->currency,
                    'status' => $activeDrawerSession->status,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user->toApiResponse(),
                    'drawer_session' => $drawerSessionInfo,
                    'last_updated' => now(),
                ],
            ]);

        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user information',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Refresh user session and shop context
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Refresh user's shop context
            $user->load([
                'roles.permissions',
                'shop.primaryCurrency.denominations',
                'shops.primaryCurrency',
            ]);

            // Get updated accessible shops
            $accessibleShops = [];
            if ($user->hasRole('admin')) {
                $accessibleShops = Shop::active()
                    ->with(['primaryCurrency', 'enabledPaymentMethods'])
                    ->get();
            } else {
                $shopIds = $user->shops->pluck('id')->toArray();
                if ($user->shop_id && !in_array($user->shop_id, $shopIds)) {
                    $shopIds[] = $user->shop_id;
                }
                $accessibleShops = Shop::active()
                    ->whereIn('id', $shopIds)
                    ->with(['primaryCurrency', 'enabledPaymentMethods'])
                    ->get();
            }

            $formattedShops = $accessibleShops->map(function ($shop) use ($user) {
                return [
                    'id' => $shop->id,
                    'name' => $shop->name,
                    'code' => $shop->code,
                    'primary_currency' => [
                        'code' => $shop->primary_currency,
                        'name' => $shop->primaryCurrency?->name,
                        'symbol' => $shop->primaryCurrency?->symbol,
                        'decimals' => $shop->primaryCurrency?->decimals ?? 2,
                    ],
                    'is_current' => $shop->id === $user->shop_id,
                    'user_role' => $user->getShopRole($shop->id),
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Session refreshed successfully',
                'data' => [
                    'user' => $user->toApiResponse(),
                    'accessible_shops' => $formattedShops,
                    'refreshed_at' => now(),
                ],
            ]);

        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh session',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Validate user permissions for specific actions
     */
    public function validatePermissions(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'required|string',
                'shop_id' => 'nullable|integer|exists:shops,id',
            ]);

            $user = $request->user();
            $permissions = $request->input('permissions');
            $shopId = $request->input('shop_id', $user->shop_id);

            $results = [];
            foreach ($permissions as $permission) {
                $hasPermission = $user->can($permission);

                // Check shop-specific permissions if shop_id provided
                if ($shopId && !$user->hasAccessToShop($shopId)) {
                    $hasPermission = false;
                }

                $results[$permission] = $hasPermission;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $user->id,
                    'shop_id' => $shopId,
                    'permissions' => $results,
                    'is_admin' => $user->isAdmin(),
                    'validated_at' => now(),
                ],
            ]);

        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Permission validation failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
