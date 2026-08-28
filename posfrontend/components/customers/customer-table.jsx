"use client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, Eye, Gift, History, Mail, Phone } from "lucide-react";
import { useCustomerStore } from "@/lib/customer-store";
import { format } from "date-fns";
function getLoyaltyTier(points) {
  const loyaltyPoints = points || 0;
  if (loyaltyPoints >= 5e3)
    return { tier: "Platinum", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" };
  if (loyaltyPoints >= 2e3)
    return { tier: "Gold", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" };
  if (loyaltyPoints >= 500) return { tier: "Silver", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
  return { tier: "Bronze", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300" };
}
function CustomerCard({
  customer,
  onEdit,
  onView,
  onDelete
}) {
  const loyaltyPoints = customer.loyalty_points || customer.loyaltyPoints || 0;
  const totalPurchases = customer.total_purchases || customer.totalPurchases || 0;
  const loyalty = getLoyaltyTier(loyaltyPoints);
  return <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs">
              {customer.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium truncate">{customer.name}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Phone className="h-3 w-3" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={loyalty.color} variant="secondary">
                {loyalty.tier} · {loyaltyPoints.toLocaleString()} pts
              </Badge>
              <span className="text-xs text-muted-foreground">{totalPurchases} orders</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}
export function CustomerTable({ customers, onEdit, onView, onRefresh }) {
  const { deleteCustomer } = useCustomerStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (customerToDelete) {
      setIsDeleting(true);
      try {
        await deleteCustomer(customerToDelete.id);
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Failed to delete customer:", error);
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      }
    }
  };
  return <>
      <div className="md:hidden">
        {customers.length === 0 ? <div className="text-center py-8 text-muted-foreground">No customers found.</div> : customers.map((customer) => <CustomerCard
    key={customer.id}
    customer={customer}
    onEdit={() => onEdit(customer)}
    onView={() => onView(customer)}
    onDelete={() => handleDeleteClick(customer)}
  />)}
      </div>

      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden lg:table-cell">Contact</TableHead>
              <TableHead>Loyalty</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Purchases</TableHead>
              <TableHead className="hidden xl:table-cell">Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow> : customers.map((customer) => {
    const loyaltyPoints = customer.loyalty_points || customer.loyaltyPoints || 0;
    const totalPurchases = customer.total_purchases || customer.totalPurchases || 0;
    const createdAt = customer.created_at || customer.createdAt || new Date();
    const loyalty = getLoyaltyTier(loyaltyPoints);
    return <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                          <AvatarFallback className="text-xs">
                            {customer.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">{customer.name}</p>
                          <p className="text-xs text-muted-foreground lg:hidden">{customer.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        {customer.email && <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{customer.email}</span>
                          </div>}
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={loyalty.color} variant="secondary">
                          {loyalty.tier}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{loyaltyPoints.toLocaleString()} pts</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      <p className="font-medium">{totalPurchases}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell">
                      {format(new Date(createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onView(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="mr-2 h-4 w-4" />
                            History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Gift className="mr-2 h-4 w-4" />
                            Add Points
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(customer)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>;
  })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{customerToDelete?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}
