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
        // Add foreign key constraints after seeding
        Schema::table('shops', function (Blueprint $table) {
            $table->foreign('primary_currency')->references('code')->on('currencies')->onUpdate('cascade');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->foreign('currency')->references('code')->on('currencies')->onUpdate('cascade');
        });

        Schema::table('cash_drawer_transactions', function (Blueprint $table) {
            $table->foreign('currency')->references('code')->on('currencies')->onUpdate('cascade');
        });

        Schema::table('drawer_sessions', function (Blueprint $table) {
            $table->foreign('currency')->references('code')->on('currencies')->onUpdate('cascade');
        });

        // Skip exchange_rate_history foreign keys as they were already created
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Skip exchange_rate_history foreign keys as they were already created

        Schema::table('drawer_sessions', function (Blueprint $table) {
            $table->dropForeign(['currency']);
        });

        Schema::table('cash_drawer_transactions', function (Blueprint $table) {
            $table->dropForeign(['currency']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['currency']);
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->dropForeign(['primary_currency']);
        });
    }
};
