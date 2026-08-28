import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "./api-client";
import { generateId } from "./store";

export const useCustomerStore = create()(
  persist(
    (set, get) => ({
      customers: [],
      customersLoading: false,
      refunds: [],
      exchanges: [],

      // Load customers from backend
      loadCustomers: async () => {
        set({ customersLoading: true });
        try {
          const response = await apiClient.get('/customers');
          const data = response.data ?? response;
          set({ customers: data.data || data, customersLoading: false });
        } catch (e) {
          console.error('Failed to load customers', e);
          set({ customersLoading: false });
          throw e;
        }
      },

      addCustomer: async (customerData) => {
        try {
          const response = await apiClient.post('/customers', customerData);
          const newCustomer = response.data?.data || response.data || response;
          // Update local state
          set((state) => ({ customers: [...state.customers, newCustomer] }));
          return newCustomer;
        } catch (e) {
          console.error('Failed to add customer', e?.response?.data || e?.message || e);
          throw e; // Re-throw to let the form handle the error
        }
      },

      updateCustomer: async (id, updates) => {
        try {
          const response = await apiClient.put(`/customers/${id}`, updates);
          const updatedCustomer = response.data?.data || response.data || response;
          // Update local state
          set((state) => ({
            customers: state.customers.map((c) => c.id === id ? updatedCustomer : c)
          }));
          return updatedCustomer;
        } catch (e) {
          console.error('Failed to update customer', e);
          throw e;
        }
      },

      deleteCustomer: async (id) => {
        try {
          await apiClient.delete(`/customers/${id}`);
          // Update local state
          set((state) => ({
            customers: state.customers.filter((c) => c.id !== id)
          }));
        } catch (e) {
          console.error('Failed to delete customer', e);
          throw e;
        }
      },

      getCustomerById: (id) => {
        return get().customers.find((c) => c.id === id);
      },

      addLoyaltyPoints: (customerId, points) => {
        set((state) => ({
          customers: state.customers.map(
            (c) => c.id === customerId ? { ...c, loyaltyPoints: (c.loyaltyPoints || 0) + points } : c
          )
        }));
      },

      redeemLoyaltyPoints: (customerId, points) => {
        const customer = get().customers.find((c) => c.id === customerId);
        if (!customer || (customer.loyaltyPoints || 0) < points) return false;
        set((state) => ({
          customers: state.customers.map(
            (c) => c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints - points } : c
          )
        }));
        return true;
      },

      addPurchaseToHistory: (customerId, sale) => {
        set((state) => ({
          customers: state.customers.map(
            (c) => c.id === customerId ? {
              ...c,
              purchaseHistory: [...(c.purchaseHistory || []), sale],
              totalPurchases: (c.totalPurchases || 0) + 1
            } : c
          )
        }));
      },

      createRefund: (refundData) => {
        const newRefund = {
          ...refundData,
          id: generateId(),
          createdAt: new Date()
        };
        set((state) => ({ refunds: [...state.refunds, newRefund] }));
        return newRefund;
      },

      updateRefundStatus: (id, status) => {
        set((state) => ({
          refunds: state.refunds.map(
            (r) => r.id === id ? { ...r, status, completedAt: status === "completed" ? new Date() : r.completedAt } : r
          )
        }));
      },

      createExchange: (exchangeData) => {
        const newExchange = {
          ...exchangeData,
          id: generateId(),
          createdAt: new Date()
        };
        set((state) => ({ exchanges: [...state.exchanges, newExchange] }));
        return newExchange;
      },

      searchCustomers: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().customers.filter(
          (c) => c.name?.toLowerCase().includes(lowerQuery) ||
            c.email?.toLowerCase().includes(lowerQuery) ||
            c.phone?.includes(query)
        );
      }
    }),
    {
      name: "customer-storage"
    }
  )
);
