"use client";
import { useEffect, useState } from "react";
import { useShopStore } from "@/lib/shop-store";
import { usePOSStore } from "@/lib/store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Store, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ShopSelector() {
    const { shops, shopsLoading, currentShop, loadShops, switchShop, setCurrentShop } = useShopStore();
    const { currentUser } = usePOSStore();
    const [switching, setSwitching] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadShops().catch((e) => {
                console.error("Failed to load shops", e);
            });
        }
    }, [currentUser, loadShops]);

    // Set initial shop if user has a shop_id
    useEffect(() => {
        if (currentUser?.shop_id && shops.length > 0 && !currentShop) {
            const userShop = shops.find((s) => s.id === currentUser.shop_id);
            if (userShop) {
                setCurrentShop(userShop);
            }
        }
    }, [currentUser, shops, currentShop, setCurrentShop]);

    const handleShopChange = async (shopId) => {
        setSwitching(true);
        try {
            await switchShop(parseInt(shopId));
            toast.success("Shop switched successfully");
            // Optionally reload data for new shop context
            window.location.reload();
        } catch (error) {
            console.error("Failed to switch shop", error);
            toast.error("Failed to switch shop");
        } finally {
            setSwitching(false);
        }
    };

    if (shopsLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading shops...</span>
            </div>
        );
    }

    if (!shops || shops.length === 0) {
        return null;
    }

    // If only one shop, just display it
    if (shops.length === 1) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{shops[0].name}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <Select
                value={currentShop?.id?.toString()}
                onValueChange={handleShopChange}
                disabled={switching}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select shop..." />
                </SelectTrigger>
                <SelectContent>
                    {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id.toString()}>
                            {shop.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
