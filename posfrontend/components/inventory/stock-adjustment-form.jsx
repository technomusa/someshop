"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useInventoryStore } from "@/lib/inventory-store";
import { useProductStore } from "@/lib/product-store";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const adjustmentTypes = [
  { value: "add", label: "Add Stock", description: "Increase inventory quantity" },
  { value: "subtract", label: "Remove Stock", description: "Decrease inventory quantity" },
  { value: "set", label: "Set Quantity", description: "Set exact inventory quantity" },
];

const adjustmentReasons = [
  { value: "damaged", label: "Damaged" },
  { value: "lost", label: "Lost" },
  { value: "expired", label: "Expired" },
  { value: "returned", label: "Returned" },
  { value: "correction", label: "Correction" },
  { value: "other", label: "Other" },
];

export function StockAdjustmentForm({ open, onOpenChange, productId, onSuccess }) {
  const { adjustInventory } = useInventoryStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(productId || "");
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  
  // Fetch products from API
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60,
  });
  
  // Fetch inventory to get current stock
  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60,
  });
  
  const products = productsData || [];
  const inventory = inventoryData || [];
  
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedInventory = inventory.find((inv) => inv.product_id === selectedProductId);
  const currentStock = selectedInventory?.quantity || selectedProduct?.inventories?.[0]?.quantity || 0;
  
  useEffect(() => {
    if (productId) {
      setSelectedProductId(productId);
    }
  }, [productId, open]);
  
  const handleSubmit = async () => {
    if (!selectedProductId || !quantity || !reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const adjustmentQty = Number.parseInt(quantity);
      const finalReason = reason === 'other' ? customReason : reason;
      
      if (!finalReason) {
        toast({
          title: "Validation Error",
          description: "Please provide a reason for the adjustment",
          variant: "destructive",
        });
        return;
      }
      
      await adjustInventory(
        selectedProductId,
        null, // variation_id
        adjustmentQty,
        adjustmentType, // 'add', 'subtract', or 'set'
        finalReason
      );
      
      toast({
        title: "Success",
        description: "Stock adjustment recorded successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setSelectedProductId("");
      setQuantity("");
      setReason("");
      setCustomReason("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to adjust inventory:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to adjust inventory",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
          <DialogDescription>Record a stock adjustment for inventory tracking</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => {
                  const inv = inventory.find((inv) => inv.product_id === product.id);
                  const stock = inv?.quantity || product.inventories?.[0]?.quantity || 0;
                  return (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (Stock: {stock})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {adjustmentTypes.map((type) => <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Current stock: {currentStock} units
                {adjustmentType === 'set' && (
                  <span className="ml-2 text-xs">(Will be set to {quantity || 0})</span>
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {adjustmentReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reason === 'other' && (
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason..."
                rows={2}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedProductId || !quantity || !reason || (reason === 'other' && !customReason) || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Record Adjustment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}
