<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create currencies table
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique(); // USD, EUR, GBP, etc.
            $table->string('name'); // US Dollar, Euro, etc.
            $table->string('symbol'); // $, €, £, etc.
            $table->string('symbol_position')->default('before'); // before or after
            $table->integer('decimals')->default(2); // Number of decimal places
            $table->boolean('is_active')->default(true);
            $table->decimal('exchange_rate', 15, 6)->default(1.0); // Rate to base currency
            $table->timestamp('rate_updated_at')->nullable();
            $table->timestamps();
        });

        // Create currency denominations table
        Schema::create('currency_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('currency_id')->constrained()->cascadeOnDelete();
            $table->decimal('value', 15, 6); // 100.00, 0.25, etc.
            $table->string('label'); // $100, 25¢, etc.
            $table->enum('type', ['bill', 'coin']);
            $table->string('color')->nullable(); // For UI display
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Create payment methods table
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // cash, card, mobile_money, etc.
            $table->string('name'); // Cash, Credit/Debit Card, etc.
            $table->string('icon')->nullable(); // Icon name for UI
            $table->boolean('requires_breakdown')->default(false); // Cash requires breakdown
            $table->boolean('can_calculate_change')->default(false);
            $table->boolean('supports_partial_payment')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('config')->nullable(); // Additional configuration
            $table->timestamps();
        });

        // Enhance shops table with currency support
        Schema::table('shops', function (Blueprint $table) {
            $table->string('primary_currency', 3)->default('USD');
            $table->json('accepted_currencies')->nullable(); // Array of currency codes
            $table->json('currency_settings')->nullable(); // Exchange rate settings, etc.
            // Foreign key will be added after seeding
        });

        // Enhance sales table with currency and payment breakdown support
        Schema::table('sales', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD');
            $table->json('payment_breakdown')->nullable(); // Detailed payment method breakdown
            $table->json('exchange_rates')->nullable(); // Rates used at time of sale
            // Foreign key will be added after seeding
        });

        // Enhance payments table with cash breakdown support
        Schema::table('payments', function (Blueprint $table) {
            $table->json('cash_breakdown')->nullable(); // Denomination breakdown for cash payments
            $table->decimal('exchange_rate', 15, 6)->nullable(); // Rate used for this payment
            $table->string('reference_number')->nullable(); // Transaction reference
            $table->json('metadata')->nullable(); // Additional payment data
        });

        // Create cash drawer transactions table
        Schema::create('cash_drawer_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->enum('type', ['opening', 'closing', 'drop', 'withdrawal', 'adjustment']);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->json('cash_breakdown')->nullable(); // Denomination breakdown
            $table->text('notes')->nullable();
            $table->foreignId('drawer_session_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('transaction_date');
            $table->timestamps();
            // Foreign key will be added after seeding
        });

        // Enhance drawer_sessions table with currency and breakdown support
        Schema::table('drawer_sessions', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD');
            $table->json('opening_breakdown')->nullable(); // Opening cash denomination breakdown
            $table->json('closing_breakdown')->nullable(); // Closing cash denomination breakdown
            $table->json('expected_breakdown')->nullable(); // System calculated breakdown
            $table->decimal('card_total', 15, 2)->default(0); // Total card payments
            $table->decimal('mobile_money_total', 15, 2)->default(0); // Total mobile money payments
            $table->json('payment_method_totals')->nullable(); // Breakdown by payment method
            // Foreign key will be added after seeding
        });

        // Create exchange rate history table
        Schema::create('exchange_rate_history', function (Blueprint $table) {
            $table->id();
            $table->string('from_currency', 3);
            $table->string('to_currency', 3);
            $table->decimal('rate', 15, 6);
            $table->string('provider')->nullable(); // Rate provider (ECB, Fixer, etc.)
            $table->timestamp('rate_date');
            $table->timestamps();

            $table->foreign('from_currency')->references('code')->on('currencies')->onUpdate('cascade');
            $table->foreign('to_currency')->references('code')->on('currencies')->onUpdate('cascade');
            $table->index(['from_currency', 'to_currency', 'rate_date']);
        });

        // Create shop payment methods pivot table
        Schema::create('shop_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_enabled')->default(true);
            $table->json('settings')->nullable(); // Shop-specific settings
            $table->timestamps();

            $table->unique(['shop_id', 'payment_method_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_payment_methods');
        Schema::dropIfExists('exchange_rate_history');

        Schema::table('drawer_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'currency',
                'opening_breakdown',
                'closing_breakdown',
                'expected_breakdown',
                'card_total',
                'mobile_money_total',
                'payment_method_totals'
            ]);
        });

        Schema::dropIfExists('cash_drawer_transactions');

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'cash_breakdown',
                'exchange_rate',
                'reference_number',
                'metadata'
            ]);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'currency',
                'payment_breakdown',
                'exchange_rates'
            ]);
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn([
                'primary_currency',
                'accepted_currencies',
                'currency_settings'
            ]);
        });

        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('currency_denominations');
        Schema::dropIfExists('currencies');
    }
};
