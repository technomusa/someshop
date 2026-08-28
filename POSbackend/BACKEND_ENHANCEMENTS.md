# Backend Enhancements Documentation

## Overview

This document details the comprehensive backend enhancements added to support advanced cash breakdown variations, multi-currency operations, and enhanced payment processing in the POS system.

## 🚀 New Features

### 1. Multi-Currency Support
- **8 supported currencies** with proper formatting and exchange rates
- **Currency denomination management** with visual color coding
- **Real-time exchange rate tracking** and history
- **Automatic optimal change calculation**
- **Shop-level currency configuration**

### 2. Enhanced Cash Breakdown System
- **Detailed denomination tracking** for all supported currencies
- **Cash breakdown validation** with tolerance checking
- **Drawer session management** with opening/closing cash counts
- **Cash flow tracking** and reporting
- **Audit trail** for all cash transactions

### 3. Advanced Payment Processing
- **Multi-payment method support** with configurable options
- **Split payment processing** across different methods
- **Payment method configuration** per shop
- **Cash breakdown requirements** for cash payments
- **Payment validation** and reference tracking

### 4. Enhanced User-Shop Relationships
- **Server-side shop switching** with proper validation
- **Role-based shop access control**
- **Shop context preservation** across sessions
- **Currency preference management**
- **Drawer session validation** during shop switches

## 📊 Database Schema Changes

### New Tables

#### `currencies`
```sql
- id (primary key)
- code (3-char currency code, unique)
- name (currency name)
- symbol (currency symbol)
- symbol_position (before/after)
- decimals (decimal places)
- is_active (boolean)
- exchange_rate (rate to base currency)
- rate_updated_at (timestamp)
```

#### `currency_denominations`
```sql
- id (primary key)
- currency_id (foreign key to currencies)
- value (denomination value)
- label (display label)
- type (bill/coin)
- color (UI color coding)
- sort_order (display order)
- is_active (boolean)
```

#### `payment_methods`
```sql
- id (primary key)
- code (method code, unique)
- name (display name)
- icon (UI icon)
- requires_breakdown (boolean)
- can_calculate_change (boolean)
- supports_partial_payment (boolean)
- is_active (boolean)
- config (JSON configuration)
```

#### `exchange_rate_history`
```sql
- id (primary key)
- from_currency (currency code)
- to_currency (currency code)
- rate (exchange rate)
- provider (rate provider)
- rate_date (timestamp)
```

#### `cash_drawer_transactions`
```sql
- id (primary key)
- shop_id (foreign key)
- user_id (foreign key)
- type (opening/closing/drop/withdrawal/adjustment)
- amount (transaction amount)
- currency (currency code)
- cash_breakdown (JSON denomination breakdown)
- notes (optional notes)
- drawer_session_id (foreign key)
- transaction_date (timestamp)
```

#### `shop_payment_methods`
```sql
- id (primary key)
- shop_id (foreign key)
- payment_method_id (foreign key)
- is_enabled (boolean)
- settings (JSON shop-specific settings)
```

### Enhanced Existing Tables

#### `shops`
- `primary_currency` - Shop's primary currency code
- `accepted_currencies` - JSON array of accepted currencies
- `currency_settings` - JSON currency configuration

#### `sales`
- `currency` - Sale currency code
- `payment_breakdown` - JSON payment method breakdown
- `exchange_rates` - JSON rates used at sale time

#### `payments`
- `cash_breakdown` - JSON denomination breakdown
- `exchange_rate` - Rate used for payment
- `reference_number` - Payment reference
- `metadata` - JSON additional payment data

#### `drawer_sessions`
- `currency` - Session currency
- `opening_breakdown` - JSON opening cash breakdown
- `closing_breakdown` - JSON closing cash breakdown
- `expected_breakdown` - JSON system calculated breakdown
- `card_total` - Total card payments
- `mobile_money_total` - Total mobile money payments
- `payment_method_totals` - JSON breakdown by method

## 🎯 API Endpoints

### Currency Management

