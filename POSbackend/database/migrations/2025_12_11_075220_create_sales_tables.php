<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable(); // Not unique because some might share or not have
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->integer('loyalty_points')->default(0);
            $table->timestamps();
        });

        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('shop_id')->constrained();
            $table->foreignId('user_id')->constrained(); // Cashier
            $table->foreignId('customer_id')->nullable()->constrained();
            
            // Financials
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0); // quantity * price - discount + tax
            
            // Statuses
            $table->enum('status', ['completed', 'pending', 'cancelled', 'refunded'])->default('pending');
            $table->enum('payment_status', ['paid', 'partial', 'unpaid', 'refunded'])->default('unpaid');
            $table->string('payment_method')->nullable(); // cash, card, mix (if mix, details in payments table)
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('variation_id')->nullable()->constrained();
            $table->string('product_name'); // Snapshot for historical accuracy
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2); // Price at moment of sale
            $table->decimal('subtotal', 15, 2); // quantity * unit_price
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('method'); // cash, card, mobile_money
            $table->string('transaction_reference')->nullable(); // For card/mobile money
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('customers');
    }
};
