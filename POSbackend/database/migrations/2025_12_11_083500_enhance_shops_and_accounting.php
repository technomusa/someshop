<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->boolean('is_main_branch')->default(false);
            $table->string('shop_type')->nullable(); // e.g. 'Electronics', 'Clothing', 'Grocery'
        });

        // Many-to-Many for Users <-> Shops
        Schema::create('shop_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['user_id', 'shop_id']);
        });

        // Accounting: Expenses
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained(); // Who recorded it
            $table->string('title');
            $table->decimal('amount', 15, 2);
            $table->string('category')->nullable(); // Rent, Utilities, Petty Cash
            $table->date('expense_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Accounting: Drawer/Shift Sessions (End of Day Auditing)
        Schema::create('drawer_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained(); // Cashier
            
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            
            $table->decimal('opening_cash', 15, 2)->default(0);
            $table->decimal('closing_cash', 15, 2)->nullable(); // What system thinks is there (Cash Sales)
            $table->decimal('actual_cash', 15, 2)->nullable(); // What cashier counted
            $table->decimal('difference', 15, 2)->nullable(); // Discrepancy
            
            $table->text('notes')->nullable();
            $table->enum('status', ['open', 'closed', 'audited'])->default('open');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drawer_sessions');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('shop_user');
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn(['is_main_branch', 'shop_type']);
        });
    }
};
