# Cash Breakdown & Currency Features

This document provides comprehensive documentation for the enhanced cash breakdown variations, currency management, and multi-payment features implemented in the POS frontend.

## 🌟 Overview

The POS system now supports advanced cash handling with detailed denomination breakdowns, multi-currency operations, and sophisticated payment splitting across multiple methods.

### Key Features
- **Smart Cash Breakdown**: Automatic optimal denomination calculation
- **Multi-Currency Support**: 8+ currencies with proper formatting and exchange rates
- **Multi-Payment Processing**: Split payments across different methods
- **Real-time Exchange Rates**: Live currency conversion (configurable)
- **Cash Register Management**: Comprehensive cash tracking and reporting

## 💰 Cash Breakdown Features

### Supported Currencies & Denominations

| Currency | Code | Symbol | Denominations | Bills | Coins |
|----------|------|--------|---------------|--------|--------|
| US Dollar | USD | $ | 11 | 6 | 5 |
| Euro | EUR | € | 14 | 7 | 7 |
| British Pound | GBP | £ | 12 | 4 | 8 |
| Kenyan Shilling | KES | KSh | 9 | 5 | 4 |
| Canadian Dollar | CAD | C$ | 10 | 5 | 5 |
| Australian Dollar | AUD | A$ | 11 | 5 | 6 |
| Japanese Yen | JPY | ¥ | 10 | 4 | 6 |
| Indian Rupee | INR | ₹ | 11 | 7 | 4 |

### Cash Breakdown Dialog

The `CashBreakdownDialog` component provides:

#### Features
- **Visual Denomination Cards**: Color-coded bills and coins
- **Real-time Calculation**: Automatic total calculation
- **Validation**: Amount matching with tolerance
- **Quick Calculate**: Optimal breakdown generation
- **Statistics**: Piece count and value summaries

#### Usage
```jsx
import { CashBreakdownDialog } from "@/components/pos/cash-breakdown-dialog";

<CashBreakdownDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  expectedAmount={125.75}
  currency="USD"
  mode="count" // or "change"
  onConfirm={(result) => {
    console.log('Breakdown:', result.breakdown);
    console.log('Total:', result.total);
    console.log('Stats:', result.stats);
  }}
/>
```

#### Breakdown Result Structure
```javascript
{
  breakdown: {
    "100": 1,    // 1x $100 bill
    "20": 1,     // 1x $20 bill
    "5": 1,      // 1x $5 bill
    "0.25": 3    // 3x 25¢ coins
  },
  total: 125.75,
  currency: "USD",
  stats: {
    totalPieces: 6,
    totalValue: 125.75,
    bills: { count: 3, value: 125.00 },
    coins: { count: 3, value: 0.75 }
  },
  validation: {
    isValid: true,
    calculatedTotal: 125.75,
    expectedTotal: 125.75,
    difference: 0
  }
}
```

### Optimal Change Calculation

The system automatically calculates the most efficient denomination breakdown:

```javascript
import { useFinanceStore } from "@/lib/finance-store";

const { calculateOptimalChange } = useFinanceStore();

// Calculate optimal change for $47.83 in USD
const breakdown = calculateOptimalChange(47.83, "USD");
// Returns: { "20": 2, "5": 1, "1": 2, "0.25": 3, "0.05": 1, "0.01": 3 }
```

## 🌍 Multi-Currency Support

### Currency Configuration

Each currency includes complete configuration:

```javascript
const CURRENCY_CONFIG = {
  USD: { 
    symbol: "$", 
    name: "US Dollar", 
    position: "before", 
    decimals: 2 
  },
  EUR: { 
    symbol: "€", 
    name: "Euro", 
    position: "before", 
    decimals: 2 
  },
  JPY: { 
    symbol: "¥", 
    name: "Japanese Yen", 
    position: "before", 
    decimals: 0 
  }
  // ... more currencies
};
```

### Currency Selector Component

The `CurrencySelector` provides rich currency switching:

#### Features
- **Compact Mode**: Button with current currency
- **Full Dialog**: Complete currency management
- **Exchange Rates**: Real-time rate display
- **Favorites**: Quick access to preferred currencies
- **Currency Converter**: Live conversion calculator

#### Usage
```jsx
import { CurrencySelector } from "@/components/pos/currency-selector";

// Compact mode
<CurrencySelector
  value={currentCurrency}
  onChange={setCurrency}
  compact={true}
  showExchangeRates={true}
/>

// Full dialog mode
<CurrencySelector
  value={currentCurrency}
  onChange={setCurrency}
  showExchangeRates={true}
  showFavorites={true}
/>
```

