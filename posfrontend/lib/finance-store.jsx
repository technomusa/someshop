import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./store";

const todayKey = () => new Date().toISOString().split("T")[0];

// Currency denomination configurations with extended support
const CURRENCY_DENOMINATIONS = {
  USD: [
    { value: 100, label: "$100", type: "bill", color: "green" },
    { value: 50, label: "$50", type: "bill", color: "green" },
    { value: 20, label: "$20", type: "bill", color: "green" },
    { value: 10, label: "$10", type: "bill", color: "green" },
    { value: 5, label: "$5", type: "bill", color: "green" },
    { value: 1, label: "$1", type: "bill", color: "green" },
    { value: 0.5, label: "50¢", type: "coin", color: "silver" },
    { value: 0.25, label: "25¢", type: "coin", color: "silver" },
    { value: 0.1, label: "10¢", type: "coin", color: "copper" },
    { value: 0.05, label: "5¢", type: "coin", color: "copper" },
    { value: 0.01, label: "1¢", type: "coin", color: "copper" },
  ],
  EUR: [
    { value: 500, label: "€500", type: "bill", color: "purple" },
    { value: 200, label: "€200", type: "bill", color: "yellow" },
    { value: 100, label: "€100", type: "bill", color: "green" },
    { value: 50, label: "€50", type: "bill", color: "orange" },
    { value: 20, label: "€20", type: "bill", color: "blue" },
    { value: 10, label: "€10", type: "bill", color: "red" },
    { value: 5, label: "€5", type: "bill", color: "gray" },
    { value: 2, label: "€2", type: "coin", color: "gold" },
    { value: 1, label: "€1", type: "coin", color: "gold" },
    { value: 0.5, label: "50¢", type: "coin", color: "gold" },
    { value: 0.2, label: "20¢", type: "coin", color: "gold" },
    { value: 0.1, label: "10¢", type: "coin", color: "gold" },
    { value: 0.05, label: "5¢", type: "coin", color: "copper" },
    { value: 0.02, label: "2¢", type: "coin", color: "copper" },
    { value: 0.01, label: "1¢", type: "coin", color: "copper" },
  ],
  GBP: [
    { value: 50, label: "£50", type: "bill", color: "red" },
    { value: 20, label: "£20", type: "bill", color: "purple" },
    { value: 10, label: "£10", type: "bill", color: "orange" },
    { value: 5, label: "£5", type: "bill", color: "blue" },
    { value: 2, label: "£2", type: "coin", color: "silver" },
    { value: 1, label: "£1", type: "coin", color: "gold" },
    { value: 0.5, label: "50p", type: "coin", color: "silver" },
    { value: 0.2, label: "20p", type: "coin", color: "silver" },
    { value: 0.1, label: "10p", type: "coin", color: "silver" },
    { value: 0.05, label: "5p", type: "coin", color: "copper" },
    { value: 0.02, label: "2p", type: "coin", color: "copper" },
    { value: 0.01, label: "1p", type: "coin", color: "copper" },
  ],
  KES: [
    { value: 1000, label: "KSh 1000", type: "bill", color: "green" },
    { value: 500, label: "KSh 500", type: "bill", color: "blue" },
    { value: 200, label: "KSh 200", type: "bill", color: "orange" },
    { value: 100, label: "KSh 100", type: "bill", color: "red" },
    { value: 50, label: "KSh 50", type: "bill", color: "purple" },
    { value: 20, label: "KSh 20", type: "coin", color: "gold" },
    { value: 10, label: "KSh 10", type: "coin", color: "silver" },
    { value: 5, label: "KSh 5", type: "coin", color: "copper" },
    { value: 1, label: "KSh 1", type: "coin", color: "copper" },
  ],
  CAD: [
    { value: 100, label: "C$100", type: "bill", color: "brown" },
    { value: 50, label: "C$50", type: "bill", color: "red" },
    { value: 20, label: "C$20", type: "bill", color: "green" },
    { value: 10, label: "C$10", type: "bill", color: "purple" },
    { value: 5, label: "C$5", type: "bill", color: "blue" },
    { value: 2, label: "C$2", type: "coin", color: "gold" },
    { value: 1, label: "C$1", type: "coin", color: "gold" },
    { value: 0.25, label: "25¢", type: "coin", color: "silver" },
    { value: 0.1, label: "10¢", type: "coin", color: "silver" },
    { value: 0.05, label: "5¢", type: "coin", color: "copper" },
  ],
  AUD: [
    { value: 100, label: "A$100", type: "bill", color: "green" },
    { value: 50, label: "A$50", type: "bill", color: "yellow" },
    { value: 20, label: "A$20", type: "bill", color: "red" },
    { value: 10, label: "A$10", type: "bill", color: "blue" },
    { value: 5, label: "A$5", type: "bill", color: "pink" },
    { value: 2, label: "A$2", type: "coin", color: "gold" },
    { value: 1, label: "A$1", type: "coin", color: "gold" },
    { value: 0.5, label: "50¢", type: "coin", color: "silver" },
    { value: 0.2, label: "20¢", type: "coin", color: "silver" },
    { value: 0.1, label: "10¢", type: "coin", color: "silver" },
    { value: 0.05, label: "5¢", type: "coin", color: "copper" },
  ],
  JPY: [
    { value: 10000, label: "¥10000", type: "bill", color: "brown" },
    { value: 5000, label: "¥5000", type: "bill", color: "blue" },
    { value: 2000, label: "¥2000", type: "bill", color: "green" },
    { value: 1000, label: "¥1000", type: "bill", color: "blue" },
    { value: 500, label: "¥500", type: "coin", color: "silver" },
    { value: 100, label: "¥100", type: "coin", color: "silver" },
    { value: 50, label: "¥50", type: "coin", color: "silver" },
    { value: 10, label: "¥10", type: "coin", color: "copper" },
    { value: 5, label: "¥5", type: "coin", color: "copper" },
    { value: 1, label: "¥1", type: "coin", color: "silver" },
  ],
  INR: [
    { value: 2000, label: "₹2000", type: "bill", color: "pink" },
    { value: 500, label: "₹500", type: "bill", color: "yellow" },
    { value: 200, label: "₹200", type: "bill", color: "orange" },
    { value: 100, label: "₹100", type: "bill", color: "green" },
    { value: 50, label: "₹50", type: "bill", color: "purple" },
    { value: 20, label: "₹20", type: "bill", color: "red" },
    { value: 10, label: "₹10", type: "bill", color: "brown" },
    { value: 10, label: "₹10", type: "coin", color: "gold" },
    { value: 5, label: "₹5", type: "coin", color: "silver" },
    { value: 2, label: "₹2", type: "coin", color: "silver" },
    { value: 1, label: "₹1", type: "coin", color: "silver" },
  ],
};

