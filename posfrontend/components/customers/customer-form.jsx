"use client";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useCustomerStore } from "@/lib/customer-store";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function CustomerForm({ open, onOpenChange, customer, mode, onSuccess }) {
  const { addCustomer, updateCustomer } = useCustomerStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  useEffect(() => {
    if (customer && mode === "edit") {
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        address: customer.address || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: ""
      });
    }
  }, [customer, mode, open]);
  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) return;
    
    setIsSubmitting(true);
    try {
      const customerData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        address: formData.address || null
      };
      
      if (mode === "edit" && customer) {
        await updateCustomer(customer.id, customerData);
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        await addCustomer(customerData);
        toast({
          title: "Success",
          description: "Customer created successfully",
        });
      }
      
      // Invalidate and refetch customers
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save customer:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update customer information" : "Enter customer details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
    id="name"
    value={formData.name}
    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
    placeholder="John Smith"
  />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
    id="phone"
    value={formData.phone}
    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
    placeholder="+1234567890"
  />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
    id="email"
    type="email"
    value={formData.email}
    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
    placeholder="john@example.com"
  />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
    id="address"
    value={formData.address}
    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
    placeholder="123 Main St, City, Country"
    rows={2}
  />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.phone || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "edit" ? "Saving..." : "Creating..."}
              </>
            ) : (
              mode === "edit" ? "Save Changes" : "Add Customer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}
