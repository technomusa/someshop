import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "./api-client";

export const useAccountingStore = create()(
    persist(
        (set, get) => ({
            expenses: [],
            expensesLoading: false,
            drawerSessions: [],
            sessionsLoading: false,
            currentSession: null,

            // Helpers: currency formatting and simple optimal change (greedy)
            formatCurrency: (amount, currency = 'USD') => {
                try {
                    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
                } catch (e) {
                    return `${currency} ${Number(amount).toFixed(2)}`;
                }
            },

            calculateOptimalChange: (amount, currency = 'USD') => {
                // Simple greedy algorithm with common USD/EUR denominations (extendable)
                const DENOMS = {
                    USD: [100,50,20,10,5,1,0.25,0.10,0.05,0.01],
                    EUR: [200,100,50,20,10,5,2,1,0.50,0.20,0.10,0.05,0.02,0.01]
                };
                const denoms = DENOMS[currency] || DENOMS.USD;
                let remaining = Math.round(amount * 100) / 100;
                const breakdown = {};
                for (const d of denoms) {
                    const count = Math.floor(remaining / d);
                    if (count > 0) {
                        breakdown[d] = count;
                        remaining = Math.round((remaining - count * d) * 100) / 100;
                    }
                }
                return { breakdown, remainder: remaining };
            },

            validateCashBreakdown: (breakdown, expectedAmount) => {
                const total = Object.entries(breakdown || {}).reduce((acc, [value, count]) => {
                    const v = Number(value);
                    const c = Number(count) || 0;
                    return acc + v * c;
                }, 0);
                const diff = Math.round((total - expectedAmount) * 100) / 100;
                return { total: Math.round(total * 100) / 100, expected: expectedAmount, difference: diff, isValid: Math.abs(diff) < 0.01 };
            },

            // Expense Management
            addExpense: async (expenseData) => {
                try {
                    const response = await apiClient.post('/accounting/expenses', expenseData);
                    const newExpense = response.data ?? response;
                    set((state) => ({
                        expenses: [newExpense, ...state.expenses]
                    }));
                    return newExpense;
                } catch (e) {
                    console.error('Failed to add expense', e);
                    throw e;
                }
            },

            // Drawer/Register Management
            openDrawer: async (openingCash) => {
                try {
                    const response = await apiClient.post('/accounting/drawer/open', {
                        opening_cash: openingCash,
                    });
                    const session = response.data ?? response;
                    set({ currentSession: session });
                    return session;
                } catch (e) {
                    console.error('Failed to open drawer', e);
                    throw e;
                }
            },

            closeDrawer: async (actualCash, notes = '') => {
                try {
                    const response = await apiClient.post('/accounting/drawer/close', {
                        actual_cash: actualCash,
                        notes,
                    });
                    const result = response.data ?? response;
                    // compute discrepancy locally if server didn't
                    const expected = result.session?.closing_cash ?? result.expected_cash ?? null;
                    const difference = expected !== null ? Math.round((actualCash - Number(expected)) * 100) / 100 : null;
                    const validation = difference !== null ? { difference, isValid: Math.abs(difference) < 0.01 } : null;
                    set((state) => ({
                        currentSession: null,
                        drawerSessions: [result.session, ...state.drawerSessions],
                    }));
                    return { ...result, discrepancy: difference, validation };
                } catch (e) {
                    console.error('Failed to close drawer', e);
                    throw e;
                }
            },

            // Load user's drawer sessions
            loadMySessions: async () => {
                set({ sessionsLoading: true });
                try {
                    const response = await apiClient.get('/accounting/my-sessions');
                    const data = response.data ?? response;
                    set({
                        drawerSessions: data.data || data,
                        sessionsLoading: false
                    });
                } catch (e) {
                    console.error('Failed to load sessions', e);
                    set({ sessionsLoading: false });
                    throw e;
                }
            },

            // Check if drawer is currently open
            checkDrawerStatus: async () => {
                try {
                    const sessions = await get().loadMySessions();
                    const openSession = get().drawerSessions.find(
                        (s) => s.status === 'open'
                    );
                    if (openSession) {
                        set({ currentSession: openSession });
                    }
                    return openSession;
                } catch (e) {
                    console.error('Failed to check drawer status', e);
                    return null;
                }
            },
        }),
        {
            name: "accounting-storage",
        }
    )
);
