"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Shield, UserCog, UserIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { getUserRoleLevel, isSuperAdmin, isAdmin, isManager } from "@/lib/access-control";
import { useToast } from "@/components/ui/use-toast";

const roleIcons = {
  super_admin: Shield,
  admin: Shield,
  manager: UserCog,
  employee: UserIcon,
  cashier: UserIcon,
  auditor: Eye
};

const roleColors = {
  super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  employee: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cashier: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  auditor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
};

// Get allowed roles based on current user's role
function getAllowedRoles(userRoleLevel) {
  switch (userRoleLevel) {
    case 'super_admin':
      return ['admin', 'manager', 'employee', 'cashier', 'auditor'];
    case 'admin':
      return ['manager', 'employee', 'cashier', 'auditor'];
    case 'manager':
      return ['employee', 'cashier', 'auditor'];
    default:
      return [];
  }
}

export function UserManagement() {
  const { data: session } = useSession();
  const user = session?.user;
  const userRoleLevel = getUserRoleLevel(user);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "employee",
    business_id: null,
    branch_id: null,
    shop_id: null
  });

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/users');
      // Handle different response structures
      // API returns: { data: [...] } or { data: { data: [...], ... } } for paginated
      if (response.data?.data) {
        // Check if it's paginated (has current_page, per_page, etc.)
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          return response.data.data.data; // Paginated response
        }
        // Direct array in data property
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      // Direct array response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return []; // Fallback to empty array
    },
    enabled: !!user && ['super_admin', 'admin', 'manager'].includes(userRoleLevel)
  });

  // Fetch available businesses, branches, shops
  const { data: businesses } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const response = await apiClient.get('/users/businesses');
      return response.data.data || [];
    },
    enabled: !!user && (isSuperAdmin(user) || isAdmin(user))
  });

  const { data: branches } = useQuery({
    queryKey: ['branches', formData.business_id],
    queryFn: async () => {
      const response = await apiClient.get(`/users/branches?business_id=${formData.business_id || ''}`);
      return response.data.data || [];
    },
    enabled: !!user && !!formData.business_id && (isSuperAdmin(user) || isAdmin(user) || isManager(user))
  });

  const { data: shops } = useQuery({
    queryKey: ['shops', formData.branch_id],
    queryFn: async () => {
      const response = await apiClient.get(`/users/shops?branch_id=${formData.branch_id || ''}`);
      return response.data.data || [];
    },
    enabled: !!user && !!formData.branch_id
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive"
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive"
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "employee",
      business_id: null,
      branch_id: null,
      shop_id: null
    });
    setEditingUser(null);
  };

  const handleSubmit = () => {
    const submitData = { ...formData };
    
    // Remove password fields if editing and password is empty
    if (editingUser && !submitData.password) {
      delete submitData.password;
      delete submitData.password_confirmation;
    }

    // Remove null values
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === null || submitData[key] === '') {
        delete submitData[key];
      }
    });

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: submitData });
    } else {
      createUserMutation.mutate(submitData);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      password_confirmation: "",
      role: user.roles?.[0]?.name || "employee",
      business_id: user.business_id || null,
      branch_id: user.branch_id || null,
      shop_id: user.shop_id || null
    });
    setIsOpen(true);
  };

  const handleDelete = (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const allowedRoles = getAllowedRoles(userRoleLevel);
  // Ensure users is always an array - usersData should already be the array from queryFn
  const users = Array.isArray(usersData) ? usersData : [];

  // Check if user can create users
  if (!['super_admin', 'admin', 'manager'].includes(userRoleLevel)) {
    return <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>You do not have permission to manage users.</CardDescription>
      </CardHeader>
    </Card>;
  }

  return <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage staff accounts and permissions</CardDescription>
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
            Add User
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user details" : "Create a new staff account. You can only create users with roles beneath your own."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            {(!editingUser || formData.password) && <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  placeholder="Confirm password"
                />
              </div>
            </div>}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can only create users with roles beneath your role ({userRoleLevel.replace('_', ' ')})
              </p>
            </div>
            {(isSuperAdmin(user) || isAdmin(user)) && <div className="space-y-2">
              <Label htmlFor="business_id">Business</Label>
              <Select
                value={formData.business_id?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, business_id: parseInt(value), branch_id: null, shop_id: null })}
              >
                <SelectTrigger id="business_id">
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses?.map(business => (
                    <SelectItem key={business.id} value={business.id.toString()}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}
            {formData.business_id && (isSuperAdmin(user) || isAdmin(user) || isManager(user)) && <div className="space-y-2">
              <Label htmlFor="branch_id">Branch</Label>
              <Select
                value={formData.branch_id?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, branch_id: parseInt(value), shop_id: null })}
              >
                <SelectTrigger id="branch_id">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map(branch => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}
            {formData.branch_id && formData.role === 'employee' && <div className="space-y-2">
              <Label htmlFor="shop_id">Shop (Required for employees)</Label>
              <Select
                value={formData.shop_id?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, shop_id: parseInt(value) })}
              >
                <SelectTrigger id="shop_id">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops?.map(shop => (
                    <SelectItem key={shop.id} value={shop.id.toString()}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}
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
            <Button 
              onClick={handleSubmit}
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {editingUser ? "Save Changes" : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardHeader>
    <CardContent>
      {isLoading ? <div className="text-center py-8">Loading users...</div> : <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No users found
            </TableCell>
          </TableRow> : users.map((user) => {
            const RoleIcon = roleIcons[user.roles?.[0]?.name] || UserIcon;
            return <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={roleColors[user.roles?.[0]?.name] || roleColors.employee}>
                  <RoleIcon className="mr-1 h-3 w-3" />
                  {user.roles?.[0]?.name?.charAt(0).toUpperCase() + user.roles?.[0]?.name?.slice(1).replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>{user.business?.name || '-'}</TableCell>
              <TableCell>{user.branch?.name || '-'}</TableCell>
              <TableCell>{user.shop?.name || '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === session?.user?.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>}
    </CardContent>
  </Card>;
}