// Currency symbols and formatting
const CURRENCY_CONFIG = {
  USD: { symbol: "$", name: "US Dollar", position: "before", decimals: 2 },
  EUR: { symbol: "€", name: "Euro", position: "before", decimals: 2 },
  GBP: { symbol: "£", name: "British Pound", position: "before", decimals: 2 },
  KES: {
    symbol: "KSh",
    name: "Kenyan Shilling",
    position: "before",
    decimals: 2,
  },
  CAD: {
    symbol: "C$",
    name: "Canadian Dollar",
    position: "before",
    decimals: 2,
  },
  AUD: {
    symbol: "A$",
    name: "Australian Dollar",
    position: "before",
    decimals: 2,
  },
  JPY: { symbol: "¥", name: "Japanese Yen", position: "before", decimals: 0 },
  INR: { symbol: "₹", name: "Indian Rupee", position: "before", decimals: 2 },
};

// Payment method configurations
const PAYMENT_METHOD_CONFIG = {
  cash: {
    name: "Cash",
    icon: "banknote",
    requiresBreakdown: true,
    canCalculateChange: true,
    supportsPartialPayment: true,
  },
  card: {
    name: "Card",
    icon: "credit-card",
    requiresBreakdown: false,
    canCalculateChange: false,
    supportsPartialPayment: false,
  },
  mobile_money: {
    name: "Mobile Money",
    icon: "smartphone",
    requiresBreakdown: false,
    canCalculateChange: false,
    supportsPartialPayment: false,
  },
  bank_transfer: {
    name: "Bank Transfer",
    icon: "building-2",
    requiresBreakdown: false,
    canCalculateChange: false,
    supportsPartialPayment: false,
  },
  gift_card: {
    name: "Gift Card",
    icon: "gift",
    requiresBreakdown: false,
    canCalculateChange: true,
    supportsPartialPayment: true,
  },
  store_credit: {
    name: "Store Credit",
    icon: "wallet",
    requiresBreakdown: false,
    canCalculateChange: true,
    supportsPartialPayment: true,
  },
};