### Currency Display Component

Format amounts with proper currency symbols:

```jsx
import { CurrencyDisplay } from "@/components/pos/currency-selector";

<CurrencyDisplay 
  amount={125.75} 
  currency="EUR" 
/>
// Renders: €125.75

<CurrencyDisplay 
  amount={1000} 
  currency="JPY" 
/>
// Renders: ¥1000 (no decimals)
```

### Exchange Rate Management

#### Mock Exchange Rates
For development/demo purposes:
```javascript
const MOCK_EXCHANGE_RATES = {
  USD: { EUR: 0.85, GBP: 0.73, KES: 150.25 },
  EUR: { USD: 1.18, GBP: 0.86, KES: 177.35 },
  // ... more rates
};
```

#### Real Exchange Rate Providers
- European Central Bank (ECB)
- Fixer.io
- ExchangeRate-API
- Custom API endpoints

## 💳 Multi-Payment System

### Multi-Payment Dialog

The `MultiPaymentDialog` enables complex payment scenarios:

#### Features
- **Payment Method Cards**: Visual method selection
- **Amount Splitting**: Precise payment allocation  
- **Cash Breakdown Integration**: Full denomination tracking
- **Quick Split Options**: Predefined split scenarios
- **Validation**: Complete payment verification
- **Reference Tracking**: Transaction reference support

#### Supported Payment Methods
- **Cash**: With denomination breakdown
- **Credit/Debit Card**: Standard card processing
- **Mobile Money**: M-Pesa, GCash, etc.
- **Bank Transfer**: Direct bank payments
- **Gift Card**: Store gift card redemption
- **Store Credit**: Account credit usage

#### Usage
```jsx
import { MultiPaymentDialog } from "@/components/pos/multi-payment-dialog";

<MultiPaymentDialog
  open={showMultiPayment}
  onOpenChange={setShowMultiPayment}
  totalAmount={256.50}
  currency="USD"
  enabledMethods={["cash", "card", "mobile_money"]}
  onConfirm={(result) => {
    console.log('Payments:', result.payments);
    console.log('Split details:', result.split);
  }}
/>
```

#### Payment Result Structure
```javascript
{
  payments: [
    {
      id: "1",
      method: "cash",
      amount: 150.00,
      breakdown: { "100": 1, "50": 1 }, // Cash denomination
      reference: "CASH-001"
    },
    {
      id: "2", 
      method: "card",
      amount: 106.50,
      reference: "TXN-123456"
    }
  ],
  totalAmount: 256.50,
  currency: "USD",
  split: {
    totalPaid: 256.50,
    remaining: 0,
    isComplete: true
  }
}
```

### Quick Split Options

Pre-configured split scenarios:

1. **50/50 Split**: Equal cash/card split
2. **Cash + Card**: $100 cash, remainder card  
3. **Card Primary**: 80% card, 20% cash

## ⚙️ Settings & Configuration

### Currency Settings Page

Located at `/settings` → Currency tab:

#### Primary Currency
- Set main currency for pricing
- Updates all product prices
- Sets default for new transactions

#### Accepted Currencies  
- Enable multiple currency acceptance
- Configure per-currency settings
- Remove unused currencies

#### Exchange Rate Settings
- Auto-update configuration
- Update interval (15min - daily)
- Rate provider selection
- Custom rate overrides

#### Features
- **Favorites Management**: Quick currency access
- **Rate Override**: Custom exchange rates
- **Auto-update**: Configurable rate fetching
- **Visual Interface**: Currency cards with stats

### Store Integration

#### POS Store Updates
```javascript
// New currency-related state
currency: "USD",
setCurrency: (currency) => set({ currency }),
enabledPaymentMethods: ["cash", "card", "mobile_money"],
cashBreakdown: {},
setCashBreakdown: (breakdown) => set({ cashBreakdown: breakdown }),
```

#### Finance Store Enhancements  
```javascript
// Enhanced methods
formatCurrency: (amount, currency) => string,
calculateOptimalChange: (amount, currency) => breakdown,
validateCashBreakdown: (breakdown, expected, currency) => validation,
getDenominationStats: (breakdown, currency) => stats,
```

## 🧪 Demo & Testing

### Demo Page
Access the demo at `/demo/cash-currency` to explore:

