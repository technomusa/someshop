<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable(); // SKU is main identifier
            $table->string('barcode')->nullable()->index(); // Scannable barcode
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            
            // Pricing
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('selling_price', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0); // Percentage
            
            // Configuration
            $table->enum('type', ['standard', 'variable', 'perishable', 'service'])->default('standard');
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('alert_quantity')->default(5); // Low stock alert
            
            $table->timestamps();
        });

        Schema::create('variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g., "Red / XL"
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->decimal('additional_price', 15, 2)->default(0); // Added to base price
            $table->decimal('cost_price', 15, 2)->nullable(); // Override base cost if needed
            $table->decimal('selling_price', 15, 2)->nullable(); // Override base price if needed
            $table->integer('alert_quantity')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variations');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('brands');
    }
};