#### GET `/api/currencies`
Get all currencies with denominations
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "symbol_position": "before",
      "decimals": 2,
      "is_active": true,
      "exchange_rate": 1.0,
      "denominations": [...],
      "quick_amounts": [5, 10, 20, 50, 100]
    }
  ]
}
```

#### GET `/api/currencies/supported`
Get supported currencies (minimal data)

#### GET `/api/currencies/{code}`
Get specific currency with full details

#### POST `/api/currencies/calculate-change`
Calculate optimal denomination breakdown
```json
{
  "amount": 47.83,
  "currency": "USD"
}
```

#### POST `/api/currencies/validate-breakdown`
Validate cash breakdown against expected amount
```json
{
  "breakdown": {
    "20": 2,
    "5": 1,
    "1": 2,
    "0.25": 3
  },
  "expected_amount": 47.75,
  "currency": "USD"
}
```

#### POST `/api/currencies/convert`
Convert amount between currencies
```json
{
  "amount": 100,
  "from_currency": "USD",
  "to_currency": "EUR"
}
```

#### GET `/api/currencies/{code}/exchange-rates`
Get current exchange rates for currency

#### GET `/api/currencies/{code}/rate-history`
Get exchange rate history

#### POST `/api/currencies/update-exchange-rates`
Update exchange rates in batch
```json
{
  "rates": [
    {"currency": "EUR", "rate": 0.85},
    {"currency": "GBP", "rate": 0.73}
  ],
  "provider": "ECB"
}
```

### Enhanced Dashboard

#### GET `/api/dashboard/overview`
Get dashboard overview with multi-currency support
- Sales statistics by currency
- Payment method breakdown
- Cash flow summary
- Recent sales with payment details
- Top products
- Current drawer session info

#### GET `/api/dashboard/sales-analytics`
Get detailed sales analytics
- Sales trends by period
- Payment method breakdown
- Currency breakdown
- Hourly sales patterns
- Sales by cashier

#### GET `/api/dashboard/cash-flow`
Get cash flow analytics
- Cash drawer transactions
- Drawer sessions summary
- Cash movement tracking
- Denomination breakdowns

#### GET `/api/dashboard/inventory-alerts`
Get inventory alerts with shop context

### Enhanced User Context

#### GET `/api/user/shops`
Get accessible shops with currency information
```json
{
  "success": true,
  "data": {
    "shops": [
      {
        "id": 1,
        "name": "Main Store",
        "primary_currency": {
          "code": "USD",
          "name": "US Dollar",
          "symbol": "$",
          "decimals": 2
        },
        "accepted_currencies": ["USD", "EUR"],
        "enabled_payment_methods": [...],
        "is_current": true,
        "user_role": "admin"
      }
    ]
  }
}
```

#### POST `/api/user/switch-shop`
Switch shop context with validation
- Validates drawer session status
- Checks user permissions
- Updates shop context
- Returns comprehensive shop data

#### GET `/api/user/current-shop`
Get current shop context with details

#### PUT `/api/user/shop/currency-settings`
Update shop currency settings (manager+ only)

### Enhanced Authentication

#### POST `/api/login`
Enhanced login with shop and currency context
- Returns comprehensive user data
- Includes accessible shops
- Provides currency preferences
- Shows current drawer session

#### GET `/api/user`
Get current user with shop context

#### POST `/api/user/refresh`
Refresh user session and shop context

#### POST `/api/user/validate-permissions`
Validate user permissions for actions

## 🏗️ Models & Relationships

### Currency Model
- **Methods**: `formatAmount()`, `calculateOptimalChange()`, `getExchangeRateTo()`, `convertTo()`
- **Relationships**: denominations, sales, shops
- **Scopes**: `active()`, `withRecentRates()`

### CurrencyDenomination Model
- **Methods**: `isBill()`, `isCoin()`, `calculateTotal()`
- **Relationships**: currency
- **Scopes**: `bills()`, `coins()`, `orderByValue()`

### PaymentMethod Model
- **Methods**: `requiresBreakdown()`, `canCalculateChange()`, `supportsPartialPayment()`
- **Relationships**: shops (many-to-many)
- **Configuration**: JSON-based method settings

### Enhanced User Model
- **Methods**: `hasAccessToShop()`, `switchToShop()`, `getCurrentShop()`, `getPreferredCurrency()`
- **Relationships**: Enhanced shop relationships, drawer sessions, cash transactions
- **API Response**: `toApiResponse()` with comprehensive data

### Enhanced Shop Model
- **Methods**: `acceptsCurrency()`, `isPaymentMethodEnabled()`, `formatAmount()`
- **Relationships**: currencies, payment methods, cash transactions
- **Currency Settings**: JSON-based configuration

### Enhanced Sale Model
- **Methods**: `addPayment()`, `getCashPayments()`, `getExchangeRate()`
- **Multi-currency**: Support for different currencies per sale
- **Payment Tracking**: Detailed payment breakdown

### Enhanced Payment Model
- **Methods**: `validateBreakdown()`, `calculateBreakdownTotal()`, `getCashBreakdownSummary()`
- **Cash Breakdown**: Detailed denomination tracking
- **Factory Methods**: `createCashPayment()`, `createCardPayment()`

### CashDrawerTransaction Model
- **Methods**: `isCashAddition()`, `isCashRemoval()`, `validateBreakdown()`
- **Factory Methods**: `createOpening()`, `createDrop()`, `createClosing()`
- **Audit Trail**: Complete transaction history

## 🔧 Configuration

### Supported Currencies
1. **USD** - US Dollar (11 denominations)
2. **EUR** - Euro (15 denominations) 
3. **GBP** - British Pound (12 denominations)
4. **KES** - Kenyan Shilling (9 denominations)
5. **CAD** - Canadian Dollar (10 denominations)
6. **AUD** - Australian Dollar (11 denominations)
7. **JPY** - Japanese Yen (10 denominations)
8. **INR** - Indian Rupee (11 denominations)

### Payment Methods
1. **Cash** - Requires breakdown, calculates change
2. **Card** - No breakdown, no change
3. **Mobile Money** - No breakdown, no change  
4. **Bank Transfer** - Requires reference
5. **Gift Card** - Supports partial, calculates change
6. **Store Credit** - Supports partial, calculates change
7. **Check** - Disabled by default
8. **Cryptocurrency** - Disabled by default
9. **Buy Now Pay Later** - Disabled by default
10. **Loyalty Points** - Supports partial redemption

## 📈 Usage Examples

### Cash Breakdown Validation
```php
// Validate cash breakdown
$currency = Currency::where('code', 'USD')->first();
$breakdown = ['20' => 2, '5' => 1, '1' => 2, '0.25' => 3];
$isValid = $currency->calculateCashTotal($breakdown) === 47.75;
```

### Multi-Currency Sale
```php
// Create sale in different currency
$sale = Sale::create([
    'shop_id' => 1,
    'currency' => 'EUR',
    'total_amount' => 85.50,
    'exchange_rates' => ['EUR' => 0.85]
]);

