"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator, Keyboard, RotateCcw, Receipt, UserPlus, QrCode, Search } from "lucide-react";
import { HeldCarts } from "./held-carts";
import { usePOSStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
const shortcuts = [
  { key: "F1", action: "Search" },
  { key: "F3", action: "Hold" },
  { key: "F4", action: "Pay" }
];
export function QuickActions() {
  const { salesHistory, refundSale, addCustomer, setSelectedCustomer } = usePOSStore();
  const { toast } = useToast();
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLastReceipt, setShowLastReceipt] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [refundSearch, setRefundSearch] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [newCustomerData, setNewCustomerData] = useState({ name: "", phone: "", email: "" });
  const handleCalcInput = (value) => {
    if (value === "C") {
      setCalcDisplay("0");
    } else if (value === "=") {
      try {
        const result = eval(calcDisplay);
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay("Error");
      }
    } else {
      setCalcDisplay((prev) => prev === "0" ? value : prev + value);
    }
  };
  const lastSale = salesHistory[0];
  const filteredSales = salesHistory.filter(
    (sale) => sale.status === "completed" && (sale.receiptNumber?.toLowerCase().includes(refundSearch.toLowerCase()) || sale.cashierName?.toLowerCase().includes(refundSearch.toLowerCase()))
  );
  const handleRefund = () => {
    if (!selectedSaleId || !refundReason) {
      toast({ title: "Error", description: "Please select a sale and provide a reason", variant: "destructive" });
      return;
    }
    refundSale(selectedSaleId, refundReason);
    toast({ title: "Refund processed", description: "The sale has been refunded" });
    setShowRefund(false);
    setSelectedSaleId(null);
    setRefundReason("");
    setRefundSearch("");
  };
  const handleAddNewCustomer = () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      toast({ title: "Error", description: "Name and phone are required", variant: "destructive" });
      return;
    }
    const customer = addCustomer({
      name: newCustomerData.name,
      phone: newCustomerData.phone,
      email: newCustomerData.email || void 0
    });
    setSelectedCustomer(customer);
    setShowNewCustomer(false);
    setNewCustomerData({ name: "", phone: "", email: "" });
    toast({ title: "Customer added", description: `${customer.name} added and selected` });
  };
  return <>
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 sm:px-4 py-2 min-w-max">
          <HeldCarts />

          <Button
    variant="outline"
    size="sm"
    className="flex-shrink-0 h-8 bg-transparent"
    onClick={() => setShowRefund(true)}
  >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refund</span>
          </Button>

          <Button
    variant="outline"
    size="sm"
    className="flex-shrink-0 h-8 bg-transparent"
    onClick={() => setShowLastReceipt(true)}
    disabled={!lastSale}
  >
            <Receipt className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Last Receipt</span>
          </Button>

          <Button
    variant="outline"
    size="sm"
    className="flex-shrink-0 h-8 bg-transparent"
    onClick={() => setShowNewCustomer(true)}
  >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Customer</span>
          </Button>

          <Button variant="outline" size="sm" className="hidden md:flex flex-shrink-0 h-8 bg-transparent">
            <QrCode className="mr-1.5 h-3.5 w-3.5" />
            Scan QR
          </Button>

          <Button
    variant="outline"
    size="sm"
    className="hidden md:flex flex-shrink-0 h-8 bg-transparent"
    onClick={() => setShowCalculator(true)}
  >
            <Calculator className="mr-1.5 h-3.5 w-3.5" />
            Calculator
          </Button>

          <div className="hidden xl:flex ml-auto items-center gap-1.5 flex-shrink-0">
            <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-1">Shortcuts:</span>
            {shortcuts.map((s) => <Badge key={s.key} variant="outline" className="text-[10px] h-5">
                {s.key}
              </Badge>)}
          </div>
        </div>
      </ScrollArea>

      {
    /* Calculator Dialog */
  }
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-[280px]">
          <DialogHeader>
            <DialogTitle>Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="rounded-lg bg-muted p-3 text-right text-2xl font-mono">{calcDisplay}</div>
            <div className="grid grid-cols-4 gap-1.5">
              {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "C", "0", ".", "+"].map((btn) => <Button
    key={btn}
    variant={["C", "/", "*", "-", "+"].includes(btn) ? "secondary" : "outline"}
    className="h-12 text-lg"
    onClick={() => handleCalcInput(btn)}
  >
                  {btn}
                </Button>)}
              <Button className="col-span-4 h-12 text-lg" onClick={() => handleCalcInput("=")}>
                =
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {
    /* Last Receipt Dialog */
  }
      <Dialog open={showLastReceipt} onOpenChange={setShowLastReceipt}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Last Receipt</DialogTitle>
          </DialogHeader>
          {lastSale && <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt #</span>
                  <span className="font-mono">{lastSale.receiptNumber}</span>
                </div>
                {lastSale && lastSale.completedAt && <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(lastSale.completedAt), "MMM dd, HH:mm")}</span>
                </div>}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lastSale?.cart?.items.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${Number(lastSale?.cart?.total ?? 0).toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => window.print()}>
                <Receipt className="mr-2 h-4 w-4" />
                Reprint Receipt
              </Button>
            </div>}
        </DialogContent>
      </Dialog>

      {
    /* Refund Dialog */
  }
      <Dialog open={showRefund} onOpenChange={setShowRefund}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>Search for a sale to refund</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
    placeholder="Search by receipt number..."
    className="pl-9"
    value={refundSearch}
    onChange={(e) => setRefundSearch(e.target.value)}
  />
            </div>
            <ScrollArea className="flex-1 max-h-48">
              <div className="space-y-2">
                {filteredSales.length === 0 ? <p className="text-center text-muted-foreground py-4">No completed sales found</p> : filteredSales.slice(0, 10).map((sale) => <div
    key={sale.id}
    className={`rounded-lg border p-3 cursor-pointer transition-colors ${selectedSaleId === sale.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
    onClick={() => setSelectedSaleId(sale.id)}
  >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-sm">{sale.receiptNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(sale.completedAt), "MMM dd, HH:mm")}
                          </p>
                        </div>
                        <span className="font-bold">${Number(sale.cart.total ?? 0).toFixed(2)}</span>
                      </div>
                    </div>)}
              </div>
            </ScrollArea>
            {selectedSaleId && <div className="space-y-2">
                <Label>Refund Reason *</Label>
                <Textarea
    placeholder="Enter reason for refund..."
    value={refundReason}
    onChange={(e) => setRefundReason(e.target.value)}
    className="h-20"
  />
              </div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefund(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={!selectedSaleId || !refundReason} variant="destructive">
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {
    /* New Customer Dialog */
  }
      <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
        <DialogContent className="max-w-[95vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
    value={newCustomerData.name}
    onChange={(e) => setNewCustomerData((p) => ({ ...p, name: e.target.value }))}
    placeholder="Customer name"
  />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
    value={newCustomerData.phone}
    onChange={(e) => setNewCustomerData((p) => ({ ...p, phone: e.target.value }))}
    placeholder="+1 234 567 8900"
  />
            </div>
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input
    type="email"
    value={newCustomerData.email}
    onChange={(e) => setNewCustomerData((p) => ({ ...p, email: e.target.value }))}
    placeholder="email@example.com"
  />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCustomer(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
}
