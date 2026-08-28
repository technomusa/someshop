"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload, Barcode, Loader2 } from "lucide-react";
import { useProductStore } from "@/lib/product-store";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

export function ProductForm({ open, onOpenChange, product, mode, onSuccess }) {
  const { addProduct, updateProduct, loadCategories, categories } = useProductStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories");
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
  
  const categoriesList = useMemo(() => {
    const apiCats = categoriesData || categories || [];
    return Array.isArray(apiCats) ? apiCats.map(cat => ({
      value: cat.id?.toString() || cat.slug || cat.name?.toLowerCase(),
      label: cat.name || cat.slug || "Unknown"
    })) : [];
  }, [categoriesData, categories]);
  
  // Fetch brands from API
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await apiClient.get("/brands");
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
  
  const brandsList = useMemo(() => {
    const apiBrands = brandsData || [];
    return Array.isArray(apiBrands) ? apiBrands.map(brand => ({
      value: brand.id?.toString() || brand.slug || brand.name?.toLowerCase(),
      label: brand.name || brand.slug || "Unknown"
    })) : [];
  }, [brandsData]);
  const [activeTab, setActiveTab] = useState("basic");
  // Initialize form data from product
  useEffect(() => {
    if (product) {
      const categoryId = product.category_id || (product.category?.id) || product.category;
      const brandId = product.brand_id || (product.brand?.id) || product.brand;
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: categoryId?.toString() || product.category?.slug || "",
        brand: brandId?.toString() || product.brand?.name || "",
        model: product.model || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        basePrice: (product.selling_price || product.base_price || product.basePrice || 0).toString(),
        costPrice: (product.cost_price || product.costPrice || 0).toString(),
        stock: (product.inventories?.[0]?.quantity || product.stock || 0).toString(),
        reorderLevel: (product.alert_quantity || product.reorderLevel || 10).toString(),
        isActive: product.is_active !== false && product.isActive !== false,
        expiryDate: product.expiry_date || (product.expiryDate ? new Date(product.expiryDate).toISOString().split("T")[0] : ""),
        batchNumber: product.batch_number || product.batchNumber || ""
      });
      setAttributes(product.attributes || {});
      setVariants(product.variations || product.variants || []);
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        category: "",
        brand: "",
        model: "",
        sku: "",
        barcode: "",
        basePrice: "",
        costPrice: "",
        stock: "",
        reorderLevel: "10",
        isActive: true,
        expiryDate: "",
        batchNumber: ""
      });
      setAttributes({});
      setVariants([]);
    }
  }, [product, open]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    model: "",
    sku: "",
    barcode: "",
    basePrice: "",
    costPrice: "",
    stock: "",
    reorderLevel: "10",
    isActive: true,
    expiryDate: "",
    batchNumber: ""
  });
  const [attributes, setAttributes] = useState(product?.attributes || {});
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");
  const [variants, setVariants] = useState(product?.variants || []);
  const [newVariant, setNewVariant] = useState({
    name: "",
    sku: "",
    price: "",
    costPrice: "",
    stock: "",
    barcode: "",
    attributes: {}
  });
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category_id: Number.parseInt(formData.category) || null,
        brand_id: Number.parseInt(formData.brand) || null,
        sku: formData.sku,
        barcode: formData.barcode || null,
        selling_price: Number.parseFloat(formData.basePrice) || 0,
        cost_price: Number.parseFloat(formData.costPrice) || 0,
        alert_quantity: Number.parseInt(formData.reorderLevel) || 10,
        is_active: formData.isActive,
        tax_rate: product?.tax_rate || 0,
        type: product?.type || "standard",
      };
      
      if (mode === "edit" && product) {
        await updateProduct(product.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save product:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const addAttribute = () => {
    if (newAttrKey && newAttrValue) {
      setAttributes((prev) => ({ ...prev, [newAttrKey]: newAttrValue }));
      setNewAttrKey("");
      setNewAttrValue("");
    }
  };
  const removeAttribute = (key) => {
    setAttributes((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };
  const addVariantToList = () => {
    if (newVariant.name && newVariant.sku) {
      const variant = {
        id: Math.random().toString(36).substring(2, 15),
        name: newVariant.name,
        sku: newVariant.sku,
        price: Number.parseFloat(newVariant.price) || 0,
        costPrice: Number.parseFloat(newVariant.costPrice) || 0,
        stock: Number.parseInt(newVariant.stock) || 0,
        barcode: newVariant.barcode || void 0,
        attributes: newVariant.attributes
      };
      setVariants((prev) => [...prev, variant]);
      setNewVariant({
        name: "",
        sku: "",
        price: "",
        costPrice: "",
        stock: "",
        barcode: "",
        attributes: {}
      });
    }
  };
  const removeVariant = (variantId) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{mode === "edit" ? "Edit Product" : "Add New Product"}</SheetTitle>
          <SheetDescription>
            {mode === "edit" ? "Update product information" : "Fill in the product details"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
    id="name"
    value={formData.name}
    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
    placeholder="iPhone 15 Pro Max"
  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
    id="description"
    value={formData.description}
    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
    placeholder="Product description..."
    rows={3}
  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
    value={formData.category}
    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesList.map((cat) => <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Select
                    value={formData.brand}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, brand: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandsList.map((brand) => <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
    id="model"
    value={formData.model}
    onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
    placeholder="15 Pro Max"
  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
    id="sku"
    value={formData.sku}
    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
    placeholder="APL-IP15PM-256"
  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex gap-2">
                  <Input
    id="barcode"
    value={formData.barcode}
    onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
    placeholder="8901234567890"
  />
                  <Button variant="outline" size="icon">
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formData.category === "cold_store" && <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
    id="expiryDate"
    type="date"
    value={formData.expiryDate}
    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
  />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchNumber">Batch Number</Label>
                      <Input
    id="batchNumber"
    value={formData.batchNumber}
    onChange={(e) => setFormData((prev) => ({ ...prev, batchNumber: e.target.value }))}
    placeholder="BATCH-2024-001"
  />
                    </div>
                  </div>
                </>}

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
    id="isActive"
    checked={formData.isActive}
    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
  />
              </div>

              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag and drop images or click to upload</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Selling Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
    id="basePrice"
    type="number"
    step="0.01"
    value={formData.basePrice}
    onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: e.target.value }))}
    className="pl-7"
    placeholder="0.00"
  />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
    id="costPrice"
    type="number"
    step="0.01"
    value={formData.costPrice}
    onChange={(e) => setFormData((prev) => ({ ...prev, costPrice: e.target.value }))}
    className="pl-7"
    placeholder="0.00"
  />
                  </div>
                </div>
              </div>

              {formData.basePrice && formData.costPrice && <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span className="font-medium">
                      ${Number(Number.parseFloat(formData.basePrice) - Number.parseFloat(formData.costPrice)).toFixed(2)} (
                      {Number(((Number.parseFloat(formData.basePrice) - Number.parseFloat(formData.costPrice)) / (Number.parseFloat(formData.basePrice) || 1) * 100) || 0).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock *</Label>
                  <Input
    id="stock"
    type="number"
    value={formData.stock}
    onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
    placeholder="0"
  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder Level *</Label>
                  <Input
    id="reorderLevel"
    type="number"
    value={formData.reorderLevel}
    onChange={(e) => setFormData((prev) => ({ ...prev, reorderLevel: e.target.value }))}
    placeholder="10"
  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attributes" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Product Attributes</Label>
                <p className="text-sm text-muted-foreground">Add custom attributes like color, size, storage, etc.</p>
              </div>

              <div className="flex gap-2">
                <Input
    placeholder="Attribute name (e.g., Color)"
    value={newAttrKey}
    onChange={(e) => setNewAttrKey(e.target.value)}
  />
                <Input
    placeholder="Value (e.g., Blue)"
    value={newAttrValue}
    onChange={(e) => setNewAttrValue(e.target.value)}
  />
                <Button onClick={addAttribute} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(attributes).map(([key, value]) => <Badge key={key} variant="secondary" className="gap-1 pl-3">
                    {key}: {value}
                    <button
    onClick={() => removeAttribute(key)}
    className="ml-1 rounded-full hover:bg-muted-foreground/20"
  >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>)}
              </div>

              {Object.keys(attributes).length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  No attributes added yet
                </div>}
            </TabsContent>

            <TabsContent value="variants" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Product Variants</Label>
                <p className="text-sm text-muted-foreground">
                  Add variants for different sizes, colors, or configurations
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
    placeholder="Variant name"
    value={newVariant.name}
    onChange={(e) => setNewVariant((prev) => ({ ...prev, name: e.target.value }))}
  />
                  <Input
    placeholder="SKU"
    value={newVariant.sku}
    onChange={(e) => setNewVariant((prev) => ({ ...prev, sku: e.target.value }))}
  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
    type="number"
    step="0.01"
    placeholder="Price"
    value={newVariant.price}
    onChange={(e) => setNewVariant((prev) => ({ ...prev, price: e.target.value }))}
  />
                  <Input
    type="number"
    step="0.01"
    placeholder="Cost"
    value={newVariant.costPrice}
    onChange={(e) => setNewVariant((prev) => ({ ...prev, costPrice: e.target.value }))}
  />
                  <Input
    type="number"
    placeholder="Stock"
    value={newVariant.stock}
    onChange={(e) => setNewVariant((prev) => ({ ...prev, stock: e.target.value }))}
  />
                </div>
                <Button onClick={addVariantToList} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              <div className="space-y-2">
                {variants.map((variant) => <div key={variant.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{variant.name}</p>
                      <p className="text-sm text-muted-foreground">
                          SKU: {variant.sku} | Price: ${Number(variant.price ?? 0).toFixed(2)} | Stock: {variant.stock}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeVariant(variant.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>)}
              </div>

              {variants.length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  No variants added yet
                </div>}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "edit" ? "Saving..." : "Creating..."}
              </>
            ) : (
              mode === "edit" ? "Save Changes" : "Create Product"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>;
}
