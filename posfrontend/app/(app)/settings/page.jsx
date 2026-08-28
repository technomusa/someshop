"use client";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StoreSettings } from "@/components/settings/store-settings";
import { UserManagement } from "@/components/settings/user-management";
import { BranchManagement } from "@/components/settings/branch-management";
import { PaymentSettings } from "@/components/settings/payment-settings";
import { TaxSettings } from "@/components/settings/tax-settings";
import {
  Store,
  Users,
  Building2,
  CreditCard,
  Percent,
  Globe,
} from "lucide-react";
import { CurrencySettings } from "@/components/settings/currency-settings";
import { getUserRoleLevel, canAccess } from "@/lib/access-control";
import { RoleGuard } from "@/components/access-control/role-guard";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const roleLevel = getUserRoleLevel(user);
  
  // Only super_admin and admin can access settings
  const canAccessSettings = roleLevel === 'super_admin' || roleLevel === 'admin';
  const canAccessUsers = canAccess('users', user);
  const canAccessBranches = canAccess('business', user);
  
  if (!canAccessSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to access settings.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your store configuration and preferences
        </p>
      </div>

      <Tabs
        defaultValue="store"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 sm:px-6 pt-4 border-b">
          <ScrollArea className="w-full" orientation="horizontal">
            <TabsList className="inline-flex w-max h-10">
              <TabsTrigger value="store" className="gap-2 px-3 sm:px-4">
                <Store className="h-4 w-4" />
                <span className="hidden xs:inline">Store</span>
              </TabsTrigger>
              {canAccessUsers && <TabsTrigger value="users" className="gap-2 px-3 sm:px-4">
                <Users className="h-4 w-4" />
                <span className="hidden xs:inline">Users</span>
              </TabsTrigger>}
              {canAccessBranches && <TabsTrigger value="branches" className="gap-2 px-3 sm:px-4">
                <Building2 className="h-4 w-4" />
                <span className="hidden xs:inline">Branches</span>
              </TabsTrigger>}
              <TabsTrigger value="payments" className="gap-2 px-3 sm:px-4">
                <CreditCard className="h-4 w-4" />
                <span className="hidden xs:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="taxes" className="gap-2 px-3 sm:px-4">
                <Percent className="h-4 w-4" />
                <span className="hidden xs:inline">Taxes</span>
              </TabsTrigger>
              <TabsTrigger value="currency" className="gap-2 px-3 sm:px-4">
                <Globe className="h-4 w-4" />
                <span className="hidden xs:inline">Currency</span>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <TabsContent value="store" className="mt-0">
              <StoreSettings />
            </TabsContent>
            {canAccessUsers && <TabsContent value="users" className="mt-0">
              <UserManagement />
            </TabsContent>}
            {canAccessBranches && <TabsContent value="branches" className="mt-0">
              <BranchManagement />
            </TabsContent>}
            <TabsContent value="payments" className="mt-0">
              <PaymentSettings />
            </TabsContent>
            <TabsContent value="taxes" className="mt-0">
              <TaxSettings />
            </TabsContent>
            <TabsContent value="currency" className="mt-0">
              <CurrencySettings />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
