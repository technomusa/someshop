"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/pos/sidebar";
import { getAvailableMenuItems } from "@/lib/access-control";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { useFinanceStore } from "@/lib/finance-store";
import { EODMonitor } from "@/components/auditing/eod-monitor";
import { Search, ShoppingBag, Package, Users, AlertTriangle } from "lucide-react";

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
  auditing: {
    title: "Auditing",
    description: "Financial control, closures, and compliance"
  },
  suppliers: {
    title: "Suppliers",
    description: "Vendors, purchase orders, and deliveries"
  },
  settings: {
    title: "Settings",
    description: "Stores, payments, and staff controls"
  },
  users: {
    title: "Users",
    description: "Manage staff accounts and permissions"
  }
};

export default function AppLayout({
  children
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  
  // Get role-filtered nav items for command dialog
  const navItems = useMemo(() => {
    if (!user) return [];
    const menuItems = getAvailableMenuItems(user);
    // Map menu items to nav items with proper icons
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
    }).filter(Boolean);
  }, [user]);
  const quickActions = useMemo(() => [
    {
      label: "Start a new sale",
      href: "/pos",
      icon: ShoppingBag
    },
    {
      label: "Add product",
      href: "/products?new=1",
      icon: Package
    },
    {
      label: "Add customer",
      href: "/customers?new=1",
      icon: Users
    }
  ], []);

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
  const { requireEODClose, getTodayClosure } = useFinanceStore();
  const todayClosed = !!getTodayClosure?.()?.closedAt;

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
              {requireEODClose && !todayClosed && <div className="border-b bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">End-of-day close required</p>
                    <p className="text-xs">Please reconcile and close accounts in Reports &gt; End of Day.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleNavigate("/reports#eod")}>
                  Go to close-out
                </Button>
              </div>}

              {segment !== "dashboard" && <header className="border-b bg-card/70 px-4 py-3 lg:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="uppercase tracking-[0.18em] text-[10px]">
                      {segment}
                    </Badge>
                    <h1 className="text-xl font-semibold leading-tight">{meta.title}</h1>
                    <p className="text-sm text-muted-foreground line-clamp-2">{meta.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setIsCommandOpen(true)}>
                      <Search className="mr-2 h-4 w-4" />
                      Search (⌘K)
                    </Button>
                    <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsCommandOpen(true)}>
                      <Search className="h-4 w-4" />
                    </Button>
                    <ThemeToggle />
                  </div>
                </div>
              </header>}

              <main className="flex-1 w-full">
                <div className="mx-auto w-full max-w-full pb-10 pt-6 ">
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
            {navItems.length > 0 ? navItems.map((item) => {
              const Icon = item.icon;
              return <CommandItem key={item.href} value={item.title} onSelect={() => handleNavigate(item.href)}>
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>;
            }) : <CommandEmpty>No accessible pages</CommandEmpty>}
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
      
      <EODMonitor />
    </>;
}