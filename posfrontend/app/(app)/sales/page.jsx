"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import apiClient from "@/lib/api-client";
import {
  Search,
  Download,
  Filter,
  Receipt,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

const methodIcons = {
  cash: <Banknote className="h-4 w-4 text-green-500" />,
  card: <CreditCard className="h-4 w-4 text-blue-500" />,
  mobile_money: <Smartphone className="h-4 w-4 text-orange-500" />
};
export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch sales from API
  const { data: salesResponse, isLoading, error } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const res = await apiClient.get("/sales");
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const salesData = useMemo(() => {
    if (!salesResponse || !Array.isArray(salesResponse)) return [];
    return salesResponse.map((sale) => ({
      id: sale.id,
      receipt: sale.invoice_number || sale.receipt_number || `SALE-${sale.id}`,
      date: sale.created_at ? new Date(sale.created_at) : new Date(),
      customer: sale.customer?.name || "Walk-in",
      items: sale.items?.length || sale.sale_items?.length || 0,
      subtotal: parseFloat(sale.subtotal || 0),
      tax: parseFloat(sale.tax_amount || 0),
      total: parseFloat(sale.total_amount || sale.total || 0),
      method: sale.payment_method || sale.payments?.[0]?.method || "cash",
      status: sale.status || "completed",
      cashier: sale.user?.name || sale.cashier?.name || "Unknown"
    }));
  }, [salesResponse]);

  const filteredSales = useMemo(() => {
    return salesData.filter((sale) => {
      const matchesSearch = sale.receipt.toLowerCase().includes(search.toLowerCase()) || 
                           sale.customer.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [salesData, search, statusFilter]);

  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sale.status === "completed" ? sum + sale.total : sum, 0);
  }, [filteredSales]);

  const totalTransactions = useMemo(() => {
    return filteredSales.filter((s) => s.status === "completed").length;
  }, [filteredSales]);
  return <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Sales History</h1>
            <p className="text-sm text-muted-foreground">View and manage all transactions</p>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Total Revenue</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <DollarSign className="h-4 w-4 text-green-500 hidden sm:block" />
                <span className="text-lg sm:text-2xl font-bold">${totalRevenue.toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <Receipt className="h-4 w-4 text-blue-500 hidden sm:block" />
                <span className="text-lg sm:text-2xl font-bold">{totalTransactions}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardDescription className="text-xs">Avg Order</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-500 hidden sm:block" />
                <span className="text-lg sm:text-2xl font-bold">
                  ${totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(0) : "0"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
    placeholder="Search receipt or customer..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="pl-9"
  />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Failed to load sales data</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Receipt</TableHead>
                    <TableHead className="min-w-[140px] hidden sm:table-cell">Date & Time</TableHead>
                    <TableHead className="min-w-[100px]">Customer</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Items</TableHead>
                    <TableHead className="text-right min-w-[80px]">Total</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Cashier</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No sales found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => <TableRow key={sale.id}>
                    <TableCell className="font-mono font-medium text-xs sm:text-sm">{sale.receipt}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {format(sale.date, "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{sale.customer}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{sale.items}</TableCell>
                    <TableCell className="text-right font-bold text-xs sm:text-sm">${sale.total.toFixed(2)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {methodIcons[sale.method]}
                        <span className="capitalize text-xs">{sale.method.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.status === "completed" ? "default" : "destructive"} className="text-[10px]">
                        {sale.status === "completed" ? "Done" : "Refund"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden xl:table-cell">{sale.cashier}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>)
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>;
}
