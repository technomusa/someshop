import { create } from "zustand";
import apiClient from "./api-client";
import { queryClient } from "@/components/query-provider";

export const useInventoryStore = create()(
  () => ({
      // Stock Adjustments - Backend integrated
      adjustInventory: async (productId, variantId, quantity, type = 'add', reason = 'Manual Adjustment') => {
        try {
          const response = await apiClient.post('/inventory/adjust', {
            product_id: productId,
            variation_id: variantId,
            quantity: Math.abs(quantity),
            type: type, // 'add', 'subtract', or 'set'
            reason,
          });
          const adjustment = response.data ?? response;
          // Invalidate and refetch inventory and movements
          await queryClient.invalidateQueries({ queryKey: ['inventory'] });
          await queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
          await queryClient.invalidateQueries({ queryKey: ['products'] });
          return adjustment;
        } catch (e) {
          console.error('Failed to adjust inventory', e);
          throw e;
        }
      },

      // Receive Stock - Backend integrated
      receiveInventory: async (productId, variantId, quantity, supplierId = null, batchNumber = null, expiryDate = null, costPrice = null) => {
        try {
          const response = await apiClient.post('/inventory/receive', {
            product_id: productId,
            variation_id: variantId,
            quantity,
            supplier_id: supplierId,
            batch_number: batchNumber,
            expiry_date: expiryDate,
            cost_price: costPrice,
          });
          const received = response.data ?? response;
          // Invalidate and refetch inventory and movements
          await queryClient.invalidateQueries({ queryKey: ['inventory'] });
          await queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
          await queryClient.invalidateQueries({ queryKey: ['products'] });
          return received;
        } catch (e) {
          console.error('Failed to receive inventory', e);
          throw e;
        }
      },

      // Stock Transfers - Backend integrated
      stockTransfers: [],
      transferInventory: async (productId, variantId, quantity, toShopId) => {
        try {
          const response = await apiClient.post('/inventory/transfer', {
            product_id: productId,
            variation_id: variantId,
            quantity,
            to_shop_id: toShopId,
          });
          const transfer = response.data ?? response;
          // Invalidate and refetch inventory and movements
          await queryClient.invalidateQueries({ queryKey: ['inventory'] });
          await queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
          await queryClient.invalidateQueries({ queryKey: ['products'] });
          return transfer;
        } catch (e) {
          console.error('Failed to transfer inventory', e);
          throw e;
        }
      },

      updateTransferStatus: (id, status) => {
        // This would need an API endpoint to update transfer status
        // For now, just invalidate queries to refetch
        queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
      }
    })
);
