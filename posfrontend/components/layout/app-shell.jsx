"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/pos/sidebar";
import { useSession } from "next-auth/react";
import { getAvailableMenuItems } from "@/lib/access-control";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShopSelector } from "@/components/settings/shop-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useProductStore } from "@/lib/product-store";
import { useSyncSessionWithStore } from "@/hooks/use-sync-session";
import { isAuditor, isEmployee, canAccess } from "@/lib/access-control";
import {
  Activity,
  Bell,
  CircleDot,
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Users,
  Plus
} from "lucide-react";
import { format } from "date-fns";

const PAGE_META = {
  dashboard: {
    title: "Dashboard",
    description: "Live performance, alerts, and quick actions"
  },
  pos: {
    title: "Point of Sale",
    description: "Checkout faster with streamlined carts and shortcuts"
  },
  products: {
    title: "Products",
    description: "Catalog, pricing, and stock health"
  },
  inventory: {
    title: "Inventory",
    description: "Transfers, adjustments, and low-stock insights"
  },
  customers: {
    title: "Customers",
    description: "Profiles, loyalty balances, and recent visits"
  },
  sales: {
    title: "Sales",
    description: "Receipts, refunds, and held orders"
  },
  reports: {
    title: "Reports",
    description: "Revenue, tax, and payout analytics"
  },
  suppliers: {
    title: "Suppliers",
    description: "Vendors, purchase orders, and deliveries"
  },
  settings: {
    title: "Settings",
    description: "Stores, payments, and staff controls"
  }
};

function MetricCard({
  icon: Icon,
  label,
  value,
  hint
}) {
  return <div className="flex items-center justify-between rounded-xl border bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-none">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" />
      </div>
    </div>;
}

export function AppShell({
  children
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  
  // Sync NextAuth session with store
  useSyncSessionWithStore();
  
  const {
    currentUser,
    notifications = [],
    salesHistory = [],
    carts = [],
    customers = []
  } = usePOSStore();
  const { settings } = useSettingsStore();
  const lowStockCount = useProductStore((state) => state.getLowStockProducts().length);
  const { data: session } = useSession();
  const user = session?.user;
  
  // Get role-filtered nav items
  const navItems = useMemo(() => {
    if (!user) return [];
    const menuItems = getAvailableMenuItems(user);
    // Map to nav items format
    const iconMap = {
      LayoutDashboard: require("lucide-react").LayoutDashboard,
      ShoppingCart: require("lucide-react").ShoppingCart,
      Package: require("lucide-react").Package,
      Boxes: require("lucide-react").Boxes,
      Users: require("lucide-react").Users,
      Receipt: require("lucide-react").Receipt,
      BarChart: require("lucide-react").BarChart3,
      FileCheck: require("lucide-react").FileCheck,
      UserCog: require("lucide-react").UserCog,
      Truck: require("lucide-react").Truck,
      Settings: require("lucide-react").Settings,
    };
    return menuItems.map(item => {
      const Icon = iconMap[item.icon] || require("lucide-react").LayoutDashboard;
      return {
        title: item.label,
        href: item.path,
        icon: Icon
      };
    });
  }, [user]);
  const quickActions = useMemo(() => {
    const actions = [];
    
    // Only non-auditors can start sales
    if (!isAuditor(user)) {
      actions.push({
        label: "Start a new sale",
        href: "/pos",
        icon: ShoppingBag
      });
    }
    
    // Only non-auditors and non-employees can add products
    if (!isAuditor(user) && !isEmployee(user)) {
      actions.push({
        label: "Add product",
        href: "/products?new=1",
        icon: Package
      });
    }
    
    // Most users can add customers (check permission)
    if (user && canAccess('customers', user, 'create')) {
      actions.push({
        label: "Add customer",
        href: "/customers?new=1",
        icon: Users
      });
    }
    
    return actions;
  }, [user]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const segment = useMemo(() => pathname.split("/")[1] || "dashboard", [pathname]);
  const meta = PAGE_META[segment] || {
    title: "Workspace",
    description: "All POS tools in one place"
  };
  const todayLabel = format(new Date(), "EEE, MMM d • h:mm a");
  const currency = settings?.currencySymbol || "$";
  const todaysSales = useMemo(() => {
    const today = new Date().toDateString();
    const todays = (salesHistory || []).filter((sale) => sale?.completedAt && new Date(sale.completedAt).toDateString() === today && sale.status === "completed");
    const total = todays.reduce((sum, sale) => sum + (sale?.cart?.total || 0), 0);
    return {
      total,
      count: todays.length
    };
  }, [salesHistory]);
  const activeCarts = carts.filter((c) => c.status === "active").length;
  const heldCarts = carts.filter((c) => c.status === "held").length;
  const unread = notifications.filter((n) => !n.read).length;

  const handleNavigate = (href) => {
    setIsCommandOpen(false);
    router.push(href);
  };

  return <>
      <div className="flex h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(112,90,255,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.06),transparent_22%),linear-gradient(to_bottom,var(--background),color-mix(in oklch,var(--background),var(--primary)/6%))]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col overflow-auto">
              <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                <div className="space-y-4 px-4 py-3 lg:px-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{meta.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold leading-none">{meta.title}</h1>
                        <Badge variant="secondary" className="gap-1">
                          <CircleDot className="h-3.5 w-3.5 text-green-500" />
                          Live
                        </Badge>
                        <Badge variant="outline" className="hidden sm:inline-flex gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          Fresh UI
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{meta.description}</p>
                    </div>

                    <div className="flex flex-1 flex-wrap items-center gap-2 justify-end">
                      <div className="relative w-full max-w-md">
                        <Input
                          readOnly
                          onClick={() => setIsCommandOpen(true)}
                          placeholder="Search navigation, products, or customers (⌘K)"
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2"
                          onClick={() => setIsCommandOpen(true)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      {!isAuditor(user) && <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => handleNavigate("/pos")}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        New Sale
                      </Button>}
                      {!isAuditor(user) && !isEmployee(user) && <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={() => handleNavigate("/products?new=1")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>}
                      <ThemeToggle />
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-4 w-4" />
                        {unread > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[11px]">
                            {unread}
                          </Badge>}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                      <ShopSelector />
                      <Separator orientation="vertical" className="hidden h-6 sm:flex" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      <span>{todayLabel}</span>
                    </div>
                    {currentUser && <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{currentUser.name}</span>
                        <Badge variant="outline" className="capitalize">
                          {currentUser.role || "staff"}
                        </Badge>
                      </div>}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      icon={Activity}
                      label="Today's sales"
                      value={`${currency}${todaysSales.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`}
                      hint={`${todaysSales.count} orders`}
                    />
                    <MetricCard icon={ShoppingBag} label="Active carts" value={activeCarts} hint={`${heldCarts} held`} />
                    <MetricCard icon={Package} label="Low stock" value={lowStockCount} hint="needs reorder" />
                    <MetricCard icon={Users} label="Customers" value={customers.length} hint="synced records" />
                  </div>
                </div>
              </header>

              <main className="flex-1">
                <div className="mx-auto w-full max-w-7xl px-3 pb-10 pt-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Jump to a screen or run an action..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {navItems.map((item) => <CommandItem key={item.href} value={item.title} onSelect={() => handleNavigate(item.href)}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>)}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick actions">
            {quickActions.map((action) => <CommandItem key={action.href} value={action.label} onSelect={() => handleNavigate(action.href)}>
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </CommandItem>)}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>;
}

