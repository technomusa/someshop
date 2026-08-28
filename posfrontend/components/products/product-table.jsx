"use client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Power, AlertTriangle } from "lucide-react";
import { useProductStore } from "@/lib/product-store";
import { format } from "date-fns";
const categoryColors = {
  phones: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  laptops: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  smartwatches: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  accessories: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  clothing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  cold_store: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
};
function ProductCard({
  product,
  onEdit,
  onView,
  onDelete,
  onToggle
}) {
  const stock = product.inventories?.[0]?.quantity || product.stock || 0;
  const reorderLevel = product.alert_quantity || product.reorderLevel || 10;
  const isLowStock = stock <= reorderLevel;
  return <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <img
    src={product.images[0] || "/placeholder.svg?height=60&width=60&query=product"}
    alt={product.name}
    className="h-14 w-14 rounded-md object-cover flex-shrink-0"
  />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Unknown'}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 flex-shrink-0">
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
                  <DropdownMenuItem onClick={onToggle}>
                    <Power className="mr-2 h-4 w-4" />
                    {product.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">${Number(product.basePrice || product.selling_price || 0).toFixed(2)}</span>
                <Badge className={categoryColors[product.category?.slug || product.category]} variant="secondary" className="text-[10px]">
                  {(product.category?.name || product.category?.slug || product.category || 'Unknown').replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {isLowStock && <AlertTriangle className="h-3 w-3 text-destructive" />}
                <span className={`text-xs ${isLowStock ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  Stock: {stock}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}
export function ProductTable({ products, onEdit, onView, onRefresh }) {
  const { deleteProduct, toggleProductStatus } = useProductStore();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(null);
  
  const handleSelectAll = (checked) => {
    setSelectedProducts(checked ? products.map((p) => p.id) : []);
  };
  const handleSelectProduct = (productId, checked) => {
    setSelectedProducts((prev) => checked ? [...prev, productId] : prev.filter((id) => id !== productId));
  };
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      try {
        await deleteProduct(productToDelete.id);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error("Failed to delete product:", error);
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };
  const handleToggleStatus = async (productId) => {
    setIsToggling(productId);
    try {
      await toggleProductStatus(productId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to toggle product status:", error);
    } finally {
      setIsToggling(null);
    }
  };
  const isLowStock = (product) => {
    const stock = product.inventories?.[0]?.quantity || product.stock || 0;
    const reorderLevel = product.alert_quantity || product.reorderLevel || 10;
    return stock <= reorderLevel;
  };
  const isExpiringSoon = (product) => {
    if (!product.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(product.expiryDate).getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };
  return <>
      <div className="md:hidden">
        {products.length === 0 ? <div className="text-center py-8 text-muted-foreground">No products found.</div> : products.map((product) => <ProductCard
    key={product.id}
    product={product}
    onEdit={() => onEdit(product)}
    onView={() => onView(product)}
    onDelete={() => handleDeleteClick(product)}
    onToggle={() => handleToggleStatus(product.id)}
  />)}
      </div>

      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 hidden lg:table-cell">
                <Checkbox
    checked={selectedProducts.length === products.length && products.length > 0}
    onCheckedChange={handleSelectAll}
  />
              </TableHead>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden xl:table-cell">SKU</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow> : products.map((product) => <TableRow key={product.id}>
                  <TableCell className="hidden lg:table-cell">
                    <Checkbox
    checked={selectedProducts.includes(product.id)}
    onCheckedChange={(checked) => handleSelectProduct(product.id, checked)}
  />
                  </TableCell>
                  <TableCell>
                    <img
    src={product.images[0] || "/placeholder.svg?height=40&width=40&query=product"}
    alt={product.name}
    className="h-9 w-9 rounded-md object-cover"
  />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate max-w-[150px]">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs hidden xl:table-cell">{product.sku}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge className={categoryColors[product.category?.slug || product.category]} variant="secondary">
                      {(product.category?.name || product.category?.slug || product.category || 'Unknown').replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">${Number(product.basePrice || product.selling_price || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isLowStock(product) && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      <span className={`text-sm ${isLowStock(product) ? "text-destructive font-medium" : ""}`}>
                        {product.inventories?.[0]?.quantity || product.stock || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <Badge variant={(product.is_active !== false && product.isActive !== false) ? "default" : "secondary"} className="text-[10px] w-fit">
                        {(product.is_active !== false && product.isActive !== false) ? "Active" : "Inactive"}
                      </Badge>
                      {isExpiringSoon(product) && <Badge variant="destructive" className="text-[10px] w-fit">
                          Exp {format(new Date(product.expiryDate), "MMM d")}
                        </Badge>}
                    </div>
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
                        <DropdownMenuItem onClick={() => onView(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.sku)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy SKU
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(product.id)}
                          disabled={isToggling === product.id}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {product.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(product)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{productToDelete?.name}"?</AlertDialogDescription>
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
