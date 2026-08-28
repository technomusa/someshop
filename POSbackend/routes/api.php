<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/refresh', [AuthController::class, 'refresh']);
    Route::post('/user/validate-permissions', [AuthController::class, 'validatePermissions']);

    // User Context
    Route::get('/user/shops', [\App\Http\Controllers\Api\ShopContextController::class, 'index'])->middleware('api');
    Route::post('/user/switch-shop', [\App\Http\Controllers\Api\ShopContextController::class, 'switchShop']);
    Route::get('/user/current-shop', [\App\Http\Controllers\Api\ShopContextController::class, 'getCurrentShop']);
    Route::put('/user/shop/currency-settings', [\App\Http\Controllers\Api\ShopContextController::class, 'updateCurrencySettings']);

    // Catalog
    Route::apiResource('categories', \App\Http\Controllers\Api\CategoryController::class);
    Route::apiResource('brands', \App\Http\Controllers\Api\BrandController::class);
    Route::apiResource('products', \App\Http\Controllers\Api\ProductController::class);
    Route::apiResource('suppliers', \App\Http\Controllers\Api\SupplierController::class);

    // Inventory
    Route::get('/inventory', [\App\Http\Controllers\Api\InventoryController::class, 'index']);
    Route::get('/inventory/movements', [\App\Http\Controllers\Api\InventoryController::class, 'movements']);
    Route::post('/inventory/adjust', [\App\Http\Controllers\Api\InventoryController::class, 'adjust']);
    Route::post('/inventory/receive', [\App\Http\Controllers\Api\InventoryController::class, 'receive']);
    Route::post('/inventory/transfer', [\App\Http\Controllers\Api\InventoryController::class, 'transfer']);

    // Sales
    Route::apiResource('customers', \App\Http\Controllers\Api\CustomerController::class);
    Route::apiResource('sales', \App\Http\Controllers\Api\SaleController::class);
    
    // User Management (Admin/Manager only)
    Route::prefix('users')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\UserManagementController::class, 'index'])->middleware('role:super_admin,admin,manager');
        Route::post('/', [\App\Http\Controllers\Api\UserManagementController::class, 'store'])->middleware('role:super_admin,admin,manager');
        Route::get('/businesses', [\App\Http\Controllers\Api\UserManagementController::class, 'getAvailableBusinesses']);
        Route::get('/branches', [\App\Http\Controllers\Api\UserManagementController::class, 'getAvailableBranches']);
        Route::get('/shops', [\App\Http\Controllers\Api\UserManagementController::class, 'getAvailableShops']);
        Route::put('/{user}', [\App\Http\Controllers\Api\UserManagementController::class, 'update'])->middleware('role:super_admin,admin,manager');
        Route::delete('/{user}', [\App\Http\Controllers\Api\UserManagementController::class, 'destroy'])->middleware('role:super_admin,admin');
    });
    // UI / Dashboard endpoints
    Route::get('/ui/dashboard', [\App\Http\Controllers\Api\UIController::class, 'dashboard']);
    Route::get('/ui/products', [\App\Http\Controllers\Api\UIController::class, 'products']);
    Route::get('/ui/customers', [\App\Http\Controllers\Api\UIController::class, 'customers']);
    Route::get('/ui/scales', [\App\Http\Controllers\Api\UIController::class, 'scales']);
    Route::get('/ui/reports', [\App\Http\Controllers\Api\UIController::class, 'reports']);

    // Currencies
    Route::get('/currencies', [\App\Http\Controllers\Api\CurrencyController::class, 'index']);
    Route::get('/currencies/supported', [\App\Http\Controllers\Api\CurrencyController::class, 'supported']);
    Route::get('/currencies/{code}', [\App\Http\Controllers\Api\CurrencyController::class, 'show']);
    Route::post('/currencies', [\App\Http\Controllers\Api\CurrencyController::class, 'store']);
    Route::put('/currencies/{code}', [\App\Http\Controllers\Api\CurrencyController::class, 'update']);
    Route::delete('/currencies/{code}', [\App\Http\Controllers\Api\CurrencyController::class, 'destroy']);

    // Currency utilities
    Route::post('/currencies/calculate-change', [\App\Http\Controllers\Api\CurrencyController::class, 'calculateChange']);
    Route::post('/currencies/validate-breakdown', [\App\Http\Controllers\Api\CurrencyController::class, 'validateBreakdown']);
    Route::post('/currencies/convert', [\App\Http\Controllers\Api\CurrencyController::class, 'convert']);
    Route::get('/currencies/{code}/exchange-rates', [\App\Http\Controllers\Api\CurrencyController::class, 'getExchangeRates']);
    Route::get('/currencies/{code}/rate-history', [\App\Http\Controllers\Api\CurrencyController::class, 'rateHistory']);
    Route::post('/currencies/update-exchange-rates', [\App\Http\Controllers\Api\CurrencyController::class, 'updateExchangeRates']);

    // Enhanced Dashboard
    Route::get('/dashboard/overview', [\App\Http\Controllers\Api\DashboardController::class, 'overview']);
    Route::get('/dashboard/sales-analytics', [\App\Http\Controllers\Api\DashboardController::class, 'salesAnalytics']);
    Route::get('/dashboard/cash-flow', [\App\Http\Controllers\Api\DashboardController::class, 'cashFlow']);
    Route::get('/dashboard/inventory-alerts', [\App\Http\Controllers\Api\DashboardController::class, 'inventoryAlerts']);

    // Accounting
    Route::post('/accounting/expenses', [\App\Http\Controllers\Api\AccountingController::class, 'storeExpense']);
    Route::post('/accounting/drawer/open', [\App\Http\Controllers\Api\AccountingController::class, 'openDrawer']);
    Route::post('/accounting/drawer/close', [\App\Http\Controllers\Api\AccountingController::class, 'closeDrawer']);
    Route::get('/accounting/my-sessions', [\App\Http\Controllers\Api\AccountingController::class, 'mySessions']);
});
