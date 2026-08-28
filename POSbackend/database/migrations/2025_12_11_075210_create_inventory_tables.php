<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // Basic inventory holding current stock levels
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('variation_id')->nullable()->constrained();
            $table->integer('quantity')->default(0);
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['product_id', 'variation_id', 'shop_id'], 'inventory_shop_unique');
        });

        // For perishable tracking and detailed stock in
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('variation_id')->nullable()->constrained();
            $table->string('batch_number')->index();
            $table->integer('quantity'); // Current remaining quantity in this batch
            $table->date('expiry_date')->nullable(); // For cold-store items
            $table->decimal('cost_price', 15, 2)->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete(); // Batches are physically in a shop
            $table->timestamps();
        });

        // Audit trail for stock changes
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('variation_id')->nullable()->constrained();
            $table->enum('type', ['in', 'out', 'transfer', 'adjustment', 'sale', 'return']);
            $table->integer('quantity'); // Positive or negative
            $table->string('reference_id')->nullable(); // e.g., Sale ID, PO ID
            $table->string('reason')->nullable(); // "Damaged", "Expired", etc.
            $table->foreignId('user_id')->nullable()->constrained(); // Who did it
            $table->foreignId('shop_id')->constrained(); // Owner shop of the event
            $table->foreignId('from_shop_id')->nullable()->constrained('shops');
            $table->foreignId('to_shop_id')->nullable()->constrained('shops');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('inventory_batches');
        Schema::dropIfExists('inventories');
        Schema::dropIfExists('suppliers');
    }
};