// Add split payments
$sale->addPayment('cash', 50.00, [
    'cash_breakdown' => ['20' => 2, '10' => 1],
    'currency' => 'EUR'
]);
$sale->addPayment('card', 35.50);
```

### Shop Currency Configuration
```php
// Update shop currency settings
$shop = Shop::find(1);
$shop->addAcceptedCurrency('EUR');
$shop->setCurrencySetting('auto_convert', true);
$shop->enablePaymentMethod($cashMethod, ['require_breakdown' => true]);
```

### Cash Drawer Management
```php
// Open drawer with breakdown
$transaction = CashDrawerTransaction::createOpening(
    $shopId, $userId, 200.00, 'USD',
    ['100' => 1, '50' => 1, '20' => 2, '10' => 1]
);

// Validate breakdown
$isValid = $transaction->validateBreakdown(); // true
```

## 🔍 Testing

### Feature Tests
- Currency CRUD operations
- Cash breakdown validation
- Multi-payment processing
- Shop context switching
- Exchange rate management

### Unit Tests  
- Currency formatting
- Denomination calculations
- Payment validation
- User permissions
- Shop relationships

## 🚀 Deployment

### Migration Order
1. `add_currency_and_cash_breakdown_support`
2. Run `CurrencySeeder`
3. Run `PaymentMethodSeeder`  
4. `add_currency_foreign_keys`
5. Run `ScaleSeeder` (optional)

### Environment Variables
```env
# Currency API Configuration
CURRENCY_PROVIDER=ecb
CURRENCY_UPDATE_INTERVAL=60
CURRENCY_BASE=USD

# Cash Management
CASH_BREAKDOWN_TOLERANCE=0.01
DRAWER_SESSION_TIMEOUT=720
```

## 📝 Best Practices

### Currency Management
- Always validate exchange rates before use
- Store rates with timestamps
- Use proper decimal precision
- Handle currency conversion errors gracefully

### Cash Breakdown
- Validate breakdowns on both client and server
- Store complete audit trails
- Use denomination-specific validation
- Handle edge cases (no coins, large bills)

### Payment Processing
- Validate payment methods per shop
- Store complete payment metadata
- Handle partial payments correctly
- Maintain referential integrity

### Shop Context
- Validate user access before operations
- Check drawer session status
- Preserve context across requests
- Handle shop switching gracefully

## 🔒 Security Considerations

- **Permission validation** for all shop operations
- **Currency rate tampering** protection
- **Cash breakdown audit** trails
- **Payment reference** validation
- **Shop access control** enforcement

## 📊 Performance Optimizations

- **Eager loading** of relationships
- **Database indexing** on foreign keys
- **Query optimization** for reports
- **Caching** of exchange rates
- **Pagination** for large datasets

This backend enhancement provides a robust foundation for advanced POS operations with comprehensive multi-currency support, detailed cash management, and flexible payment processing capabilities.