"use client";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Download, Upload, Filter, Package, AlertTriangle, Snowflake, Loader2 } from "lucide-react";
import { ProductTable } from "@/components/products/product-table";
import { ProductForm } from "@/components/products/product-form";
import { ProductDetails } from "@/components/products/product-details";
import { useProductStore } from "@/lib/product-store";
import apiClient from "@/lib/api-client";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const { products, getLowStockProducts, getExpiringProducts, loadProducts, loadCategories, categories } = useProductStore();
  
  // Load products and categories on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);
  
  // Fetch products from API using React Query
  const { data: productsData, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiClient.get("/products");
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Use API data if available, otherwise fallback to store
  const apiProducts = useMemo(() => {
    if (!productsData || !Array.isArray(productsData)) return products;
    return productsData.map((p) => ({
      ...p,
      images: p.images || (p.image ? [p.image] : []),
      inventories: p.inventories || [],
      stock: p.inventories?.[0]?.quantity || p.stock || 0,
      basePrice: p.selling_price || p.base_price || 0,
      costPrice: p.cost_price || 0,
      category: p.category?.slug || p.category_id || p.category,
      brand: p.brand?.name || p.brand_id || p.brand,
      isActive: p.is_active !== false,
      reorderLevel: p.alert_quantity || 10,
    }));
  }, [productsData, products]);
  
  // Build categories list from API
  const categoriesList = useMemo(() => {
    const apiCats = categoriesData || categories || [];
    const allCat = { value: "all", label: "All Categories" };
    const catList = Array.isArray(apiCats) ? apiCats.map(cat => ({
      value: cat.slug || cat.name?.toLowerCase() || cat.id,
      label: cat.name || cat.slug || "Unknown"
    })) : [];
    return [allCat, ...catList];
  }, [categoriesData, categories]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categoryFromUrl || "all");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formMode, setFormMode] = useState("create");
  
  const lowStockProducts = useMemo(() => getLowStockProducts(), [apiProducts, getLowStockProducts]);
  const expiringProducts = useMemo(() => getExpiringProducts(7), [apiProducts, getExpiringProducts]);
  
  const filteredProducts = useMemo(() => {
    return apiProducts.filter((product) => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(search.toLowerCase()) || 
        product.sku?.toLowerCase().includes(search.toLowerCase()) || 
        (typeof product.brand === 'string' ? product.brand.toLowerCase().includes(search.toLowerCase()) : product.brand?.name?.toLowerCase().includes(search.toLowerCase()));
      const productCategory = product.category?.slug || product.category_id || product.category;
      const matchesCategory = category === "all" || productCategory === category;
      const matchesStatus = status === "all" || (status === "active" && product.isActive) || (status === "inactive" && !product.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [apiProducts, search, category, status]);
  
  const handleFormClose = (shouldRefetch = false) => {
    setShowForm(false);
    if (shouldRefetch) {
      refetch();
      loadProducts();
    }
  };
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormMode("create");
    setShowForm(true);
  };
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormMode("edit");
    setShowForm(true);
    setShowDetails(false);
  };
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };
  return <div className="flex flex-col h-full overflow-hidden">
      {
    /* Header - Made responsive */
  }
      <div className="border-b border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">Manage your product catalog</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleAddProduct} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {
    /* Stats Cards - Responsive grid */
  }
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Total Products</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-xl sm:text-2xl font-bold">{products.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Active</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-xl sm:text-2xl font-bold">{products.filter((p) => p.isActive).length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className={lowStockProducts.length > 0 ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Low Stock</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <AlertTriangle
    className={`h-4 w-4 ${lowStockProducts.length > 0 ? "text-destructive" : "text-muted-foreground"}`}
  />
                <span
    className={`text-xl sm:text-2xl font-bold ${lowStockProducts.length > 0 ? "text-destructive" : ""}`}
  >
                  {lowStockProducts.length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className={expiringProducts.length > 0 ? "border-orange-500/50" : ""}>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Expiring Soon</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <Snowflake
    className={`h-4 w-4 ${expiringProducts.length > 0 ? "text-orange-500" : "text-muted-foreground"}`}
  />
                <span
    className={`text-xl sm:text-2xl font-bold ${expiringProducts.length > 0 ? "text-orange-500" : ""}`}
  >
                  {expiringProducts.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {
    /* Filters - Responsive layout */
  }
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="pl-9"
  />
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((cat) => <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger className="w-28 sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {
    /* Table - Scrollable container */
  }
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProductTable 
              products={filteredProducts} 
              onEdit={handleEditProduct} 
              onView={handleViewProduct}
              onRefresh={() => {
                refetch();
                loadProducts();
              }}
            />
          )}
        </div>
      </ScrollArea>

      <ProductForm 
        open={showForm} 
        onOpenChange={handleFormClose} 
        product={selectedProduct} 
        mode={formMode}
        onSuccess={() => handleFormClose(true)}
      />
      <ProductDetails
    open={showDetails}
    onOpenChange={setShowDetails}
    product={selectedProduct}
    onEdit={() => handleEditProduct(selectedProduct)}
  />
    </div>;
}
