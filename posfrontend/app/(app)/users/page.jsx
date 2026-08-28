"use client";

import { UserManagement } from "@/components/settings/user-management";
import { RoleGuard } from "@/components/access-control/role-guard";
import { useSession } from "next-auth/react";

export default function UsersPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <RoleGuard module="users" user={user} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    }>
      <div className="space-y-6">
        <UserManagement />
      </div>
    </RoleGuard>
  );
}
