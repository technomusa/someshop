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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Plus, X, Loader2 } from "lucide-react";
import { useInventoryStore } from "@/lib/inventory-store";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

export function StockTransferForm({ open, onOpenChange, onSuccess }) {
  const { transferInventory } = useInventoryStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toShopId, setToShopId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // Fetch products from API
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60,
  });
  
  // Fetch shops for transfer destination
  const { data: shopsData } = useQuery({
    queryKey: ['user', 'shops'],
    queryFn: async () => {
      const res = await apiClient.get('/user/shops');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
  
  const products = productsData || [];
  const shops = shopsData || [];
  const addItem = () => {
    if (!selectedProductId || !quantity) return;
    setItems((prev) => [
      ...prev,
      {
        productId: selectedProductId,
        quantity: Number.parseInt(quantity)
      }
    ]);
    setSelectedProductId("");
    setQuantity("");
  };
  
  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!toShopId || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select destination shop and add at least one product",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Transfer each item
      for (const item of items) {
        await transferInventory(
          item.productId,
          null, // variation_id
          item.quantity,
          toShopId
        );
      }
      
      toast({
        title: "Success",
        description: `Successfully transferred ${items.length} item(s)`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setToShopId("");
      setNotes("");
      setItems([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to transfer inventory:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to transfer inventory",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock Transfer</DialogTitle>
          <DialogDescription>Transfer stock between branches</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Transfer To Shop *</Label>
            <Select value={toShopId} onValueChange={setToShopId}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination shop" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id.toString()}>
                    {shop.name} {shop.location ? `- ${shop.location}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Stock will be transferred from your current shop to the selected shop
            </p>
          </div>

          {
    /* Add Items */
  }
          <div className="space-y-2">
            <Label>Products to Transfer</Label>
            <div className="flex gap-2">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const stock = product.inventories?.[0]?.quantity || 0;
                    return (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} (Stock: {stock})
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
              <Button onClick={addItem} disabled={!selectedProductId || !quantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {
    /* Items List */
  }
          {items.length > 0 && <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const product = products.find((p) => p.id === item.productId);
                    return (
                      <TableRow key={index}>
                        <TableCell>{product?.name || 'Unknown'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>}

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="Add any notes about this transfer..."
    rows={2}
  />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!toShopId || items.length === 0 || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              "Create Transfer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}
