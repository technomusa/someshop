"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, X, Calendar, Loader2 } from "lucide-react";
import { useInventoryStore } from "@/lib/inventory-store";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

export function PurchaseOrderForm({ open, onOpenChange, onSuccess }) {
  const { receiveInventory } = useInventoryStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch suppliers from API
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
  
  // Fetch products from API
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60,
  });
  
  const suppliers = suppliersData || [];
  const products = productsData || [];
  const [supplierId, setSupplierId] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [costPrice, setCostPrice] = useState("");
  
  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  
  const addItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product || !quantity) return;
    setItems((prev) => [
      ...prev,
      {
        productId: selectedProductId,
        quantity: Number.parseInt(quantity),
        unitCost: Number.parseFloat(costPrice) || product.cost_price || product.costPrice || 0,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
      }
    ]);
    setSelectedProductId("");
    setQuantity("");
    setBatchNumber("");
    setExpiryDate("");
    setCostPrice("");
  };
  
  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };
  
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  
  const handleSubmit = async () => {
    if (!supplierId || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier and add at least one product",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Receive each item as inventory
      for (const item of items) {
        await receiveInventory(
          item.productId,
          null, // variation_id
          item.quantity,
          supplierId,
          item.batchNumber,
          item.expiryDate,
          item.unitCost
        );
      }
      
      toast({
        title: "Success",
        description: `Successfully received ${items.length} item(s)`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setSupplierId("");
      setExpectedDelivery("");
      setItems([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to receive inventory:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to receive inventory",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create Purchase Order</SheetTitle>
          <SheetDescription>Order products from your suppliers</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          <div className="space-y-6">
            {
    /* Supplier Selection */
  }
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter((s) => s.is_active !== false && s.isActive !== false).map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
    type="date"
    className="pl-9"
    value={expectedDelivery}
    onChange={(e) => setExpectedDelivery(e.target.value)}
  />
              </div>
            </div>

            {
    /* Add Items */
  }
            {supplierId && <div className="space-y-3">
                <Label>Add Products</Label>
                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => {
                        const cost = product.cost_price || product.costPrice || 0;
                        return (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} (${cost.toFixed(2)})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Qty"
                    className="w-24"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Cost"
                    className="w-24"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                  <Button onClick={addItem} disabled={!selectedProductId || !quantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedProductId && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="text"
                      placeholder="Batch Number (optional)"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Expiry Date (optional)"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                )}
              </div>}

            {
    /* Order Items Table */
  }
            {items.length > 0 && <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product?.name || 'Unknown'}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${Number(item.unitCost ?? 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right">${Number((Number(item.quantity ?? 0) * Number(item.unitCost ?? 0))).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">${Number(totalAmount ?? 0).toFixed(2)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!supplierId || items.length === 0 || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Receiving...
              </>
            ) : (
              "Receive Stock"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>;
}
