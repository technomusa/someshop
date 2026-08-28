<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentMethods = [
            [
                'code' => 'cash',
                'name' => 'Cash',
                'icon' => 'banknote',
                'requires_breakdown' => true,
                'can_calculate_change' => true,
                'supports_partial_payment' => true,
                'is_active' => true,
                'config' => [
                    'allow_overpayment' => true,
                    'require_breakdown_validation' => true,
                    'auto_calculate_change' => true,
                ],
            ],
            [
                'code' => 'card',
                'name' => 'Credit/Debit Card',
                'icon' => 'credit-card',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => true,
                'config' => [
                    'supported_types' => ['visa', 'mastercard', 'amex', 'discover'],
                    'require_signature' => false,
                    'require_pin' => true,
                ],
            ],
            [
                'code' => 'mobile_money',
                'name' => 'Mobile Money',
                'icon' => 'smartphone',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => true,
                'config' => [
                    'supported_providers' => ['mpesa', 'airtel_money', 'tigo_pesa'],
                    'require_phone_verification' => true,
                    'auto_confirm' => false,
                ],
            ],
            [
                'code' => 'bank_transfer',
                'name' => 'Bank Transfer',
                'icon' => 'building-2',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => true,
                'config' => [
                    'require_reference' => true,
                    'verification_required' => true,
                    'processing_time' => '1-3 business days',
                ],
            ],
            [
                'code' => 'gift_card',
                'name' => 'Gift Card',
                'icon' => 'gift',
                'requires_breakdown' => false,
                'can_calculate_change' => true,
                'supports_partial_payment' => true,
                'is_active' => true,
                'config' => [
                    'require_card_number' => true,
                    'require_pin' => false,
                    'allow_partial_redemption' => true,
                    'issue_change_card' => false,
                ],
            ],
            [
                'code' => 'store_credit',
                'name' => 'Store Credit',
                'icon' => 'wallet',
                'requires_breakdown' => false,
                'can_calculate_change' => true,
                'supports_partial_payment' => true,
                'is_active' => true,
                'config' => [
                    'require_customer_account' => true,
                    'allow_negative_balance' => false,
                    'auto_apply_available_credit' => true,
                ],
            ],
            [
                'code' => 'check',
                'name' => 'Check',
                'icon' => 'file-text',
                'requires_breakdown' => false,
                'can_calculate_change' => true,
                'supports_partial_payment' => false,
                'is_active' => false,
                'config' => [
                    'require_id_verification' => true,
                    'hold_period_days' => 3,
                    'maximum_amount' => 500,
                ],
            ],
            [
                'code' => 'cryptocurrency',
                'name' => 'Cryptocurrency',
                'icon' => 'bitcoin',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => false,
                'config' => [
                    'supported_currencies' => ['BTC', 'ETH', 'LTC'],
                    'confirmation_blocks' => 3,
                    'payment_timeout_minutes' => 15,
                ],
            ],
            [
                'code' => 'buy_now_pay_later',
                'name' => 'Buy Now Pay Later',
                'icon' => 'calendar-clock',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => false,
                'is_active' => false,
                'config' => [
                    'supported_providers' => ['klarna', 'afterpay', 'affirm'],
                    'require_credit_check' => true,
                    'minimum_amount' => 50,
                    'maximum_amount' => 2000,
                ],
            ],
            [
                'code' => 'loyalty_points',
                'name' => 'Loyalty Points',
                'icon' => 'star',
                'requires_breakdown' => false,
                'can_calculate_change' => false,
                'supports_partial_payment' => true,
                'is_active' => true,
                'config' => [
                    'points_per_dollar' => 100,
                    'minimum_redemption' => 500,
                    'maximum_redemption_percentage' => 50,
                ],
            ],
        ];

        foreach ($paymentMethods as $methodData) {
            $method = PaymentMethod::updateOrCreate(
                ['code' => $methodData['code']],
                $methodData
            );
            if ($method->wasRecentlyCreated) {
                $this->command->info("Created payment method: {$method->name} ({$method->code})");
            } else {
                $this->command->info("Payment method already exists: {$method->name} ({$method->code})");
            }
        }

        $this->command->info('✅ Payment method seeding completed!');
    }
}
