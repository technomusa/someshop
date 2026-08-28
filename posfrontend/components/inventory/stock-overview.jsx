"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, AlertTriangle, TrendingUp, Snowflake, Clock, Loader2 } from "lucide-react";
import { useProductStore } from "@/lib/product-store";
import apiClient from "@/lib/api-client";
const categoryLabels = {
  phones: "Phones",
  laptops: "Laptops",
  smartwatches: "Watches",
  accessories: "Accessories",
  clothing: "Clothing",
  cold_store: "Cold Store"
};
export function StockOverview() {
  // Fetch inventory from API
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch products for additional data
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60,
  });
  
  const isLoading = inventoryLoading || productsLoading;
  
  // Combine inventory with product data
  const inventory = useMemo(() => {
    if (!inventoryData || !Array.isArray(inventoryData)) return [];
    return inventoryData.map((inv) => {
      const product = inv.product || productsData?.find((p) => p.id === inv.product_id);
      return {
        ...inv,
        product: product,
        productName: product?.name || 'Unknown',
        productSku: product?.sku || '',
        productCategory: product?.category?.slug || product?.category_id || 'unknown',
        productCostPrice: product?.cost_price || product?.costPrice || 0,
        productSellingPrice: product?.selling_price || product?.base_price || product?.basePrice || 0,
        productReorderLevel: product?.alert_quantity || product?.reorderLevel || 10,
        productImages: product?.images || [],
        quantity: inv.quantity || 0,
      };
    });
  }, [inventoryData, productsData]);
  
  const lowStockProducts = useMemo(() => {
    return inventory.filter((inv) => {
      const qty = inv.quantity || 0;
      const reorderLevel = inv.productReorderLevel || 10;
      return qty <= reorderLevel;
    });
  }, [inventory]);
  
  const expiringProducts = useMemo(() => {
    // Filter products with expiry dates within 7 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return inventory.filter((inv) => {
      const expiry = inv.product?.expiry_date || inv.product?.expiryDate;
      return expiry && new Date(expiry) <= futureDate;
    });
  }, [inventory]);
  
  if (isLoading) {
    return <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="h-12 w-12 mb-2 animate-spin opacity-20" />
      <p className="text-sm">Loading inventory...</p>
    </div>;
  }

  if (!inventory || inventory.length === 0) {
    return <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Package className="h-12 w-12 mb-2 opacity-20" />
      <p className="text-sm">No products in inventory</p>
    </div>;
  }
  const categoryStats = useMemo(() => {
    return Object.keys(categoryLabels).map((cat) => {
      const categoryItems = inventory.filter((inv) => inv.productCategory === cat);
      const totalStock = categoryItems.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
      const totalValue = categoryItems.reduce((sum, inv) => sum + (inv.quantity || 0) * (inv.productCostPrice || 0), 0);
      const lowStockCount = categoryItems.filter((inv) => (inv.quantity || 0) <= (inv.productReorderLevel || 10)).length;
      return {
        category: cat,
        productCount: categoryItems.length,
        totalStock,
        totalValue,
        lowStockCount
      };
    });
  }, [inventory]);
  
  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((sum, inv) => sum + (inv.quantity || 0) * (inv.productCostPrice || 0), 0);
  }, [inventory]);
  
  const totalRetailValue = useMemo(() => {
    return inventory.reduce((sum, inv) => sum + (inv.quantity || 0) * (inv.productSellingPrice || 0), 0);
  }, [inventory]);
  return <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardDescription className="text-xs">Inventory Value</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-lg sm:text-2xl font-bold">${totalInventoryValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Cost value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardDescription className="text-xs">Retail Value</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-lg sm:text-2xl font-bold">${totalRetailValue.toLocaleString()}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +${(totalRetailValue - totalInventoryValue).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className={lowStockProducts.length > 0 ? "border-destructive/50" : ""}>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardDescription className="text-xs">Low Stock</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className={`text-lg sm:text-2xl font-bold ${lowStockProducts.length > 0 ? "text-destructive" : ""}`}>
              {lowStockProducts.length}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Need reorder
            </p>
          </CardContent>
        </Card>
        <Card className={expiringProducts.length > 0 ? "border-orange-500/50" : ""}>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardDescription className="text-xs">Expiring Soon</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className={`text-lg sm:text-2xl font-bold ${expiringProducts.length > 0 ? "text-orange-500" : ""}`}>
              {expiringProducts.length}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Snowflake className="h-3 w-3" />
              Within 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Stock by Category</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Inventory distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {categoryStats.map((stat) => {
    const percentage = totalInventoryValue > 0 ? stat.totalValue / totalInventoryValue * 100 : 0;
    return <div key={stat.category} className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{categoryLabels[stat.category]}</span>
                        {stat.lowStockCount > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">
                            {stat.lowStockCount} low
                          </Badge>}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {stat.productCount} · ${stat.totalValue.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>;
  })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              Low Stock Items
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Below reorder level</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ScrollArea className="h-[240px] sm:h-[280px]">
              {lowStockProducts.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 mb-2 opacity-20" />
                  <p className="text-sm">All products well stocked</p>
                </div> : <div className="space-y-2 sm:space-y-3">
                  {lowStockProducts.map((inv) => <div key={inv.id} className="flex items-center gap-3 rounded-lg border p-2.5 sm:p-3">
                      <img
    src={inv.productImages[0] || "/placeholder.svg?height=40&width=40&query=product"}
    alt={inv.productName}
    className="h-9 w-9 sm:h-10 sm:w-10 rounded-md object-cover flex-shrink-0"
  />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{inv.productName}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{inv.productSku}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-destructive text-sm">{inv.quantity}</p>
                        <p className="text-[10px] text-muted-foreground">/ {inv.productReorderLevel}</p>
                      </div>
                    </div>)}
                </div>}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {expiringProducts.length > 0 && <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              Expiring Products
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Cold store items expiring within 7 days</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {expiringProducts.map((inv) => {
    const expiryDate = inv.product?.expiry_date || inv.product?.expiryDate;
    if (!expiryDate) return null;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1e3 * 60 * 60 * 24)
    );
    return <div key={inv.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <img
      src={inv.productImages[0] || "/placeholder.svg?height=40&width=40&query=product"}
      alt={inv.productName}
      className="h-9 w-9 rounded-md object-cover flex-shrink-0"
    />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-xs sm:text-sm">{inv.productName}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Stock: {inv.quantity}</p>
                      </div>
                    </div>
                    <Badge
      variant={daysUntilExpiry <= 3 ? "destructive" : "outline"}
      className="w-full justify-center text-xs"
    >
                      {daysUntilExpiry <= 0 ? "Expired!" : `${daysUntilExpiry} day${daysUntilExpiry > 1 ? "s" : ""} left`}
                    </Badge>
                  </div>;
  }).filter(Boolean)}
            </div>
          </CardContent>
        </Card>}
    </div>;
}