- **Currency Switching**: Live denomination updates
- **Cash Breakdown**: Interactive counting simulation
- **Multi-Payment**: Split payment scenarios
- **Exchange Rates**: Live rate display
- **Feature Overview**: Complete functionality tour

### Test Scenarios

#### Cash Breakdown Testing
1. Set amount to $127.83
2. Switch to different currencies
3. Observe denomination changes
4. Test optimal breakdown calculation

#### Multi-Payment Testing  
1. Create $500 transaction
2. Split: $200 cash + $300 card
3. Add cash breakdown for cash portion
4. Verify total validation

#### Currency Testing
1. Switch between USD, EUR, GBP
2. Observe formatting changes
3. Test exchange rate display
4. Verify denomination differences

## 📋 Implementation Details

### File Structure
```
components/
├── pos/
│   ├── cash-breakdown-dialog.jsx
│   ├── currency-selector.jsx
│   ├── multi-payment-dialog.jsx
│   └── cart-panel.jsx (updated)
└── settings/
    └── currency-settings.jsx

lib/
├── finance-store.jsx (enhanced)
├── store.jsx (updated)
└── settings-store.jsx (updated)
```

### Key Dependencies
- Zustand (state management)
- React Hook Form (form handling)  
- Tailwind CSS (styling)
- Lucide React (icons)
- Shadcn/ui (components)

### Performance Considerations
- Lazy loading of currency data
- Memoized calculations  
- Debounced exchange rate updates
- Optimized re-renders

## 🚀 Usage Examples

### Basic POS Transaction
```jsx
// 1. Customer adds items to cart
// 2. Selects payment method
// 3. For cash: opens cash breakdown dialog
// 4. Counts physical cash denominations  
// 5. System validates amount
// 6. Completes transaction with breakdown record
```

### Multi-Currency Sale
```jsx
// 1. Customer from different country
// 2. Switch POS to their currency  
// 3. Display prices in local currency
// 4. Accept payment in multiple currencies
// 5. Apply real-time exchange rates
// 6. Generate receipt in customer's currency
```

### End-of-Day Cash Count
```jsx
// 1. Open cash breakdown dialog
// 2. Count all denominations in drawer
// 3. System calculates total
// 4. Compare with expected amount
// 5. Report any discrepancies
// 6. Generate detailed cash report
```

## 🔧 Customization

### Adding New Currencies
1. Update `CURRENCY_DENOMINATIONS` in finance-store
2. Add currency config to `CURRENCY_CONFIG`
3. Update quick amounts in `CURRENCY_QUICK_AMOUNTS`
4. Test denomination display and calculations

### Custom Payment Methods
1. Add method to `PAYMENT_METHOD_CONFIG`
2. Update payment dialog components
3. Add validation rules
4. Test integration with breakdowns

### Exchange Rate Providers
1. Implement provider interface
2. Add to settings configuration
3. Handle rate fetching and caching
4. Add error handling

## 📊 Analytics & Reporting

### Cash Flow Tracking
- Denomination-level reporting
- Cash drop tracking  
- Drawer reconciliation
- Variance analysis

### Currency Analytics
- Multi-currency sales reporting
- Exchange rate impact analysis
- Currency preference tracking
- Geographic sales insights

### Payment Method Analytics  
- Split payment frequency
- Method preference analysis
- Processing time metrics
- Error rate tracking

## 🔒 Security Considerations

### Cash Handling
- Breakdown validation
- Audit trail maintenance
- Discrepancy alerting
- Supervisor overrides

### Exchange Rates
- Rate tampering protection
- Historical rate logging
- Manual override auditing
- Provider verification

### Multi-Payment
- Split validation
- Reference tracking
- Fraud detection
- Transaction correlation

---

For technical support or feature requests, please refer to the main POS documentation or contact the development team.

## Notes about implemented frontend helpers (this patch)
- formatCurrency(amount, currency) is exported in posfrontend/lib/data.jsx and also available in accounting store (formatCurrency).
- calculateOptimalChange(amount, currency) available in posfrontend/lib/data.jsx and accounting store (greedy algorithm for demo).
- Frontend (public) now uses non-blocking toast messages (toast container in index.html) instead of alert().

## Quick manual test (frontend)
1. Start backend and frontend per QUICK_START.md.
2. Open the POS page, add items to the cart and click "Process Sale".
3. After sale completes, a receipt modal will appear and toast messages will show success/failure.
4. In the browser console you can run:
   - calculateOptimalChange(47.83, 'USD') from posfrontend/lib/data.jsx (if imported in demo)
   - formatCurrency(125.75, 'EUR')