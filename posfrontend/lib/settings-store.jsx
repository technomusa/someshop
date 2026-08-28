import { create } from "zustand";
import { persist } from "zustand/middleware";
const defaultSettings = {
  storeName: "QuickMart POS",
  storeAddress: "123 Main Street, City Center",
  storePhone: "+1 234 567 8900",
  storeEmail: "contact@quickmart.com",
  taxRate: 16,
  currency: "USD",
  currencySymbol: "$",
  acceptedCurrencies: ["USD"],
  favoriteCurrencies: ["USD", "EUR"],
  autoUpdateRates: true,
  rateUpdateInterval: 60,
  exchangeRateProvider: "mock",
  exchangeRateSettings: {
    autoUpdate: true,
    updateInterval: 60,
    provider: "mock",
  },
  customExchangeRates: {},
  receiptHeader: "Thank you for shopping with us!",
  receiptFooter: "Please come again. Returns within 7 days with receipt.",
  lowStockThreshold: 10,
  enableLoyalty: true,
  loyaltyPointsPerAmount: 100,
  loyaltyAmountPerPoint: 1,
};
const defaultUsers = [
  {
    id: "user-1",
    name: "Admin User",
    email: "admin@quickmart.com",
    role: "admin",
    pin: "1234",
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    lastLogin: /* @__PURE__ */ new Date(),
  },
  {
    id: "user-2",
    name: "John Manager",
    email: "john@quickmart.com",
    role: "manager",
    pin: "5678",
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-02-15"),
    lastLogin: /* @__PURE__ */ new Date(),
  },
  {
    id: "user-3",
    name: "Sarah Cashier",
    email: "sarah@quickmart.com",
    role: "cashier",
    pin: "9012",
    isActive: true,
    createdAt: /* @__PURE__ */ new Date("2024-03-10"),
    lastLogin: /* @__PURE__ */ new Date(),
  },
];
const defaultBranches = [
  {
    id: "branch-1",
    name: "Main Store",
    address: "123 Main Street, City Center",
    phone: "+1 234 567 8900",
    isMain: true,
    isActive: true,
  },
  {
    id: "branch-2",
    name: "Downtown Branch",
    address: "456 Downtown Ave, Business District",
    phone: "+1 234 567 8901",
    isMain: false,
    isActive: true,
  },
];
const defaultTaxConfigs = [
  {
    id: "tax-1",
    name: "Standard VAT",
    rate: 16,
    isDefault: true,
    appliesTo: ["all"],
  },
  {
    id: "tax-2",
    name: "Zero Rate",
    rate: 0,
    isDefault: false,
    appliesTo: ["essentials"],
  },
];
const defaultPaymentMethods = [
  { id: "pm-1", name: "Cash", type: "cash", isEnabled: true, icon: "banknote" },
  {
    id: "pm-2",
    name: "Credit/Debit Card",
    type: "card",
    isEnabled: true,
    icon: "credit-card",
  },
  {
    id: "pm-3",
    name: "Mobile Money",
    type: "mobile",
    isEnabled: true,
    icon: "smartphone",
  },
  {
    id: "pm-4",
    name: "Store Credit",
    type: "credit",
    isEnabled: false,
    icon: "wallet",
  },
];
export const useSettingsStore = create()(
  persist(
    (set) => ({
      settings: defaultSettings,
      users: defaultUsers,
      branches: defaultBranches,
      taxConfigs: defaultTaxConfigs,
      paymentMethods: defaultPaymentMethods,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              id: `user-${Date.now()}`,
              createdAt: /* @__PURE__ */ new Date(),
            },
          ],
        })),
      updateUser: (id, data) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),
      addBranch: (branch) =>
        set((state) => ({
          branches: [
            ...state.branches,
            { ...branch, id: `branch-${Date.now()}` },
          ],
        })),
      updateBranch: (id, data) =>
        set((state) => ({
          branches: state.branches.map((b) =>
            b.id === id ? { ...b, ...data } : b,
          ),
        })),
      deleteBranch: (id) =>
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        })),
      addTaxConfig: (tax) =>
        set((state) => ({
          taxConfigs: [
            ...state.taxConfigs,
            { ...tax, id: `tax-${Date.now()}` },
          ],
        })),
      updateTaxConfig: (id, data) =>
        set((state) => ({
          taxConfigs: state.taxConfigs.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        })),
      deleteTaxConfig: (id) =>
        set((state) => ({
          taxConfigs: state.taxConfigs.filter((t) => t.id !== id),
        })),
      togglePaymentMethod: (id) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.map((pm) =>
            pm.id === id ? { ...pm, isEnabled: !pm.isEnabled } : pm,
          ),
        })),
    }),
    {
      name: "pos-settings",
    },
  ),
);
