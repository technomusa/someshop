import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "./api-client";

export const useShopStore = create()(
    persist(
        (set, get) => ({
            shops: [],
            shopsLoading: false,
            currentShop: null,

            // Load available shops for the current user
            loadShops: async () => {
                set({ shopsLoading: true });
                try {
                    const response = await apiClient.get('/user/shops');
                    const data = response.data ?? response;
                    set({ shops: data, shopsLoading: false });
                    return data;
                } catch (e) {
                    console.error('Failed to load shops', e);
                    set({ shopsLoading: false });
                    // Swallow the error here so callers don't get an unhandled rejection.
                    // The calling components should handle empty `shops` or show login.
                    return null;
                }
            },

            // Switch to a different shop
            switchShop: async (shopId) => {
                try {
                    const response = await apiClient.post('/user/switch-shop', {
                        shop_id: shopId,
                    });
                    const data = response.data ?? response;
                    // Prefer server-provided user.shop if returned
                    const serverShop = data?.user?.shop ?? null;
                    if (serverShop) {
                        set({ currentShop: serverShop });
                    } else {
                        const shop = get().shops.find((s) => s.id === shopId);
                        set({ currentShop: shop });
                    }
                    return data;
                } catch (e) {
                    console.error('Failed to switch shop', e);
                    throw e;
                }
            },

            setCurrentShop: (shop) => set({ currentShop: shop }),
        }),
        {
            name: "shop-storage",
        }
    )
);
