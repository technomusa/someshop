"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Barcode,
  Grid3X3,
  List,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Shirt,
  Snowflake,
  Package,
  AlertTriangle,
  Plus,
  Minus,
  StickyNote
} from "lucide-react";
import { usePOSStore } from "@/lib/store";
// Duplicate import removed
import { useToast } from "@/hooks/use-toast";
const categoryIcons = {
  phones: <Smartphone className="h-4 w-4" />,
  laptops: <Laptop className="h-4 w-4" />,
  smartwatches: <Watch className="h-4 w-4" />,
  accessories: <Headphones className="h-4 w-4" />,
  clothing: <Shirt className="h-4 w-4" />,
  cold_store: <Snowflake className="h-4 w-4" />
};
const categoryLabels = {
  phones: "Phones",
  laptops: "Laptops",
  smartwatches: "Watches",
  accessories: "Accessories",
  clothing: "Clothing",
  cold_store: "Cold Store"
};
export function ProductGrid() {
  const { addToCart, createCart, activeCartId, carts } = usePOSStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [itemNote, setItemNote] = useState("");
  // Destructure store helpers before using it
  const { products: storeProducts, /*loadProducts,*/ productsLoading: storeLoading } = usePOSStore();

  // Use React Query to fetch products and normalize shape
  const { data: productsData, isLoading: queryLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/products');
        return res.data?.data || res.data || res;
      } catch (err) {
        // If unauthorized or another error occurs, return empty list so UI stays stable.
        // Redirects or token clearing are handled by `apiClient` interceptor.
        console.debug('Products request failed:', err?.response?.status || err.message);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
  });

  const products = useMemo(() => {
    const src = productsData || storeProducts || [];
    return (Array.isArray(src) ? src : []).map((p) => ({
      ...p,
      images: p.images || (p.image ? [p.image] : []),
      inventories: p.inventories || [],
      // Ensure numeric prices to avoid .toFixed errors
      selling_price: Number(p.selling_price ?? p.sellingPrice ?? p.base_price ?? p.basePrice ?? 0),
      cost_price: Number(p.cost_price ?? p.costPrice ?? 0),
    }));
  }, [productsData, storeProducts]);

  const productsLoading = queryLoading || storeLoading;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F1" || e.ctrlKey && e.key === "k") {
        e.preventDefault();
        document.getElementById("product-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const ensureCart = useCallback(() => {
    if (!activeCartId || !carts.find((c) => c.id === activeCartId)) {
      createCart();
    }
  }, [activeCartId, carts, createCart]);
  // (moved above)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.includes(search);
      const matchesCategory = category === "all" ||
        product.category?.slug === category ||
        product.category?.name?.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory && (product.is_active !== false);
    });
  }, [products, search, category]);
  const handleAddToCart = (product, variant) => {
    ensureCart();
    for (let i = 0; i < quantity; i++) {
      addToCart(product, variant);
    }
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setItemNote("");
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name}${variant ? ` - ${variant.name}` : ""} added`
    });
  };
  const handleProductClick = (product) => {
    if (product.variations && product.variations.length > 0) {
      setSelectedProduct(product);
      setQuantity(1);
    } else {
      handleAddToCart(product);
    }
  };

  const getProductStock = (product) => {
    // Sum up inventory quantities if available
    if (product.inventories && product.inventories.length > 0) {
      return product.inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    }
    return product.stock || 0;
  };

  const isLowStock = (product) => {
    const stock = getProductStock(product);
    return stock <= (product.alert_quantity || product.reorderLevel || 10);
  };

  const isExpiringSoon = (product) => {
    if (!product.expiryDate && !product.expiry_date) return false;
    const expiryDate = product.expiryDate || product.expiry_date;
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };
  return <div className="flex h-full flex-col overflow-hidden">
    {
      /* Search and Filters - Improved mobile layout */
    }
    <div className="border-b border-border p-3 sm:p-4 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="product-search"
            placeholder="Search or scan (F1)..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="flex-shrink-0 h-10 w-10 bg-transparent">
          <Barcode className="h-4 w-4" />
        </Button>
        <div className="hidden sm:flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full" orientation="horizontal">
        <Tabs value={category} onValueChange={(v) => setCategory(v)}>
          <TabsList className="inline-flex h-9 w-max">
            <TabsTrigger value="all" className="gap-1 px-3 text-xs sm:text-sm">
              <Package className="h-3.5 w-3.5" />
              <span>All</span>
            </TabsTrigger>
            {Object.keys(categoryLabels).map((cat) => <TabsTrigger key={cat} value={cat} className="gap-1 px-3 text-xs sm:text-sm">
              {categoryIcons[cat]}
              <span className="hidden xs:inline">{categoryLabels[cat]}</span>
            </TabsTrigger>)}
          </TabsList>
        </Tabs>
      </ScrollArea>
    </div>

    {
      /* Products - Improved scrolling */
    }
    <ScrollArea className="flex-1">
      <div className="p-3 sm:p-4">
        {viewMode === "grid" ? <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredProducts.map((product) => <Card
            key={product.id}
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 active:scale-[0.98]"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-2 sm:p-3">
              <div className="relative mb-2">
                <img
                  src={product.images[0] || "/placeholder.svg?height=120&width=120&query=product"}
                  alt={product.name}
                  className="aspect-square w-full rounded-md object-cover bg-muted"
                />
                {isLowStock(product) && <Badge variant="destructive" className="absolute right-1 top-1 text-[10px] px-1.5">
                  Low
                </Badge>}
                {isExpiringSoon(product) && <Badge className="absolute left-1 top-1 bg-orange-500 text-[10px] px-1.5">
                  <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                  Exp
                </Badge>}
                <Button
                  size="icon"
                  className="absolute bottom-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-xs sm:text-sm line-clamp-2 leading-tight">{product.name}</p>
                <div className="flex items-center gap-1">
                  {categoryIcons[product.category?.slug || product.category]}
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{product.brand?.name || product.brand}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm sm:text-base text-primary">
                    ${Number(product.selling_price ?? product.basePrice ?? 0).toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    {getProductStock(product)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>)}
        </div> : <div className="space-y-2">
          {filteredProducts.map((product) => <div
            key={product.id}
            className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors active:bg-accent"
            onClick={() => handleProductClick(product)}
          >
            <img
              src={product.images[0] || "/placeholder.svg?height=60&width=60&query=product"}
              alt={product.name}
              className="h-14 w-14 rounded-md object-cover flex-shrink-0 bg-muted"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{product.name}</p>
                {isLowStock(product) && <Badge variant="destructive" className="text-[10px] hidden sm:inline-flex">
                  Low
                </Badge>}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{product.sku}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{product.brand?.name || product.brand}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm text-primary">${Number(product.selling_price ?? product.basePrice ?? 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Stock: {getProductStock(product)}</p>
            </div>
            <Button
              size="sm"
              className="hidden sm:flex h-9"
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(product);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>)}
        </div>}

        {productsLoading && <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-2 sm:p-3">
                <div className="aspect-square w-full rounded-md bg-muted mb-2" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>}

        {filteredProducts.length === 0 && !productsLoading && <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="mb-4 h-16 w-16 opacity-20" />
          <p className="font-medium text-lg">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>}
      </div>
    </ScrollArea>

    <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Options</DialogTitle>
        </DialogHeader>
        {selectedProduct && <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 pb-4 border-b">
            <img
              src={selectedProduct.images[0] || "/placeholder.svg?height=80&width=80&query=product"}
              alt={selectedProduct.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover bg-muted"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedProduct.name}</p>
              <p className="text-sm text-muted-foreground">{selectedProduct.brand?.name || selectedProduct.brand}</p>
              <p className="text-lg font-bold text-primary mt-1">
                ${Number(selectedVariant?.selling_price ?? selectedVariant?.price ?? selectedProduct.selling_price ?? selectedProduct.basePrice ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {
            /* Variants */
          }
          <ScrollArea className="flex-1 py-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Variants</Label>
              <div className="space-y-2">
                <Button
                  variant={!selectedVariant ? "default" : "outline"}
                  className="w-full justify-between h-auto py-3"
                  onClick={() => setSelectedVariant(null)}
                >
                  <span className="text-left text-sm">
                    Standard
                    {selectedProduct.description && <span className="text-xs text-muted-foreground ml-2">
                      {selectedProduct.description}
                    </span>}
                  </span>
                  <span className="font-bold">${Number(selectedProduct.selling_price ?? selectedProduct.basePrice ?? 0).toFixed(2)}</span>
                </Button>
                {selectedProduct.variations?.map((variant) => <Button
                  key={variant.id}
                  variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                  className="w-full justify-between h-auto py-3"
                  onClick={() => setSelectedVariant(variant)}
                >
                  <span className="text-left text-sm">
                    {variant.name}
                    <span className="text-xs text-muted-foreground ml-2">
                      SKU: {variant.sku || 'N/A'}
                    </span>
                  </span>
                  <span className="font-bold">${Number(variant.selling_price ?? variant.price ?? 0).toFixed(2)}</span>
                </Button>)}
              </div>
            </div>
          </ScrollArea>

          {
            /* Quantity and Note */
          }
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label>Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-16 text-center h-9"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <StickyNote className="h-3.5 w-3.5" />
                Note (optional)
              </Label>
              <Textarea
                placeholder="Special instructions..."
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="h-16 resize-none"
              />
            </div>
          </div>
        </div>}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setSelectedProduct(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleAddToCart(selectedProduct, selectedVariant || void 0)}
            className="flex-1 sm:flex-none"
          >
            Add {quantity > 1 ? `(${quantity})` : ""} - $
            {(Number(selectedVariant?.selling_price ?? selectedVariant?.price ?? selectedProduct?.selling_price ?? selectedProduct?.basePrice ?? 0) * quantity).toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
