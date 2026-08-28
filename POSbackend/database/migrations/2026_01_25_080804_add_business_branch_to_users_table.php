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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('business_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->after('business_id')->constrained()->cascadeOnDelete();
            // shop_id already exists, but we'll ensure it's required for employees
            
            // Indexes for performance
            $table->index('business_id');
            $table->index('branch_id');
            $table->index('shop_id');
            $table->index(['business_id', 'branch_id', 'shop_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['business_id']);
            $table->dropForeign(['branch_id']);
            $table->dropIndex(['business_id']);
            $table->dropIndex(['branch_id']);
            $table->dropIndex(['shop_id']);
            $table->dropIndex(['business_id', 'branch_id', 'shop_id']);
            $table->dropColumn(['business_id', 'branch_id']);
        });
    }
};
