import { create } from "zustand";
import apiClient from "./api-client";
import { queryClient } from "@/components/query-provider";

export const useSupplierStore = create()(
    (set, get) => ({
        suppliers: [],
        suppliersLoading: false,
        selectedSupplier: null,

        // Load all suppliers
        loadSuppliers: async () => {
            set({ suppliersLoading: true });
            try {
                const data = await queryClient.fetchQuery({
                    queryKey: ['suppliers'],
                    queryFn: async () => {
                        const response = await apiClient.get('/suppliers');
                        // Handle different response structures
                        if (response.data?.data && Array.isArray(response.data.data)) {
                            return response.data.data; // Paginated response
                        }
                        if (Array.isArray(response.data)) {
                            return response.data; // Direct array
                        }
                        return [];
                    },
                });
                set({ suppliers: Array.isArray(data) ? data : [], suppliersLoading: false });
                return data;
            } catch (e) {
                console.error('Failed to load suppliers', e);
                set({ suppliersLoading: false });
                throw e;
            }
        },

        // Add a new supplier
        addSupplier: async (supplierData) => {
            try {
                const response = await apiClient.post('/suppliers', supplierData);
                const newSupplier = response.data?.data || response.data || response;
                // Invalidate and refetch suppliers
                await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
                await get().loadSuppliers();
                return newSupplier;
            } catch (e) {
                console.error('Failed to add supplier', e);
                throw e;
            }
        },

        // Update supplier
        updateSupplier: async (id, supplierData) => {
            try {
                const response = await apiClient.put(`/suppliers/${id}`, supplierData);
                const updatedSupplier = response.data?.data || response.data || response;
                // Invalidate and refetch suppliers
                await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
                await get().loadSuppliers();
                return updatedSupplier;
            } catch (e) {
                console.error('Failed to update supplier', e);
                throw e;
            }
        },

        // Delete supplier
        deleteSupplier: async (id) => {
            try {
                await apiClient.delete(`/suppliers/${id}`);
                // Invalidate and refetch suppliers
                await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
                await get().loadSuppliers();
            } catch (e) {
                console.error('Failed to delete supplier', e);
                throw e;
            }
        },

        setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),
    })
);
