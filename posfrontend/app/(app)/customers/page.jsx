"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Download, Upload, Users, Star, TrendingUp, Gift, Loader2 } from "lucide-react";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerDetails } from "@/components/customers/customer-details";
import { useCustomerStore } from "@/lib/customer-store";
import apiClient from "@/lib/api-client";

export default function CustomersPage() {
  const { loadCustomers } = useCustomerStore();
  
  // Fetch customers from API using React Query
  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/customers');
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
  
  // Load customers on mount (for backward compatibility with store)
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);
  
  // Use API data if available, otherwise fallback to store
  const customers = useMemo(() => {
    if (customersData && Array.isArray(customersData)) {
      return customersData.map((c) => ({
        ...c,
        loyaltyPoints: c.loyalty_points || c.loyaltyPoints || 0,
        totalPurchases: c.total_purchases || c.totalPurchases || 0,
        createdAt: c.created_at || c.createdAt || new Date(),
      }));
    }
    return [];
  }, [customersData]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    return customers.filter(
      (customer) => 
        customer.name?.toLowerCase().includes(search.toLowerCase()) || 
        customer.email?.toLowerCase().includes(search.toLowerCase()) || 
        customer.phone?.includes(search)
    );
  }, [customers, search]);
  
  const totalLoyaltyPoints = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  }, [customers]);
  
  const totalPurchases = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  }, [customers]);
  
  const platinumMembers = useMemo(() => {
    return customers.filter((c) => (c.loyaltyPoints || 0) >= 5e3).length;
  }, [customers]);
  
  const handleFormClose = (shouldRefetch = false) => {
    if (shouldRefetch) {
      refetch();
      loadCustomers();
    }
  };
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormMode("create");
    setShowForm(true);
  };
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormMode("edit");
    setShowForm(true);
    setShowDetails(false);
  };
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };
  return <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage customer profiles and loyalty program</p>
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
            <Button onClick={handleAddCustomer} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Total Customers</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xl sm:text-2xl font-bold">{customers.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Platinum Members</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="text-xl sm:text-2xl font-bold">{platinumMembers}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Loyalty Points</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-orange-500" />
                <span className="text-xl sm:text-2xl font-bold">{totalLoyaltyPoints.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Total Purchases</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xl sm:text-2xl font-bold">{totalPurchases}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
    placeholder="Search customers..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="pl-9 max-w-sm"
  />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CustomerTable 
              customers={filteredCustomers} 
              onEdit={handleEditCustomer} 
              onView={handleViewCustomer}
              onRefresh={() => {
                refetch();
                loadCustomers();
              }}
            />
          )}
        </div>
      </ScrollArea>

      <CustomerForm 
        open={showForm} 
        onOpenChange={handleFormClose} 
        customer={selectedCustomer} 
        mode={formMode}
        onSuccess={() => handleFormClose(true)}
      />
      <CustomerDetails
    open={showDetails}
    onOpenChange={setShowDetails}
    customer={selectedCustomer}
    onEdit={() => handleEditCustomer(selectedCustomer)}
  />
    </div>;
}
