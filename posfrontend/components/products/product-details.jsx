"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Package, DollarSign, Boxes, History, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
const categoryColors = {
  phones: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  laptops: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  smartwatches: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  accessories: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  clothing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  cold_store: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
};
export function ProductDetails({ open, onOpenChange, product, onEdit }) {
  if (!product) return null;
  const isLowStock = product.stock <= product.reorderLevel;
  const profitMargin = (Number(product.basePrice ?? 0) - Number(product.costPrice ?? 0)) / (Number(product.basePrice ?? 1)) * 100;
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{product.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Badge className={categoryColors[product.category]} variant="secondary">
                  {product.category.replace("_", " ")}
                </Badge>
                <span>•</span>
                <span>{product.brand}</span>
              </SheetDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] mt-6">
          <div className="space-y-6">
            {
    /* Product Image */
  }
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
    src={product.images[0] || "/placeholder.svg?height=300&width=500&query=product"}
    alt={product.name}
    className="w-full h-full object-cover"
  />
            </div>

            {
    /* Quick Stats */
  }
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  Price
                </div>
                <p className="text-2xl font-bold mt-1">${Number(product.basePrice ?? 0).toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Boxes className="h-4 w-4" />
                  Stock
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-2xl font-bold ${isLowStock ? "text-destructive" : ""}`}>{product.stock}</p>
                  {isLowStock && <AlertTriangle className="h-5 w-5 text-destructive" />}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Package className="h-4 w-4" />
                  Margin
                </div>
                <p className="text-2xl font-bold mt-1">{Number(profitMargin ?? 0).toFixed(1)}%</p>
              </div>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">
                  Details
                </TabsTrigger>
                <TabsTrigger value="variants" className="flex-1">
                  Variants
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{product.description || "No description available"}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">SKU</p>
                    <p className="font-mono font-medium">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Barcode</p>
                    <p className="font-mono font-medium">{product.barcode || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="font-medium">{product.model || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reorder Level</p>
                    <p className="font-medium">{product.reorderLevel} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost Price</p>
                    <p className="font-medium">${Number(product.costPrice ?? 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {product.category === "cold_store" && <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Expiry Date</p>
                        <p className="font-medium">
                          {product.expiryDate ? format(new Date(product.expiryDate), "MMM d, yyyy") : "\u2014"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Batch Number</p>
                        <p className="font-mono font-medium">{product.batchNumber || "\u2014"}</p>
                      </div>
                    </div>
                  </>}

                {(product.attributes && Object.keys(product.attributes).length > 0) && <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Attributes</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(product.attributes).map(([key, value]) => <Badge key={key} variant="outline">
                            {key}: {value}
                          </Badge>)}
                      </div>
                    </div>
                  </>}

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>Created: {product.created_at || product.createdAt ? format(new Date(product.created_at || product.createdAt), "MMM d, yyyy 'at' h:mm a") : 'N/A'}</p>
                  <p>Updated: {product.updated_at || product.updatedAt ? format(new Date(product.updated_at || product.updatedAt), "MMM d, yyyy 'at' h:mm a") : 'N/A'}</p>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="mt-4">
                {product.variants && product.variants.length > 0 ? <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {product.variants.map((variant) => <TableRow key={variant.id}>
                          <TableCell className="font-medium">{variant.name}</TableCell>
                          <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                          <TableCell className="text-right">${Number(variant.price ?? 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right">{variant.stock}</TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table> : <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No variants for this product</p>
                  </div>}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Stock movement history coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>;
}
