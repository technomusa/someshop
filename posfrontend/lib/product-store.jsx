import { create } from "zustand";
import apiClient from "./api-client";
import { queryClient } from "@/components/query-provider";

export const useProductStore = create()(
  (set, get) => ({
      products: [],
      productsLoading: false,
      categories: [],
      categoriesLoading: false,
      
      // Load products from API
      loadProducts: async () => {
        set({ productsLoading: true });
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ["products"],
            queryFn: async () => {
              const res = await apiClient.get("/products");
              return res.data?.data || res.data || [];
            },
          });
          const items = (Array.isArray(data) ? data : []).map((p) => ({
            ...p,
            images: p.images || (p.image ? [p.image] : []),
            inventories: p.inventories || [],
            stock: p.inventories?.[0]?.quantity || p.stock || 0,
            basePrice: p.selling_price || p.base_price || 0,
            costPrice: p.cost_price || 0,
            category: p.category?.slug || p.category_id || p.category,
            brand: p.brand?.name || p.brand_id || p.brand,
          }));
          set({ products: items, productsLoading: false });
          return items;
        } catch (e) {
          console.error("Failed to load products", e);
          set({ productsLoading: false });
          throw e;
        }
      },
      
      // Add product via API
      addProduct: async (productData) => {
        try {
          const response = await apiClient.post("/products", productData);
          const newProduct = response.data?.data || response.data || response;
          // Invalidate and refetch products
          await queryClient.invalidateQueries({ queryKey: ["products"] });
          await get().loadProducts();
          return newProduct;
        } catch (e) {
          console.error("Failed to add product", e);
          throw e;
        }
      },
      
      // Update product via API
      updateProduct: async (id, updates) => {
        try {
          const response = await apiClient.put(`/products/${id}`, updates);
          const updatedProduct = response.data?.data || response.data || response;
          // Invalidate and refetch products
          await queryClient.invalidateQueries({ queryKey: ["products"] });
          await get().loadProducts();
          return updatedProduct;
        } catch (e) {
          console.error("Failed to update product", e);
          throw e;
        }
      },
      
      // Delete product via API
      deleteProduct: async (id) => {
        try {
          await apiClient.delete(`/products/${id}`);
          // Invalidate and refetch products
          await queryClient.invalidateQueries({ queryKey: ["products"] });
          await get().loadProducts();
        } catch (e) {
          console.error("Failed to delete product", e);
          throw e;
        }
      },
      
      // Toggle product status via API
      toggleProductStatus: async (id) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;
        try {
          await get().updateProduct(id, { is_active: !product.is_active });
        } catch (e) {
          console.error("Failed to toggle product status", e);
          throw e;
        }
      },
      
      // Load categories from API
      loadCategories: async () => {
        set({ categoriesLoading: true });
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ["categories"],
            queryFn: async () => {
              const res = await apiClient.get("/categories");
              return res.data?.data || res.data || [];
            },
          });
          set({ categories: Array.isArray(data) ? data : (data.data || []), categoriesLoading: false });
          return get().categories;
        } catch (e) {
          console.error("Failed to load categories", e);
          set({ categoriesLoading: false });
          throw e;
        }
      },
      // Variant operations (if needed in future)
      addVariant: async (productId, variantData) => {
        // This would need API endpoint for variants
        // For now, update the product with variants
        const product = get().products.find((p) => p.id === productId);
        if (!product) throw new Error("Product not found");
        const updatedVariants = [...(product.variants || []), variantData];
        return await get().updateProduct(productId, { variants: updatedVariants });
      },
      updateVariant: async (productId, variantId, updates) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) throw new Error("Product not found");
        const updatedVariants = (product.variants || []).map((v) => 
          v.id === variantId ? { ...v, ...updates } : v
        );
        return await get().updateProduct(productId, { variants: updatedVariants });
      },
      deleteVariant: async (productId, variantId) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) throw new Error("Product not found");
        const updatedVariants = (product.variants || []).filter((v) => v.id !== variantId);
        return await get().updateProduct(productId, { variants: updatedVariants });
      },
      updateStock: async (productId, shopId, quantity) => {
        // Update stock via inventory API
        try {
          await apiClient.post("/inventory/adjust", {
            product_id: productId,
            shop_id: shopId,
            quantity: quantity,
            reason: "manual_adjustment"
          });
          await queryClient.invalidateQueries({ queryKey: ["products"] });
          await get().loadProducts();
        } catch (e) {
          console.error("Failed to update stock", e);
          throw e;
        }
      },
      getProductsByCategory: (category) => {
        return get().products.filter((p) => {
          const cat = p.category?.slug || p.category_id || p.category;
          return cat === category;
        });
      },
      getLowStockProducts: () => {
        return get().products.filter((p) => {
          const stock = p.inventories?.[0]?.quantity || p.stock || 0;
          const reorderLevel = p.alert_quantity || p.reorderLevel || 10;
          return stock <= reorderLevel;
        });
      },
      getExpiringProducts: (daysAhead) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return get().products.filter((p) => {
          const expiry = p.expiry_date || p.expiryDate;
          return expiry && new Date(expiry) <= futureDate;
        });
      },
      searchProducts: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().products.filter(
          (p) => 
            p.name?.toLowerCase().includes(lowerQuery) || 
            p.sku?.toLowerCase().includes(lowerQuery) || 
            p.barcode?.includes(query) || 
            (typeof p.brand === 'string' ? p.brand.toLowerCase().includes(lowerQuery) : p.brand?.name?.toLowerCase().includes(lowerQuery))
        );
      }
    })
);
