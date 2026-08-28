"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Package, ArrowLeftRight, ClipboardList, FileText, Truck } from "lucide-react";
import { StockOverview } from "@/components/inventory/stock-overview";
import { StockAdjustmentForm } from "@/components/inventory/stock-adjustment-form";
import { PurchaseOrderForm } from "@/components/inventory/purchase-order-form";
import { StockTransferForm } from "@/components/inventory/stock-transfer-form";
import { AdjustmentHistory } from "@/components/inventory/adjustment-history";
export default function InventoryPage() {
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  return <div className="flex flex-col h-full overflow-hidden">
      {
    /* Header - Made responsive */
  }
      <div className="border-b border-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Track stock levels, adjustments, and transfers</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Transfer</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAdjustment(true)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Adjust</span>
            </Button>
            <Button size="sm" onClick={() => setShowPurchaseOrder(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Purchase Order</span>
              <span className="sm:hidden">PO</span>
            </Button>
          </div>
        </div>
      </div>

      {
    /* Content - Scrollable tabs */
  }
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 pt-4">
            <ScrollArea className="w-full" orientation="horizontal">
              <TabsList className="inline-flex w-max">
                <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Stock Overview</span>
                  <span className="sm:hidden">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="adjustments" className="gap-2 text-xs sm:text-sm">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Adjustments</span>
                  <span className="sm:hidden">Adjust</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2 text-xs sm:text-sm">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Purchase Orders</span>
                  <span className="sm:hidden">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="transfers" className="gap-2 text-xs sm:text-sm">
                  <Truck className="h-4 w-4" />
                  <span className="hidden sm:inline">Transfers</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">
              <TabsContent value="overview" className="mt-0">
                <StockOverview />
              </TabsContent>

              <TabsContent value="adjustments" className="mt-0">
                <AdjustmentHistory />
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Purchase orders will appear here</p>
                  <Button className="mt-4" onClick={() => setShowPurchaseOrder(true)}>
                    Create First Order
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="transfers" className="mt-0">
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Stock transfers will appear here</p>
                  <Button className="mt-4" onClick={() => setShowTransfer(true)}>
                    Create First Transfer
                  </Button>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      <StockAdjustmentForm 
        open={showAdjustment} 
        onOpenChange={setShowAdjustment}
        onSuccess={() => {
          // Refetch will be handled by query invalidation in the form
        }}
      />
      <PurchaseOrderForm 
        open={showPurchaseOrder} 
        onOpenChange={setShowPurchaseOrder}
        onSuccess={() => {
          // Refetch will be handled by query invalidation in the form
        }}
      />
      <StockTransferForm 
        open={showTransfer} 
        onOpenChange={setShowTransfer}
        onSuccess={() => {
          // Refetch will be handled by query invalidation in the form
        }}
      />
    </div>;
}
