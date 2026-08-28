"use client";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, ShoppingCart, TrendingUp, Users, Download, Calendar, RefreshCw, Loader2 } from "lucide-react";
import { SalesChart } from "@/components/reports/sales-chart";
import { CategoryChart } from "@/components/reports/category-chart";
import { PaymentChart } from "@/components/reports/payment-chart";
import { TopProducts } from "@/components/reports/top-products";
import { RecentTransactions } from "@/components/reports/recent-transactions";
import { CashierPerformance } from "@/components/reports/cashier-performance";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useSettingsStore } from "@/lib/settings-store";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("today");
  const { settings } = useSettingsStore();
  
  // Calculate date range
  const dateRangeParams = useMemo(() => {
    const today = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        start.setDate(today.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        today.setDate(today.getDate() - 1);
        today.setHours(23, 59, 59, 999);
        break;
      case "week":
        start.setDate(today.getDate() - 7);
        break;
      case "month":
        start.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(today.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        start.setHours(0, 0, 0, 0);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  }, [dateRange]);

  // Fetch reports data from API
  const { data: reportsData, isLoading, error, refetch } = useQuery({
    queryKey: ["reports", dateRangeParams],
    queryFn: async () => {
      const params = new URLSearchParams(dateRangeParams);
      const res = await apiClient.get(`/ui/reports?${params.toString()}`);
      return res.data?.data || res.data || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const stats = useMemo(() => {
    if (!reportsData) return {
      totalRevenue: 0,
      transactions: 0,
      avgOrderValue: 0,
      newCustomers: 0
    };
    
    return {
      totalRevenue: parseFloat(reportsData.total_revenue || reportsData.total_sales || 0),
      transactions: reportsData.total_transactions || reportsData.total_orders || 0,
      avgOrderValue: reportsData.avg_order_value || (reportsData.total_revenue && reportsData.total_transactions ? reportsData.total_revenue / reportsData.total_transactions : 0),
      newCustomers: reportsData.new_customers || 0
    };
  }, [reportsData]);
  return <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Sales performance and business insights</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 sm:w-40">
                <Calendar className="mr-2 h-4 w-4 hidden sm:block" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex bg-transparent"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Failed to load reports data</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardDescription className="text-xs">Total Revenue</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-lg sm:text-2xl font-bold">
                    {settings.currencySymbol}{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {reportsData?.revenue_change && (
                  <p className={`text-xs mt-1 ${reportsData.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportsData.revenue_change >= 0 ? '+' : ''}{reportsData.revenue_change.toFixed(1)}% from previous period
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardDescription className="text-xs">Transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  <span className="text-lg sm:text-2xl font-bold">{stats.transactions}</span>
                </div>
                {reportsData?.transactions_change && (
                  <p className={`text-xs mt-1 ${reportsData.transactions_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportsData.transactions_change >= 0 ? '+' : ''}{reportsData.transactions_change.toFixed(1)}% from previous period
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardDescription className="text-xs">Avg Order Value</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-lg sm:text-2xl font-bold">
                    {settings.currencySymbol}{stats.avgOrderValue.toFixed(0)}
                  </span>
                </div>
                {reportsData?.aov_change && (
                  <p className={`text-xs mt-1 ${reportsData.aov_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportsData.aov_change >= 0 ? '+' : ''}{reportsData.aov_change.toFixed(1)}% from previous period
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardDescription className="text-xs">New Customers</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="text-lg sm:text-2xl font-bold">{stats.newCustomers}</span>
                </div>
                {reportsData?.customers_change && (
                  <p className={`text-xs mt-1 ${reportsData.customers_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportsData.customers_change >= 0 ? '+' : ''}{reportsData.customers_change.toFixed(1)}% from previous period
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <SalesChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <CategoryChart />
            <PaymentChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <TopProducts />
            <RecentTransactions />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <CashierPerformance />
          </div>
        </div>
      </ScrollArea>
    </div>;
}
