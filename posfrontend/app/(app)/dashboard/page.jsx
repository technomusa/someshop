"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useProductStore } from "@/lib/product-store";
import { useSession } from "next-auth/react";
import { getUserRoleLevel, isAuditor, isEmployee } from "@/lib/access-control";
import { RoleGuard } from "@/components/access-control/role-guard";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  BarChart3,
  Store,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { currentUser, carts, salesHistory, loadSales } = usePOSStore();
  const { settings, users } = useSettingsStore();
  const { products, loadProducts } = useProductStore();
  
  // Role-based content filtering
  const canViewInventory = !isAuditor(user) && !isEmployee(user);
  const canManageProducts = !isAuditor(user) && !isEmployee(user);
  
  // Fetch dashboard data from API
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/ui/dashboard");
        return res.data?.data || res.data || {};
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        return {};
      }
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Load sales and products on mount
  useEffect(() => {
    loadSales();
    loadProducts();
  }, [loadSales, loadProducts]);
  
  // Calculate stats from API data or fallback to store data
  const todaySales = salesHistory.filter((s) => {
    const saleDate = s.completed_at ? new Date(s.completed_at) : (s.created_at ? new Date(s.created_at) : new Date());
    const today = new Date();
    return saleDate.toDateString() === today.toDateString() && (s.status === "completed" || s.status === "COMPLETED");
  });
  
  const dailyStats = {
    sales: dashboardData?.today_sales || todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount || s.total || 0), 0),
    transactions: dashboardData?.today_transactions || todaySales.length,
    customers: dashboardData?.today_customers || new Set(todaySales.filter((s) => s.customer_id).map((s) => s.customer_id)).size,
    avgTicket: dashboardData?.avg_ticket || (todaySales.length > 0 ? todaySales.reduce((sum, s) => sum + parseFloat(s.total_amount || s.total || 0), 0) / todaySales.length : 0)
  };
  
  const lowStockProducts = products.filter((p) => {
    const stock = p.inventories?.[0]?.quantity || p.stock || 0;
    return stock <= settings.lowStockThreshold;
  });
  const activeProducts = products.filter((p) => p.is_active !== false).length;
  const heldCarts = carts.filter((c) => c.status === "held").length;
  
  const hourlyTarget = 500;
  const currentHourSales = dailyStats.sales / 8;
  const hourlyProgress = Math.min(currentHourSales / hourlyTarget * 100, 100);
  
  // Get recent transactions from API or store
  const recentTransactions = (dashboardData?.recent_sales || salesHistory.slice(0, 5)).map((sale) => ({
    id: sale.id,
    receiptNumber: sale.invoice_number || sale.receipt_number || `SALE-${sale.id}`,
    created_at: sale.created_at,
    completedAt: sale.completed_at || sale.created_at,
    status: sale.status,
    total_amount: sale.total_amount || sale.total,
    items: sale.items || sale.sale_items || []
  }));
  
  return <ScrollArea className="flex-1">
      <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
        {
    /* Header */
  }
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {currentUser?.name || "User"}!</p>
          </div>
          <Badge variant="outline" className="gap-1 self-start sm:self-auto">
            <Clock className="h-3 w-3" />
            <span className="text-xs sm:text-sm">{format(/* @__PURE__ */ new Date(), "EEE, MMM d, yyyy")}</span>
          </Badge>
        </div>

        {
    /* Quick Stats - Improved responsive grid */
  }
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Today&apos;s Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">
                {settings.currencySymbol}
                {dailyStats.sales.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span>
                <span className="hidden sm:inline">from yesterday</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{dailyStats.transactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {settings.currencySymbol}
                {dailyStats.avgTicket.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{dailyStats.customers}</div>
              <p className="text-xs text-muted-foreground mt-1">{heldCarts} held carts</p>
            </CardContent>
          </Card>

          {canViewInventory && <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold">{activeProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {lowStockProducts.length > 0 ? <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {lowStockProducts.length} low stock
                  </span> : "All stocked"}
              </p>
            </CardContent>
          </Card>}
        </div>

        {
    /* Main Content Grid */
  }
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {
    /* Hourly Target */
  }
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-5 w-5" />
                Daily Progress
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track your sales performance</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold">
                  {settings.currencySymbol}
                  {dailyStats.sales.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">/ {settings.currencySymbol}5,000 target</span>
              </div>
              <Progress value={dailyStats.sales / 5e3 * 100} className="h-3" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {dailyStats.sales >= 5e3 ? "Target achieved!" : `${settings.currencySymbol}${(5e3 - dailyStats.sales).toFixed(0)} more to reach daily target`}
              </p>
            </CardContent>
          </Card>

          {
    /* Quick Actions */
  }
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-2">
              {!isAuditor(user) && <Button asChild className="w-full justify-between text-sm h-10 bg-transparent" variant="outline">
                <Link href="/pos">
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Open POS
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>}
              {canManageProducts && <Button asChild className="w-full justify-between text-sm h-10 bg-transparent" variant="outline">
                <Link href="/products">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>}
              <Button asChild className="w-full justify-between text-sm h-10 bg-transparent" variant="outline">
                <Link href="/reports">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Reports
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {canViewInventory && <Button asChild className="w-full justify-between text-sm h-10 bg-transparent" variant="outline">
                <Link href="/inventory">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Inventory
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>}
            </CardContent>
          </Card>
        </div>

        {recentTransactions.length > 0 && <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Receipt className="h-5 w-5" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Latest sales activity</CardDescription>
                </div>
                <Button variant="link" asChild className="text-xs sm:text-sm">
                  <Link href="/sales">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {recentTransactions.map((sale,index) => <div key={`${sale.id}-${index}`} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm">{sale?.receiptNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale?.created_at ? format(new Date(sale.created_at), "HH:mm") : 'N/A'} - {sale?.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {settings.currencySymbol}
                        {parseFloat(sale?.total_amount || 0).toFixed(2)}
                      </p>
                      <Badge variant={sale?.status === "completed" ? "default" : "destructive"} className="text-[10px]">
                        {sale?.status}
                      </Badge>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>}

        {
    /* Low Stock Alerts */
  }
        {canViewInventory && lowStockProducts.length > 0 && <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base sm:text-lg">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {lowStockProducts.slice(0, 4).map((product) => <div key={product.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                    <img
    src={product.images[0] || "/placeholder.svg?height=40&width=40&query=product"}
    alt={product.name}
    className="h-10 w-10 rounded object-cover flex-shrink-0"
  />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                      <p className="text-xs text-destructive font-medium">Only {product.stock} left</p>
                    </div>
                  </div>)}
              </div>
              {lowStockProducts.length > 4 && <Button asChild variant="link" className="mt-2 p-0 text-xs sm:text-sm">
                  <Link href="/inventory">View all {lowStockProducts.length} low stock items</Link>
                </Button>}
            </CardContent>
          </Card>}

        {
    /* Store Info - Only show to non-auditors */
  }
        {!isAuditor(user) && <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Store Name</p>
                <p className="font-medium text-sm sm:text-base truncate">{settings.storeName}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Address</p>
                <p className="font-medium text-sm sm:text-base truncate">{settings.storeAddress}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Staff</p>
                <p className="font-medium text-sm sm:text-base">{users.filter((u) => u.isActive).length} users</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tax Rate</p>
                <p className="font-medium text-sm sm:text-base">{settings.taxRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>}
        
        {
    /* Auditor-specific content */
  }
        {isAuditor(user) && <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-5 w-5" />
              Audit Dashboard
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Read-only access for compliance and auditing</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                As an auditor, you have read-only access to sales, reports, and analytics data.
                You can view but cannot modify any information in the system.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>}
      </div>
    </ScrollArea>;
}
