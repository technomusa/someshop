"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Boxes,
  Truck,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  LayoutDashboard,
  Menu,
  FileCheck,
  UserCog
} from "lucide-react";
import { usePOSStore } from "@/lib/store";
import { ShopSelector } from "@/components/settings/shop-selector";
import { getAvailableMenuItems, getUserRoleLevel } from "@/lib/access-control";

// All possible nav items
const allNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "POS Terminal",
    href: "/pos",
    icon: ShoppingCart
  },
  {
    title: "Products",
    href: "/products",
    icon: Package
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users
  },
  {
    title: "Sales",
    href: "/sales",
    icon: Receipt
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3
  },
  {
    title: "Auditing",
    href: "/auditing",
    icon: FileCheck
  },
  {
    title: "Users",
    href: "/users",
    icon: UserCog
  }
];

const managementNavItems = [
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
];

function NavigationContent({
  collapsed,
  pathname,
  onNavigate,
  user
}) {
  // Get role-filtered menu items
  const mainNavItems = useMemo(() => {
    if (!user) return [];
    return getAvailableMenuItems(user).map(menuItem => {
      const navItem = allNavItems.find(item => item.href === menuItem.path);
      return navItem || null;
    }).filter(Boolean);
  }, [user]);

  // Filter management items based on role
  const filteredManagementItems = useMemo(() => {
    if (!user) return [];
    const roleLevel = getUserRoleLevel(user);
    // Only show management items to admin and above
    if (['super_admin', 'admin'].includes(roleLevel)) {
      return managementNavItems;
    }
    return [];
  }, [user]);

  return <div className="space-y-6">
    {
      /* Main Navigation */
    }
    <div className="space-y-1">
      {!collapsed && <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Main</p>}
      {mainNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const button = <Button
          key={item.href}
          variant={isActive ? "secondary" : "ghost"}
          className={cn("w-full justify-start", collapsed && "justify-center px-2")}
          asChild
          onClick={onNavigate}
        >
          <Link href={item.href}>
            <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && item.title}
          </Link>
        </Button>;
        if (collapsed) {
          return <Tooltip key={item.href}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>;
        }
        return button;
      })}
    </div>

    {
      /* Management Navigation */
    }
    {filteredManagementItems.length > 0 && <div className="space-y-1">
      {!collapsed && <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Management</p>}
      {filteredManagementItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0]);
        const Icon = item.icon;
        const button = <Button
          key={item.href}
          variant={isActive ? "secondary" : "ghost"}
          className={cn("w-full justify-start", collapsed && "justify-center px-2")}
          asChild
          onClick={onNavigate}
        >
          <Link href={item.href}>
            <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && item.title}
          </Link>
        </Button>;
        if (collapsed) {
          return <Tooltip key={item.href}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>;
        }
        return button;
      })}
    </div>}
  </div>;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { notifications } = usePOSStore();
  const { data: session } = useSession();
  const user = session?.user;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      await fetch(`${apiBaseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {
        // Logout endpoint might fail, but we continue with NextAuth signOut
      });
    } catch (e) {
      console.warn("Backend logout failed:", e);
    }

    // Sign out from NextAuth (clears session)
    await signOut({ redirect: false });

    // Redirect to login
    router.push("/");
  };

  // Get role display name
  const roleDisplay = useMemo(() => {
    if (!user?.roles) return "Not logged in";
    const roleNames = user.roles.map((r) => r.name || r);
    if (roleNames.includes('super_admin')) return 'Super Admin';
    if (roleNames.includes('admin')) return 'Admin';
    if (roleNames.includes('manager')) return 'Manager';
    if (roleNames.includes('auditor')) return 'Auditor';
    if (roleNames.includes('employee')) return 'Employee';
    return roleNames[0] || 'User';
  }, [user]);

  return <TooltipProvider delayDuration={0}>
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-2 border-b border-border bg-card px-4">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex h-14 items-center border-b border-border px-4">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <ShoppingCart className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">RetailPOS</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <NavigationContent collapsed={false} pathname={pathname} onNavigate={() => setMobileOpen(false)} user={user} />
            </ScrollArea>
            <div className="border-t border-border p-3 space-y-3">
              <ShopSelector />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user?.name || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{roleDisplay}</p>
                </div>
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ShoppingCart className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold">RetailPOS</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>}
        </Button>
      </div>
    </div>

    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {
        /* Logo */
      }
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">RetailPOS</span>
        </Link>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {
        /* Navigation */
      }
      <ScrollArea className="flex-1 px-3 py-4">
        <NavigationContent collapsed={collapsed} pathname={pathname} user={user} />
      </ScrollArea>

      {
        /* Footer */
      }
      <div className="border-t border-border p-3 space-y-3">
        {!collapsed && <ShopSelector />}
        <div className="flex items-center gap-2">
          {collapsed ? <div className="flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Notifications</TooltipContent>
            </Tooltip>
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </div> : <>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>}
            </Button>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground">{roleDisplay}</p>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </>}
        </div>
      </div>
    </aside>
  </TooltipProvider>;
}
