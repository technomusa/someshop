"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupplierStore } from "@/lib/supplier-store";
import { Plus, MoreHorizontal, Pencil, Trash2, Truck, Phone, Mail, MapPin, Search, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";

export default function SuppliersPage() {
  const { loadSuppliers } = useSupplierStore();
  const { toast } = useToast();
  
  // Fetch suppliers from API using React Query
  const { data: suppliersData, isLoading, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await apiClient.get('/suppliers');
      // Handle paginated response: { data: [...], current_page: 1, ... }
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data; // Paginated response
      }
      // Direct array response
      if (Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Load suppliers on mount (for backward compatibility with store)
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);
  
  // Use API data if available
  const suppliers = useMemo(() => {
    if (suppliersData && Array.isArray(suppliersData)) {
      return suppliersData.map((s) => ({
        ...s,
        contactPerson: s.contact_person || s.contactPerson || '',
        isActive: s.is_active !== false && s.isActive !== false,
      }));
    }
    return [];
  }, [suppliersData]);
  const { addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: ""
  });
  
  const resetForm = () => {
    setFormData({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: ""
    });
    setEditingSupplier(null);
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const supplierData = {
        name: formData.name,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
      };
      
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
      } else {
        await addSupplier(supplierData);
        toast({
          title: "Success",
          description: "Supplier created successfully",
        });
      }
      
      // Refetch suppliers
      await refetch();
      await loadSuppliers();
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save supplier",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (supplierId) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    
    setIsDeleting(supplierId);
    try {
      await deleteSupplier(supplierId);
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      await refetch();
      await loadSuppliers();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete supplier",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      contact_person: supplier.contact_person || supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || ""
    });
    setIsOpen(true);
  };
  
  const filteredSuppliers = useMemo(() => {
    if (!Array.isArray(suppliers)) return [];
    return suppliers.filter(
      (s) => 
        (s.name ?? "").toLowerCase().includes(search.toLowerCase()) || 
        (s.contact_person || s.contactPerson || "").toLowerCase().includes(search.toLowerCase()) || 
        (s.email ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);
  
  const activeSuppliers = useMemo(() => {
    return suppliers.filter((s) => s.isActive).length;
  }, [suppliers]);
  return <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your product suppliers and vendors</p>
        </div>
        <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}
  >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Update supplier information" : "Add a new supplier to your system"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
    id="name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="Enter company name"
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
    id="contact_person"
    value={formData.contact_person}
    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
    placeholder="Enter contact person name"
  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
    id="email"
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    placeholder="email@company.com"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
    id="phone"
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    placeholder="+1 234 567 8900"
  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
    id="address"
    value={formData.address}
    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
    placeholder="Enter full address"
  />
              </div>
            </div>
            <DialogFooter>
              <Button
    variant="outline"
    onClick={() => {
      setIsOpen(false);
      resetForm();
    }}
  >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingSupplier ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  editingSupplier ? "Save Changes" : "Add Supplier"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {
    /* Search */
  }
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
    placeholder="Search suppliers..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="pl-9"
  />
      </div>

      {
    /* Stats */
  }
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Badge variant="default">{activeSuppliers}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Badge variant="secondary">0</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {
    /* Suppliers Table */
  }
      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
          <CardDescription>A list of all your suppliers and their contact information</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No suppliers found
                    </TableCell>
                  </TableRow> : filteredSuppliers.map((supplier) => <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {supplier.address}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.contact_person || supplier.contactPerson || '-'}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {supplier.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? "default" : "secondary"}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => handleDelete(supplier.id)}
                            disabled={isDeleting === supplier.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting === supplier.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>;
}