// Quick amounts for different currencies (common denominations)
const CURRENCY_QUICK_AMOUNTS = {
  USD: [5, 10, 20, 50, 100],
  EUR: [5, 10, 20, 50, 100],
  GBP: [5, 10, 20, 50],
  KES: [50, 100, 500, 1000],
  CAD: [5, 10, 20, 50, 100],
  AUD: [5, 10, 20, 50, 100],
  JPY: [1000, 5000, 10000],
  INR: [50, 100, 500, 2000],
};

export const useFinanceStore = create()(
  persist(
    (set, get) => ({
      requireEODClose: true,
      dailyClosures: [],
      auditLogs: [],
      cashDrops: [],
      eodDeadlineHour: 23, // 11 PM default
      eodDeadlineMinute: 59,
      missedClosureAlerts: [],

      // Get denominations for a currency
      getDenominations: (currency = "USD") => {
        return CURRENCY_DENOMINATIONS[currency] || CURRENCY_DENOMINATIONS.USD;
      },

      // Calculate total from denomination breakdown
      calculateCashTotal: (denominations) => {
        if (!denominations || typeof denominations !== "object") return 0;
        return Object.entries(denominations).reduce((total, [value, count]) => {
          return total + (parseFloat(value) || 0) * (parseInt(count) || 0);
        }, 0);
      },

      // Generate default denomination structure
      getDefaultDenominations: (currency = "USD") => {
        const denoms = get().getDenominations(currency);
        const structure = {};
        denoms.forEach((d) => {
          structure[d.value.toString()] = 0;
        });
        return structure;
      },
      recordOpening: (amount) => {
        const key = todayKey();
        const existing = get().dailyClosures.find((c) => c.date === key);
        if (existing) {
          set((state) => ({
            dailyClosures: state.dailyClosures.map((c) =>
              c.date === key ? { ...c, openingCash: amount } : c,
            ),
          }));
          return;
        }
        set((state) => ({
          dailyClosures: [
            ...state.dailyClosures,
            {
              id: generateId(),
              date: key,
              openingCash: amount,
              createdAt: new Date(),
            },
          ],
        }));
      },
      recordDrop: ({ amount, type = "cash", cashier }) => {
        const entry = {
          id: generateId(),
          amount,
          type,
          cashier,
          createdAt: new Date(),
          date: todayKey(),
        };
        set((state) => ({ cashDrops: [...state.cashDrops, entry] }));
        return entry;
      },
      logAudit: ({ kind, message, metadata }) => {
        const entry = {
          id: generateId(),
          kind,
          message,
          metadata,
          createdAt: new Date(),
          date: todayKey(),
        };
        set((state) => ({
          auditLogs: [entry, ...state.auditLogs].slice(0, 200),
        }));
        return entry;
      },
      closeDay: ({
        cashCount = 0,
        cardTotal = 0,
        expectedTotal = 0,
        notes,
        denominations,
        cashier,
        currency = "USD",
      }) => {
        const key = todayKey();
        // Calculate cash from denominations if provided
        const calculatedCash = denominations
          ? get().calculateCashTotal(denominations)
          : cashCount;
        const finalCashCount = calculatedCash || cashCount;
        const discrepancy = finalCashCount + cardTotal - expectedTotal;
        const status = Math.abs(discrepancy) < 0.01 ? "balanced" : "mismatch";
        const existing = get().dailyClosures.find((c) => c.date === key);
        const closure = {
          id: existing?.id || generateId(),
          date: key,
          openingCash: existing?.openingCash,
          cashCount: finalCashCount,
          cardTotal,
          expectedTotal,
          discrepancy,
          status,
          notes,
          denominations:
            denominations || get().getDefaultDenominations(currency),
          currency,
          cashier,
          closedAt: new Date(),
        };
        set((state) => ({
          dailyClosures: state.dailyClosures
            .filter((c) => c.date !== key)
            .concat(closure),
          missedClosureAlerts: state.missedClosureAlerts.filter(
            (a) => a.date !== key,
          ),
        }));
        get().logAudit({
          kind: "closure",
          message: `Closed day ${key} (${status})`,
          metadata: {
            discrepancy,
            expectedTotal,
            cashCount: finalCashCount,
            cardTotal,
            cashier,
            currency,
          },
        });
        return closure;
      },

      // Check if EOD closure is overdue
      checkEODStatus: () => {
        const key = todayKey();
        const closure = get().getTodayClosure();
        const now = new Date();
        const deadline = new Date();
        deadline.setHours(get().eodDeadlineHour, get().eodDeadlineMinute, 0, 0);

        if (closure) {
          return { isClosed: true, isOverdue: false, closure };
        }

        const isOverdue = now > deadline;
        return { isClosed: false, isOverdue, deadline };
      },

      // Create missed closure alert
      createMissedClosureAlert: (date) => {
        const existing = get().missedClosureAlerts.find((a) => a.date === date);
        if (existing) return existing;

        const alert = {
          id: generateId(),
          date,
          createdAt: new Date(),
          notified: false,
          severity: "critical",
        };
        set((state) => ({
          missedClosureAlerts: [...state.missedClosureAlerts, alert],
        }));
        get().logAudit({
          kind: "alert",
          message: `Missed EOD closure for ${date}`,
          metadata: { date, type: "missed_closure" },
        });
        return alert;
      },

      // Mark alert as notified
      markAlertNotified: (alertId) => {
        set((state) => ({
          missedClosureAlerts: state.missedClosureAlerts.map((a) =>
            a.id === alertId
              ? { ...a, notified: true, notifiedAt: new Date() }
              : a,
          ),
        }));
      },

      // Get active alerts
      getActiveAlerts: () => {
        return get().missedClosureAlerts.filter((a) => !a.notified);
      },
      getTodayClosure: () => {
        const key = todayKey();
        return get().dailyClosures.find((c) => c.date === key);
      },
      getClosures: () => get().dailyClosures,
      exportClosuresCsv: () => {
        const rows = [
          [
            "Date",
            "Cash",
            "Card",
            "Expected",
            "Discrepancy",
            "Status",
            "Cashier",
            "Notes",
          ],
        ];
        get().dailyClosures.forEach((c) => {
          rows.push([
            c.date,
            c.cashCount ?? "",
            c.cardTotal ?? "",
            c.expectedTotal ?? "",
            c.discrepancy ?? "",
            c.status ?? "",
            c.cashier ?? "",
            c.notes ?? "",
          ]);
        });
        return rows.map((r) => r.join(",")).join("\n");
      },

      // Enhanced cash breakdown methods
      getCurrencyConfig: (currency = "USD") => {
        return CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
      },

      getPaymentMethodConfig: (method) => {
        return PAYMENT_METHOD_CONFIG[method];
      },

      getQuickAmounts: (currency = "USD") => {
        return CURRENCY_QUICK_AMOUNTS[currency] || CURRENCY_QUICK_AMOUNTS.USD;
      },

      getSupportedCurrencies: () => {
        return Object.keys(CURRENCY_CONFIG).map((code) => ({
          code,
          ...CURRENCY_CONFIG[code],
        }));
      },

      formatCurrency: (amount, currency = "USD") => {
        const config = get().getCurrencyConfig(currency);
        const decimals = config.decimals;
        const formattedAmount = Number(amount).toFixed(decimals);

        if (config.position === "before") {
          return `${config.symbol}${formattedAmount}`;
        }
        return `${formattedAmount}${config.symbol}`;
      },

      // Calculate optimal change breakdown
      calculateOptimalChange: (changeAmount, currency = "USD") => {
        const denominations = get().getDenominations(currency);
        const result = {};
        let remaining = Math.round(changeAmount * 100) / 100; // Avoid floating point issues

        // Sort denominations by value descending
        const sortedDenoms = [...denominations].sort(
          (a, b) => b.value - a.value,
        );

        for (const denom of sortedDenoms) {
          if (remaining >= denom.value) {
            const count = Math.floor(remaining / denom.value);
            result[denom.value.toString()] = count;
            remaining =
              Math.round((remaining - count * denom.value) * 100) / 100;
          }
        }

        return result;
      },

      // Validate cash breakdown
      validateCashBreakdown: (breakdown, expectedTotal, currency = "USD") => {
        const calculatedTotal = get().calculateCashTotal(breakdown);
        const difference = Math.abs(calculatedTotal - expectedTotal);
        const tolerance = 0.01; // 1 cent tolerance

        return {
          isValid: difference <= tolerance,
          calculatedTotal,
          expectedTotal,
          difference,
          breakdown,
        };
      },

      // Get denomination statistics
      getDenominationStats: (breakdown, currency = "USD") => {
        const denominations = get().getDenominations(currency);
        const stats = {
          totalPieces: 0,
          totalValue: 0,
          bills: { count: 0, value: 0 },
          coins: { count: 0, value: 0 },
          byType: {},
        };

        Object.entries(breakdown).forEach(([value, count]) => {
          const denom = denominations.find((d) => d.value.toString() === value);
          if (!denom) return;

          const numCount = parseInt(count) || 0;
          const numValue = parseFloat(value);
          const totalValue = numCount * numValue;

          stats.totalPieces += numCount;
          stats.totalValue += totalValue;

          if (denom.type === "bill") {
            stats.bills.count += numCount;
            stats.bills.value += totalValue;
          } else {
            stats.coins.count += numCount;
            stats.coins.value += totalValue;
          }

          stats.byType[denom.type] = stats.byType[denom.type] || {
            count: 0,
            value: 0,
          };
          stats.byType[denom.type].count += numCount;
          stats.byType[denom.type].value += totalValue;
        });

        return stats;
      },

      // Split payment across multiple methods
      splitPayment: (totalAmount, payments) => {
        const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = totalAmount - total;

        return {
          totalAmount,
          totalPaid: total,
          remaining: Math.max(0, remaining),
          isComplete: remaining <= 0.01,
          payments: payments.map((p) => ({
            ...p,
            percentage: ((p.amount || 0) / totalAmount) * 100,
          })),
        };
      },

      // Generate cash register report
      generateCashRegisterReport: (date = null) => {
        const targetDate = date || todayKey();
        const closure = get().dailyClosures.find((c) => c.date === targetDate);
        const drops = get().cashDrops.filter((d) => d.date === targetDate);

        if (!closure) return null;

        const totalDrops = drops.reduce((sum, d) => sum + d.amount, 0);
        const expectedCashAfterDrops =
          (closure.openingCash || 0) + (closure.cashCount || 0) - totalDrops;

        return {
          date: targetDate,
          openingCash: closure.openingCash || 0,
          cashSales: closure.cashCount || 0,
          cardSales: closure.cardTotal || 0,
          totalSales: (closure.cashCount || 0) + (closure.cardTotal || 0),
          cashDrops: drops,
          totalDrops,
          expectedCashAfterDrops,
          actualCashCount: closure.cashCount || 0,
          discrepancy: closure.discrepancy || 0,
          status: closure.status,
          denominations: closure.denominations,
          notes: closure.notes,
          cashier: closure.cashier,
        };
      },
    }),
    {
      name: "finance-store",
    },
  ),
);
