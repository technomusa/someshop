import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "./api-client";
import { queryClient } from "@/components/query-provider";
export const generateId = () => Math.random().toString(36).substring(2, 15);
const calculateCartTotals = (items, taxRate) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = items.reduce(
    (sum, item) => sum + item.discount * item.quantity,
    0,
  );
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
};
export const usePOSStore = create()(
  persist(
    (set, get) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      // Initialize currentUser from NextAuth session
      initializeUserFromSession: (session) => {
        if (session?.user) {
          set({ currentUser: session.user });
        }
      },
      // Products loaded from backend
      products: [],
      productsLoading: false,
      loadProducts: async () => {
        set({ productsLoading: true });
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ["products"],
            queryFn: async () => {
              const res = await apiClient.get("/products");
              return res.data?.data || res.data || res;
            },
          });
          const items = (Array.isArray(data) ? data : data.data || data).map(
            (p) => ({
              ...p,
              images: p.images || (p.image ? [p.image] : []),
              inventories: p.inventories || [],
            }),
          );
          set({ products: items, productsLoading: false });
        } catch (e) {
          console.error("Failed to load products", e);
          set({ productsLoading: false });
        }
      },
      // Add a new product
      addProduct: async (productData) => {
        try {
          const response = await apiClient.post("/products", productData);
          const newProduct = response.data ?? response;
          set((state) => ({ products: [...state.products, newProduct] }));
          return newProduct;
        } catch (e) {
          console.error("Failed to add product", e);
          throw e;
        }
      },
      // Update product
      updateProduct: async (id, productData) => {
        try {
          const response = await apiClient.put(`/products/${id}`, productData);
          const updatedProduct = response.data ?? response;
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? updatedProduct : p,
            ),
          }));
          return updatedProduct;
        } catch (e) {
          console.error("Failed to update product", e);
          throw e;
        }
      },
      // Delete product
      deleteProduct: async (id) => {
        try {
          await apiClient.delete(`/products/${id}`);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));
        } catch (e) {
          console.error("Failed to delete product", e);
          throw e;
        }
      },
      // Categories
      categories: [],
      categoriesLoading: false,
      loadCategories: async () => {
        set({ categoriesLoading: true });
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ["categories"],
            queryFn: async () => {
              const res = await apiClient.get("/categories");
              return res.data?.data || res.data || res;
            },
          });
          set({ categories: data.data || data, categoriesLoading: false });
        } catch (e) {
          console.error("Failed to load categories", e);
          set({ categoriesLoading: false });
        }
      },
      // Add category
      addCategory: async (categoryData) => {
        try {
          const response = await apiClient.post("/categories", categoryData);
          const newCategory = response.data ?? response;
          set((state) => ({ categories: [...state.categories, newCategory] }));
          return newCategory;
        } catch (e) {
          console.error("Failed to add category", e);
          throw e;
        }
      },
      // Update category
      updateCategory: async (id, categoryData) => {
        try {
          const response = await apiClient.put(
            `/categories/${id}`,
            categoryData,
          );
          const updatedCategory = response.data ?? response;
          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === id ? updatedCategory : c,
            ),
          }));
          return updatedCategory;
        } catch (e) {
          console.error("Failed to update category", e);
          throw e;
        }
      },
      // Delete category
      deleteCategory: async (id) => {
        try {
          await apiClient.delete(`/categories/${id}`);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
        } catch (e) {
          console.error("Failed to delete category", e);
          throw e;
        }
      },
      // Brands
      brands: [],
      brandsLoading: false,
      loadBrands: async () => {
        set({ brandsLoading: true });
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ["brands"],
            queryFn: async () => {
              const res = await apiClient.get("/brands");
              return res.data?.data || res.data || res;
            },
          });
          set({ brands: data.data || data, brandsLoading: false });
        } catch (e) {
          console.error("Failed to load brands", e);
          set({ brandsLoading: false });
        }
      },
      // Add brand
      addBrand: async (brandData) => {
        try {
          const response = await apiClient.post("/brands", brandData);
          const newBrand = response.data ?? response;
          set((state) => ({ brands: [...state.brands, newBrand] }));
          return newBrand;
        } catch (e) {
          console.error("Failed to add brand", e);
          throw e;
        }
      },
      // Update brand
      updateBrand: async (id, brandData) => {
        try {
          const response = await apiClient.put(`/brands/${id}`, brandData);
          const updatedBrand = response.data ?? response;
          set((state) => ({
            brands: state.brands.map((b) => (b.id === id ? updatedBrand : b)),
          }));
          return updatedBrand;
        } catch (e) {
          console.error("Failed to update brand", e);
          throw e;
        }
      },
      // Delete brand
      deleteBrand: async (id) => {
        try {
          await apiClient.delete(`/brands/${id}`);
          set((state) => ({
            brands: state.brands.filter((b) => b.id !== id),
          }));
        } catch (e) {
          console.error("Failed to delete brand", e);
          throw e;
        }
      },

      carts: [],
      activeCartId: null,

      createCart: () => {
        const newCart = {
          id: generateId(),
          items: [],
          subtotal: 0,
          taxAmount: 0,
          discountAmount: 0,
          total: 0,
          status: "active",
          createdAt: /* @__PURE__ */ new Date(),
        };
        set((state) => ({
          carts: [...state.carts, newCart],
          activeCartId: newCart.id,
        }));
        return newCart.id;
      },
      setActiveCart: (cartId) => set({ activeCartId: cartId }),
      addToCart: (product, variant, quantity = 1) => {
        const { activeCartId, taxRate } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const cart = { ...state.carts[cartIndex] };
          const existingItemIndex = cart.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.variant?.id === variant?.id,
          );
          if (existingItemIndex > -1) {
            const items = [...cart.items];
            const existing = items[existingItemIndex];
            const newQuantity = existing.quantity + quantity;
            const unitPrice = Number(existing.unitPrice ?? 0);
            items[existingItemIndex] = {
              ...existing,
              quantity: newQuantity,
              total: Number(newQuantity) * unitPrice,
            };
            cart.items = items;
          } else {
            // Prefer selling_price from backend, then variant price, then basePrice/base_price
            const unitPriceRaw =
              variant?.price ??
              variant?.selling_price ??
              product.selling_price ??
              product.sellingPrice ??
              product.basePrice ??
              product.base_price ??
              0;
            const unitPrice = Number(unitPriceRaw ?? 0);
            const newItem = {
              id: generateId(),
              product,
              variant,
              quantity,
              unitPrice,
              discount: 0,
              total: Number(quantity) * unitPrice,
            };
            cart.items = [...cart.items, newItem];
          }
          const totals = calculateCartTotals(cart.items, taxRate);
          const updatedCart = { ...cart, ...totals };
          const newCarts = [...state.carts];
          newCarts[cartIndex] = updatedCart;
          return { carts: newCarts };
        });
      },
      updateCartItem: (itemId, quantity) => {
        const { activeCartId, taxRate } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const cart = { ...state.carts[cartIndex] };
          const items = cart.items.map((item) => {
            if (item.id !== itemId) return item;
            const unitPrice = Number(item.unitPrice ?? 0);
            const discount = Number(item.discount ?? 0);
            const total =
              Number(quantity) * unitPrice -
              Number(discount) * Number(quantity);
            return { ...item, quantity, total };
          });
          cart.items = items;
          const totals = calculateCartTotals(items, taxRate);
          const updatedCart = { ...cart, ...totals };
          const newCarts = [...state.carts];
          newCarts[cartIndex] = updatedCart;
          return { carts: newCarts };
        });
      },
      updateCartItemNote: (itemId, note) => {
        const { activeCartId } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const cart = { ...state.carts[cartIndex] };
          cart.items = cart.items.map((item) =>
            item.id === itemId ? { ...item, note } : item,
          );
          const newCarts = [...state.carts];
          newCarts[cartIndex] = cart;
          return { carts: newCarts };
        });
      },
      removeFromCart: (itemId) => {
        const { activeCartId, taxRate } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const cart = { ...state.carts[cartIndex] };
          cart.items = cart.items.filter((item) => item.id !== itemId);
          const totals = calculateCartTotals(cart.items, taxRate);
          const updatedCart = { ...cart, ...totals };
          const newCarts = [...state.carts];
          newCarts[cartIndex] = updatedCart;
          return { carts: newCarts };
        });
      },
      applyDiscount: (itemId, discount) => {
        const { activeCartId, taxRate } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const cart = { ...state.carts[cartIndex] };
          cart.items = cart.items.map((item) => {
            if (item.id !== itemId) return item;
            const quantity = Number(item.quantity ?? 0);
            const unitPrice = Number(item.unitPrice ?? 0);
            const discountNum = Number(discount ?? item.discount ?? 0);
            const total = quantity * unitPrice - discountNum * quantity;
            return { ...item, discount: discountNum, total };
          });
          const totals = calculateCartTotals(cart.items, taxRate);
          const updatedCart = { ...cart, ...totals };
          const newCarts = [...state.carts];
          newCarts[cartIndex] = updatedCart;
          return { carts: newCarts };
        });
      },
      applyCartDiscount: (discount) => {
        const { activeCartId, taxRate } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const cart = { ...state.carts[cartIndex] };
          const totals = calculateCartTotals(cart.items, taxRate);
          const discountNum = Number(discount ?? 0);
          const updatedCart = {
            ...cart,
            ...totals,
            discountAmount: discountNum,
            total: totals.total - discountNum,
          };
          const newCarts = [...state.carts];
          newCarts[cartIndex] = updatedCart;
          return { carts: newCarts };
        });
      },
      holdCart: (note) => {
        const { activeCartId } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const newCarts = [...state.carts];
          newCarts[cartIndex] = {
            ...newCarts[cartIndex],
            status: "held",
            holdNote: note,
          };
          return { carts: newCarts, activeCartId: null };
        });
      },
      resumeCart: (cartId) => {
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === cartId);
          if (cartIndex === -1) return state;
          const newCarts = [...state.carts];
          newCarts[cartIndex] = {
            ...newCarts[cartIndex],
            status: "active",
            holdNote: void 0,
          };
          return { carts: newCarts, activeCartId: cartId };
        });
      },
      clearCart: () => {
        const { activeCartId } = get();
        if (!activeCartId) return;
        set((state) => {
          const cartIndex = state.carts.findIndex((c) => c.id === activeCartId);
          if (cartIndex === -1) return state;
          const newCarts = [...state.carts];
          newCarts[cartIndex] = {
            ...newCarts[cartIndex],
            items: [],
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 0,
          };
          return { carts: newCarts };
        });
      },
      deleteCart: (cartId) => {
        set((state) => ({
          carts: state.carts.filter((c) => c.id !== cartId),
          activeCartId:
            state.activeCartId === cartId ? null : state.activeCartId,
        }));
      },
      getActiveCart: () => {
        const { carts, activeCartId } = get();
        return carts.find((c) => c.id === activeCartId);
      },
      getHeldCarts: () => {
        const { carts } = get();
        return carts.filter((c) => c.status === "held");
      },
      // Sales history
      salesHistory: [],
      salesLoading: false,
      // Load sales history from backend
      loadSales: async () => {
        set({ salesLoading: true });
        try {
          const response = await apiClient.get("/sales");
          const data = response.data ?? response;
          set({ salesHistory: data.data || data, salesLoading: false });
        } catch (e) {
          console.error("Failed to load sales", e);
          set({ salesLoading: false });
          throw e;
        }
      },
      // Create a sale (checkout)
      createSale: async (saleData) => {
        try {
          const response = await apiClient.post("/sales", saleData);
          const newSale = response.data ?? response;
          set((state) => ({ salesHistory: [newSale, ...state.salesHistory] }));
          // After successful sale, clear the active cart
          const { activeCartId } = get();
          if (activeCartId) {
            // remove items from cart and mark as completed
            set((state) => ({
              carts: state.carts.map((c) =>
                c.id === activeCartId ? { ...c, status: "completed" } : c,
              ),
            }));
          }
          return newSale;
        } catch (e) {
          console.error("Failed to create sale", e);
          throw e;
        }
      },
      // Add a sale locally (no API call) — used by UI to record completed sales immediately
      addSale: (saleData) => {
        // Optimistic add: insert a local sale immediately, then persist via createSale
        const optimisticSale = {
          ...saleData,
          id: generateId(),
          optimistic: true,
          createdAt: saleData.createdAt ?? new Date(),
        };
        set((state) => ({
          salesHistory: [optimisticSale, ...state.salesHistory],
        }));
        // Mark active cart as completed if any
        const { activeCartId } = get();
        if (activeCartId) {
          set((state) => ({
            carts: state.carts.map((c) =>
              c.id === activeCartId ? { ...c, status: "completed" } : c,
            ),
          }));
        }

        // Fire-and-forget persistence; reconcile optimistic entry when server responds
        (async () => {
          try {
            const serverSale = await get().createSale(saleData);
            // Replace optimistic sale with server-returned sale (match by optimistic id if available)
            set((state) => ({
              salesHistory: state.salesHistory.map((s) =>
                s.id === optimisticSale.id ? serverSale : s,
              ),
            }));
          } catch (err) {
            // If persistence fails, mark the optimistic sale with an error flag
            console.error("Failed to persist sale:", err);
            set((state) => ({
              salesHistory: state.salesHistory.map((s) =>
                s.id === optimisticSale.id ? { ...s, error: true } : s,
              ),
            }));
          }
        })();

        return optimisticSale;
      },
      // Adjust inventory (e.g., after sale or manual adjustment)
      adjustInventory: async (productId, variantId, quantity) => {
        try {
          await apiClient.post("/inventory/adjust", {
            product_id: productId,
            variant_id: variantId,
            quantity,
          });
          // Optionally refresh products after adjustment
          await get().loadProducts();
        } catch (e) {
          console.error("Failed to adjust inventory", e);
          throw e;
        }
      },
      refundSale: (saleId, reason) => {
        set((state) => ({
          salesHistory: state.salesHistory.map((sale) =>
            sale.id === saleId
              ? {
                  ...sale,
                  status: "refunded",
                  refundedAt: /* @__PURE__ */ new Date(),
                  refundReason: reason,
                }
              : sale,
          ),
        }));
      },
      taxRate: 0.16,
      setTaxRate: (rate) => set({ taxRate: rate }),
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
      customers: [],
      selectedCustomer: null,
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      // Add a new customer via API
      addCustomer: async (customerData) => {
        try {
          const response = await apiClient.post("/customers", customerData);
          const newCustomer = response.data ?? response;
          set((state) => ({ customers: [...state.customers, newCustomer] }));
          return newCustomer;
        } catch (e) {
          console.error("Failed to add customer", e);
          throw e;
        }
      },
      // Load customers from backend
      loadCustomers: async () => {
        set({ customersLoading: true });
        try {
          const response = await apiClient.get("/customers");
          const data = response.data ?? response;
          set({ customers: data, customersLoading: false });
        } catch (e) {
          console.error("Failed to load customers", e);
          set({ customersLoading: false });
        }
      },
      updateCustomerPoints: (customerId, points) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId
              ? { ...c, loyaltyPoints: c.loyaltyPoints + points }
              : c,
          ),
        }));
      },
      notifications: [],
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: generateId(),
          read: false,
          createdAt: /* @__PURE__ */ new Date(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }));
      },
      clearNotifications: () => set({ notifications: [] }),
      quickAmounts: [20, 50, 100, 200],
      setQuickAmounts: (amounts) => set({ quickAmounts: amounts }),
      // Enhanced payment methods
      enabledPaymentMethods: ["cash", "card", "mobile_money"],
      setEnabledPaymentMethods: (methods) =>
        set({ enabledPaymentMethods: methods }),
      // Multi-currency support
      supportedCurrencies: [
        "USD",
        "EUR",
        "GBP",
        "KES",
        "CAD",
        "AUD",
        "JPY",
        "INR",
      ],
      getSupportedCurrencies: () => get().supportedCurrencies,
      // Payment splitting
      splitPayments: [],
      addSplitPayment: (payment) =>
        set((state) => ({
          splitPayments: [
            ...state.splitPayments,
            { ...payment, id: generateId() },
          ],
        })),
      removeSplitPayment: (id) =>
        set((state) => ({
          splitPayments: state.splitPayments.filter((p) => p.id !== id),
        })),
      clearSplitPayments: () => set({ splitPayments: [] }),
      // Cash breakdown for current transaction
      cashBreakdown: {},
      setCashBreakdown: (breakdown) => set({ cashBreakdown: breakdown }),
      clearCashBreakdown: () => set({ cashBreakdown: {} }),
      // QR product search by barcode
      searchProductByQR: async (barcode) => {
        try {
          const response = await apiClient.get(`/products?barcode=${barcode}`);
          const data = response.data ?? response;
          return data;
        } catch (e) {
          console.error("QR search failed", e);
          throw e;
        }
      },
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "pos-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
