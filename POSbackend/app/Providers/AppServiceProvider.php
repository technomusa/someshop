<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Sale;
use App\Models\Product;
use App\Models\User;
use App\Models\Inventory;
use App\Policies\SalePolicy;
use App\Policies\ProductPolicy;
use App\Policies\UserPolicy;
use App\Policies\InventoryPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Sale::class => SalePolicy::class,
        Product::class => ProductPolicy::class,
        User::class => UserPolicy::class,
        Inventory::class => InventoryPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        $this->registerPolicies();
    }

    /**
     * Register the application's policies.
     */
    protected function registerPolicies(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}
