<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Currency;
use App\Models\CurrencyDenomination;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 1.0,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 100, 'label' => '$100', 'type' => 'bill', 'color' => 'green', 'sort_order' => 1],
                    ['value' => 50, 'label' => '$50', 'type' => 'bill', 'color' => 'green', 'sort_order' => 2],
                    ['value' => 20, 'label' => '$20', 'type' => 'bill', 'color' => 'green', 'sort_order' => 3],
                    ['value' => 10, 'label' => '$10', 'type' => 'bill', 'color' => 'green', 'sort_order' => 4],
                    ['value' => 5, 'label' => '$5', 'type' => 'bill', 'color' => 'green', 'sort_order' => 5],
                    ['value' => 1, 'label' => '$1', 'type' => 'bill', 'color' => 'green', 'sort_order' => 6],
                    ['value' => 0.5, 'label' => '50¢', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 7],
                    ['value' => 0.25, 'label' => '25¢', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 8],
                    ['value' => 0.1, 'label' => '10¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 9],
                    ['value' => 0.05, 'label' => '5¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 10],
                    ['value' => 0.01, 'label' => '1¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 11],
                ],
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 0.85,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 500, 'label' => '€500', 'type' => 'bill', 'color' => 'purple', 'sort_order' => 1],
                    ['value' => 200, 'label' => '€200', 'type' => 'bill', 'color' => 'yellow', 'sort_order' => 2],
                    ['value' => 100, 'label' => '€100', 'type' => 'bill', 'color' => 'green', 'sort_order' => 3],
                    ['value' => 50, 'label' => '€50', 'type' => 'bill', 'color' => 'orange', 'sort_order' => 4],
                    ['value' => 20, 'label' => '€20', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 5],
                    ['value' => 10, 'label' => '€10', 'type' => 'bill', 'color' => 'red', 'sort_order' => 6],
                    ['value' => 5, 'label' => '€5', 'type' => 'bill', 'color' => 'gray', 'sort_order' => 7],
                    ['value' => 2, 'label' => '€2', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 8],
                    ['value' => 1, 'label' => '€1', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 9],
                    ['value' => 0.5, 'label' => '50¢', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 10],
                    ['value' => 0.2, 'label' => '20¢', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 11],
                    ['value' => 0.1, 'label' => '10¢', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 12],
                    ['value' => 0.05, 'label' => '5¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 13],
                    ['value' => 0.02, 'label' => '2¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 14],
                    ['value' => 0.01, 'label' => '1¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 15],
                ],
            ],
            [
                'code' => 'GBP',
                'name' => 'British Pound',
                'symbol' => '£',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 0.73,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 50, 'label' => '£50', 'type' => 'bill', 'color' => 'red', 'sort_order' => 1],
                    ['value' => 20, 'label' => '£20', 'type' => 'bill', 'color' => 'purple', 'sort_order' => 2],
                    ['value' => 10, 'label' => '£10', 'type' => 'bill', 'color' => 'orange', 'sort_order' => 3],
                    ['value' => 5, 'label' => '£5', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 4],
                    ['value' => 2, 'label' => '£2', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 5],
                    ['value' => 1, 'label' => '£1', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 6],
                    ['value' => 0.5, 'label' => '50p', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 7],
                    ['value' => 0.2, 'label' => '20p', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 8],
                    ['value' => 0.1, 'label' => '10p', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 9],
                    ['value' => 0.05, 'label' => '5p', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 10],
                    ['value' => 0.02, 'label' => '2p', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 11],
                    ['value' => 0.01, 'label' => '1p', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 12],
                ],
            ],
            [
                'code' => 'KES',
                'name' => 'Kenyan Shilling',
                'symbol' => 'KSh',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 150.25,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 1000, 'label' => 'KSh 1000', 'type' => 'bill', 'color' => 'green', 'sort_order' => 1],
                    ['value' => 500, 'label' => 'KSh 500', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 2],
                    ['value' => 200, 'label' => 'KSh 200', 'type' => 'bill', 'color' => 'orange', 'sort_order' => 3],
                    ['value' => 100, 'label' => 'KSh 100', 'type' => 'bill', 'color' => 'red', 'sort_order' => 4],
                    ['value' => 50, 'label' => 'KSh 50', 'type' => 'bill', 'color' => 'purple', 'sort_order' => 5],
                    ['value' => 20, 'label' => 'KSh 20', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 6],
                    ['value' => 10, 'label' => 'KSh 10', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 7],
                    ['value' => 5, 'label' => 'KSh 5', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 8],
                    ['value' => 1, 'label' => 'KSh 1', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 9],
                ],
            ],
            [
                'code' => 'CAD',
                'name' => 'Canadian Dollar',
                'symbol' => 'C$',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 1.35,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 100, 'label' => 'C$100', 'type' => 'bill', 'color' => 'brown', 'sort_order' => 1],
                    ['value' => 50, 'label' => 'C$50', 'type' => 'bill', 'color' => 'red', 'sort_order' => 2],
                    ['value' => 20, 'label' => 'C$20', 'type' => 'bill', 'color' => 'green', 'sort_order' => 3],
                    ['value' => 10, 'label' => 'C$10', 'type' => 'bill', 'color' => 'purple', 'sort_order' => 4],
                    ['value' => 5, 'label' => 'C$5', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 5],
                    ['value' => 2, 'label' => 'C$2', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 6],
                    ['value' => 1, 'label' => 'C$1', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 7],
                    ['value' => 0.25, 'label' => '25¢', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 8],
                    ['value' => 0.1, 'label' => '10¢', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 9],
                    ['value' => 0.05, 'label' => '5¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 10],
                ],
            ],
            [
                'code' => 'AUD',
                'name' => 'Australian Dollar',
                'symbol' => 'A$',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 1.52,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 100, 'label' => 'A$100', 'type' => 'bill', 'color' => 'green', 'sort_order' => 1],
                    ['value' => 50, 'label' => 'A$50', 'type' => 'bill', 'color' => 'yellow', 'sort_order' => 2],
                    ['value' => 20, 'label' => 'A$20', 'type' => 'bill', 'color' => 'red', 'sort_order' => 3],
                    ['value' => 10, 'label' => 'A$10', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 4],
                    ['value' => 5, 'label' => 'A$5', 'type' => 'bill', 'color' => 'pink', 'sort_order' => 5],
                    ['value' => 2, 'label' => 'A$2', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 6],
                    ['value' => 1, 'label' => 'A$1', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 7],
                    ['value' => 0.5, 'label' => '50¢', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 8],
                    ['value' => 0.2, 'label' => '20¢', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 9],
                    ['value' => 0.1, 'label' => '10¢', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 10],
                    ['value' => 0.05, 'label' => '5¢', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 11],
                ],
            ],
            [
                'code' => 'JPY',
                'name' => 'Japanese Yen',
                'symbol' => '¥',
                'symbol_position' => 'before',
                'decimals' => 0,
                'is_active' => true,
                'exchange_rate' => 149.50,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 10000, 'label' => '¥10000', 'type' => 'bill', 'color' => 'brown', 'sort_order' => 1],
                    ['value' => 5000, 'label' => '¥5000', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 2],
                    ['value' => 2000, 'label' => '¥2000', 'type' => 'bill', 'color' => 'green', 'sort_order' => 3],
                    ['value' => 1000, 'label' => '¥1000', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 4],
                    ['value' => 500, 'label' => '¥500', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 5],
                    ['value' => 100, 'label' => '¥100', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 6],
                    ['value' => 50, 'label' => '¥50', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 7],
                    ['value' => 10, 'label' => '¥10', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 8],
                    ['value' => 5, 'label' => '¥5', 'type' => 'coin', 'color' => 'copper', 'sort_order' => 9],
                    ['value' => 1, 'label' => '¥1', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 10],
                ],
            ],
            [
                'code' => 'INR',
                'name' => 'Indian Rupee',
                'symbol' => '₹',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 83.12,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 2000, 'label' => '₹2000', 'type' => 'bill', 'color' => 'pink', 'sort_order' => 1],
                    ['value' => 500, 'label' => '₹500', 'type' => 'bill', 'color' => 'yellow', 'sort_order' => 2],
                    ['value' => 200, 'label' => '₹200', 'type' => 'bill', 'color' => 'orange', 'sort_order' => 3],
                    ['value' => 100, 'label' => '₹100', 'type' => 'bill', 'color' => 'green', 'sort_order' => 4],
                    ['value' => 50, 'label' => '₹50', 'type' => 'bill', 'color' => 'purple', 'sort_order' => 5],
                    ['value' => 20, 'label' => '₹20', 'type' => 'bill', 'color' => 'red', 'sort_order' => 6],
                    ['value' => 10, 'label' => '₹10', 'type' => 'bill', 'color' => 'brown', 'sort_order' => 7],
                    ['value' => 10, 'label' => '₹10', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 8],
                    ['value' => 5, 'label' => '₹5', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 9],
                    ['value' => 2, 'label' => '₹2', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 10],
                    ['value' => 1, 'label' => '₹1', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 11],
                ],
            ],
            [
                'code' => 'GHS',
                'name' => 'Ghanaian Cedi',
                'symbol' => 'GH₵',
                'symbol_position' => 'before',
                'decimals' => 2,
                'is_active' => true,
                'exchange_rate' => 1.0,
                'rate_updated_at' => now(),
                'denominations' => [
                    ['value' => 200, 'label' => 'GH₵200', 'type' => 'bill', 'color' => 'green', 'sort_order' => 1],
                    ['value' => 100, 'label' => 'GH₵100', 'type' => 'bill', 'color' => 'blue', 'sort_order' => 2],
                    ['value' => 50, 'label' => 'GH₵50', 'type' => 'bill', 'color' => 'purple', 'sort_order' => 3],
                    ['value' => 20, 'label' => 'GH₵20', 'type' => 'bill', 'color' => 'orange', 'sort_order' => 4],
                    ['value' => 10, 'label' => 'GH₵10', 'type' => 'bill', 'color' => 'red', 'sort_order' => 5],
                    ['value' => 5, 'label' => 'GH₵5', 'type' => 'bill', 'color' => 'brown', 'sort_order' => 6],
                    ['value' => 2, 'label' => 'GH₵2', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 7],
                    ['value' => 1, 'label' => 'GH₵1', 'type' => 'coin', 'color' => 'gold', 'sort_order' => 8],
                    ['value' => 0.5, 'label' => '50p', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 9],
                    ['value' => 0.2, 'label' => '20p', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 10],
                    ['value' => 0.1, 'label' => '10p', 'type' => 'coin', 'color' => 'silver', 'sort_order' => 11],
                ],
            ],
        ];

        foreach ($currencies as $currencyData) {
            $denominations = $currencyData['denominations'];
            unset($currencyData['denominations']);

            $currency = Currency::updateOrCreate(
                ['code' => $currencyData['code']],
                $currencyData
            );

            // Only create denominations if currency was just created
            if ($currency->wasRecentlyCreated) {
                foreach ($denominations as $denominationData) {
                    $currency->denominations()->create($denominationData);
                }
                $this->command->info("Created currency: {$currency->name} ({$currency->code}) with " . count($denominations) . " denominations");
            } else {
                $this->command->info("Currency already exists: {$currency->name} ({$currency->code})");
            }
        }

        $this->command->info('✅ Currency seeding completed!');
    }
}
