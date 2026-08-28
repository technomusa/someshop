"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Minus,
  Plus,
  Trash2,
  Pause,
  CreditCard,
  Banknote,
  Smartphone,
  Percent,
  User,
  X,
  ShoppingBag,
  Receipt,
  Check,
  UserPlus,
  Split,
  Calculator,
  Globe,
} from "lucide-react";
import { usePOSStore, generateId } from "@/lib/store";
import { useFinanceStore } from "@/lib/finance-store";
import { useSettingsStore } from "@/lib/settings-store";
import { sampleCustomers } from "@/lib/data";
import { ReceiptPreview } from "./receipt-preview";
import { CashBreakdownDialog } from "./cash-breakdown-dialog";
import { MultiPaymentDialog } from "./multi-payment-dialog";
import { CurrencySelector, CurrencyDisplay } from "./currency-selector";
import { useToast } from "@/hooks/use-toast";
export function CartPanel({ onClose }) {
  const {
    getActiveCart,
    updateCartItem,
    removeFromCart,
    applyCartDiscount,
    holdCart,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    taxRate,
    quickAmounts,
    addSale,
    currentUser,
    updateCustomerPoints,
    addCustomer,
    currency,
    setCurrency,
    enabledPaymentMethods,
    cashBreakdown,
    setCashBreakdown,
    clearCashBreakdown,
  } = usePOSStore();
  const { settings } = useSettingsStore();
  const {
    formatCurrency,
    getQuickAmounts,
    getCurrencyConfig,
    calculateOptimalChange,
  } = useFinanceStore();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [showMultiPayment, setShowMultiPayment] = useState(false);
  const [showCashBreakdown, setShowCashBreakdown] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [holdNote, setHoldNote] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const cart = getActiveCart();
  const items = cart?.items || [];
  const currentCurrency = currency || settings.currency || "USD";
  const currencyConfig = getCurrencyConfig(currentCurrency);
  const currencyQuickAmounts = getQuickAmounts(currentCurrency);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F4" && cart && cart.items.length > 0) {
        e.preventDefault();
        setShowPayment(true);
      }
      if (e.key === "F3" && cart && cart.items.length > 0) {
        e.preventDefault();
        setShowHoldDialog(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart]);
  const handleQuantityChange = (itemId, delta) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      updateCartItem(itemId, newQuantity);
    }
  };
  const handleDirectQuantityInput = (itemId, value) => {
    const num = Number.parseInt(value);
    if (!isNaN(num) && num >= 1) {
      updateCartItem(itemId, num);
    }
  };
  const handleApplyDiscount = () => {
    if (!cart || !discountValue) return;
    const value = Number.parseFloat(discountValue);
    if (isNaN(value)) return;
    const discount =
      discountType === "percent" ? (cart.subtotal * value) / 100 : value;
    applyCartDiscount(discount);
    setShowDiscountDialog(false);
    setDiscountValue("");
    toast({
      title: "Discount applied",
      description: `${discountType === "percent" ? value + "%" : "$" + value} off`,
    });
  };
  const handleHoldCart = () => {
    holdCart(holdNote);
    setShowHoldDialog(false);
    setHoldNote("");
    toast({
      title: "Cart held",
      description: holdNote || "Cart saved for later",
    });
    onClose?.();
  };
  const handleAddNewCustomer = () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive",
      });
      return;
    }
    const customer = addCustomer({
      name: newCustomerData.name,
      phone: newCustomerData.phone,
      email: newCustomerData.email || void 0,
    });
    setSelectedCustomer(customer);
    setShowNewCustomer(false);
    setNewCustomerData({ name: "", phone: "", email: "" });
  };
  const handlePayment = () => {
    if (!cart || !cart.items.length) return;
    const amountPaid = Number.parseFloat(paymentAmount || "0");
    if (paymentMethod === "cash" && amountPaid < cart.total) {
      toast({
        title: "Error",
        description: "Insufficient payment amount",
        variant: "destructive",
      });
      return;
    }
    const change = paymentMethod === "cash" ? amountPaid - cart.total : 0;
    const receiptNumber = `RCP-${generateId().toUpperCase().slice(0, 8)}`;

    const payments = [
      {
        method: paymentMethod,
        amount: amountPaid,
        breakdown: paymentMethod === "cash" ? cashBreakdown : undefined,
        currency: currentCurrency,
      },
    ];

    addSale({
      receiptNumber,
      cart: { ...cart },
      payments,
      customerId: selectedCustomer?.id,
      cashierId: currentUser?.id || "unknown",
      cashierName: currentUser?.name,
      branchId: "main",
      status: "completed",
      currency: currentCurrency,
      createdAt: new Date(),
      completedAt: new Date(),
    });
    if (selectedCustomer) {
      const pointsEarned = Math.floor(cart.total / 10);
      updateCustomerPoints(selectedCustomer.id, pointsEarned);
    }
    setCompletedSale({
      cart: { ...cart },
      receiptNumber,
      amountPaid,
      change,
      currency: currentCurrency,
    });
    setShowPayment(false);
    setShowReceipt(true);
    clearCart();
    clearCashBreakdown();
    setPaymentAmount("");
  };

  const handleMultiPayment = (paymentData) => {
    if (!cart || !cart.items.length) return;

    const receiptNumber = `RCP-${generateId().toUpperCase().slice(0, 8)}`;

    addSale({
      receiptNumber,
      cart: { ...cart },
      payments: paymentData.payments.map((p) => ({
        ...p,
        currency: paymentData.currency,
      })),
      customerId: selectedCustomer?.id,
      cashierId: currentUser?.id || "unknown",
      cashierName: currentUser?.name,
      branchId: "main",
      status: "completed",
      currency: paymentData.currency,
      createdAt: new Date(),
      completedAt: new Date(),
    });

    if (selectedCustomer) {
      const pointsEarned = Math.floor(cart.total / 10);
      updateCustomerPoints(selectedCustomer.id, pointsEarned);
    }

    setCompletedSale({
      cart: { ...cart },
      receiptNumber,
      payments: paymentData.payments,
      totalAmount: paymentData.totalAmount,
      currency: paymentData.currency,
    });

    setShowMultiPayment(false);
    setShowReceipt(true);
    clearCart();
    clearCashBreakdown();
  };

  const handleCashBreakdownConfirm = (breakdownData) => {
    setCashBreakdown(breakdownData.breakdown);
    setPaymentAmount(breakdownData.total.toString());
    toast({
      title: "Cash Breakdown Set",
      description: `Breakdown saved: ${formatCurrency(breakdownData.total, currentCurrency)}`,
    });
  };
  const handleReceiptClose = () => {
    setShowReceipt(false);
    setCompletedSale(null);
    onClose?.();
  };
  const changeAmount =
    paymentMethod === "cash" && paymentAmount
      ? Number.parseFloat(paymentAmount) - (cart?.total || 0)
      : 0;
  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Cart</h2>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <CurrencySelector
            value={currentCurrency}
            onChange={setCurrency}
            compact={true}
            showExchangeRates={false}
          />
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive hover:text-destructive"
              onClick={() => clearCart()}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Customer Selection - Added new customer option */}
      <div className="border-b border-border p-3 sm:p-4">
        <div className="flex gap-2">
          <Select
            value={selectedCustomer?.id || "walk-in"}
            onValueChange={(value) => {
              if (value === "walk-in") {
                setSelectedCustomer(null);
              } else if (value === "new") {
                setShowNewCustomer(true);
              } else {
                const customer = sampleCustomers.find((c) => c.id === value);
                setSelectedCustomer(customer || null);
              }
            }}
          >
            <SelectTrigger className="flex-1 h-9">
              <User className="mr-2 h-4 w-4 shrink-0" />
              <SelectValue placeholder="Walk-in Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Walk-in Customer</SelectItem>
              <SelectItem value="new" className="text-primary">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add New Customer
                </span>
              </SelectItem>
              <Separator className="my-1" />
              {sampleCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <span className="flex items-center justify-between w-full">
                    {customer.name}
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {customer.loyaltyPoints} pts
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCustomer && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {selectedCustomer.loyaltyPoints} points
            </Badge>
            <span>{selectedCustomer.phone}</span>
          </div>
        )}
      </div>

      {/* Cart Items - Improved item cards */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <ShoppingBag className="mb-4 h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">Cart is empty</p>
            <p className="text-sm">Add products to start a sale</p>
          </div>
        ) : (
          <div className="space-y-2 p-3 sm:p-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent/30"
              >
                <img
                  src={
                    item.product.images[0] ||
                    "/placeholder.svg?height=60&width=60&query=product"
                  }
                  alt={item.product.name}
                  className="h-12 w-12 rounded-md object-cover shrink-0 bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.product.name}
                  </p>
                  {item.variant && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.variant.attributes &&
                      typeof item.variant.attributes === "object"
                        ? Object.values(item.variant.attributes).join(", ")
                        : null}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-primary mt-0.5">
                    ${Number(item.unitPrice ?? 0).toFixed(2)}
                  </p>
                  {Number(item.discount ?? 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="mt-1 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      -${Number(item.discount ?? 0).toFixed(2)} off
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    {editingItemId === item.id ? (
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleDirectQuantityInput(item.id, e.target.value)
                        }
                        onBlur={() => setEditingItemId(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setEditingItemId(null)
                        }
                        className="w-12 h-7 text-center text-sm p-0"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setEditingItemId(item.id)}
                        className="w-8 text-center text-sm font-medium hover:bg-muted rounded px-1 py-0.5"
                      >
                        {item.quantity}
                      </button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-bold">
                    ${Number(item.total ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Totals - Improved styling */}
      {items.length > 0 && (
        <div className="border-t border-border p-3 sm:p-4 space-y-3 bg-muted/30">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <CurrencyDisplay
                amount={cart?.subtotal ?? 0}
                currency={currentCurrency}
              />
            </div>
            {(cart?.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>
                  -
                  <CurrencyDisplay
                    amount={cart?.discountAmount ?? 0}
                    currency={currentCurrency}
                  />
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tax ({Number(taxRate * 100).toFixed(0)}%)
              </span>
              <CurrencyDisplay
                amount={cart?.taxAmount ?? 0}
                currency={currentCurrency}
              />
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                <CurrencyDisplay
                  amount={cart?.total ?? 0}
                  currency={currentCurrency}
                />
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Dialog
              open={showDiscountDialog}
              onOpenChange={setShowDiscountDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-transparent"
                >
                  <Percent className="mr-1.5 h-4 w-4" />
                  Discount
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Apply Discount</DialogTitle>
                  <DialogDescription>
                    Enter a discount amount or percentage
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select
                    value={discountType}
                    onValueChange={(v) => setDiscountType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={
                      discountType === "percent" ? "Enter %" : "Enter amount"
                    }
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleApplyDiscount}
                    className="w-full sm:w-auto"
                  >
                    Apply Discount
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-transparent"
                >
                  <Pause className="mr-1.5 h-4 w-4" />
                  Hold (F3)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Hold Cart</DialogTitle>
                  <DialogDescription>
                    Add a note to identify this held cart later
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Note (optional)"
                    value={holdNote}
                    onChange={(e) => setHoldNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleHoldCart} className="w-full sm:w-auto">
                    Hold Cart
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Payment Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
              <DialogTrigger asChild>
                <Button className="h-12 text-base font-semibold" size="lg">
                  <Receipt className="mr-2 h-4 w-4" />
                  Pay (F4)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Process Payment</DialogTitle>
                  <DialogDescription>
                    Total:{" "}
                    <CurrencyDisplay
                      amount={cart?.total ?? 0}
                      currency={currentCurrency}
                    />
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("cash")}
                      className="flex-col h-20"
                      disabled={!enabledPaymentMethods.includes("cash")}
                    >
                      <Banknote className="h-6 w-6 mb-1" />
                      <span className="text-xs">Cash</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("card")}
                      className="flex-col h-20"
                      disabled={!enabledPaymentMethods.includes("card")}
                    >
                      <CreditCard className="h-6 w-6 mb-1" />
                      <span className="text-xs">Card</span>
                    </Button>
                    <Button
                      variant={
                        paymentMethod === "mobile_money" ? "default" : "outline"
                      }
                      onClick={() => setPaymentMethod("mobile_money")}
                      className="flex-col h-20"
                      disabled={!enabledPaymentMethods.includes("mobile_money")}
                    >
                      <Smartphone className="h-6 w-6 mb-1" />
                      <span className="text-xs">Mobile</span>
                    </Button>
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Amount Received</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="text-lg h-12"
                        />
                      </div>

                      {/* Cash breakdown button */}
                      <Button
                        variant="outline"
                        onClick={() => setShowCashBreakdown(true)}
                        className="w-full gap-2"
                      >
                        <Calculator className="h-4 w-4" />
                        {Object.keys(cashBreakdown).length > 0
                          ? "Update"
                          : "Add"}{" "}
                        Cash Breakdown
                      </Button>

                      {Number.parseFloat(paymentAmount) >=
                        (cart?.total || 0) && (
                        <div className="rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-900/20 dark:text-green-400 flex items-center justify-between">
                          <span className="font-medium">Change:</span>
                          <span className="text-xl font-bold">
                            <CurrencyDisplay
                              amount={changeAmount ?? 0}
                              currency={currentCurrency}
                            />
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-2">
                        {currencyQuickAmounts.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setPaymentAmount(amount.toString())}
                          >
                            <CurrencyDisplay
                              amount={amount}
                              currency={currentCurrency}
                              showSymbol={false}
                            />
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() =>
                          setPaymentAmount(
                            Number(cart?.total ?? 0).toFixed(
                              currencyConfig.decimals,
                            ) || "",
                          )
                        }
                      >
                        Exact Amount (
                        <CurrencyDisplay
                          amount={cart?.total ?? 0}
                          currency={currentCurrency}
                        />
                        )
                      </Button>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    className="w-full h-12 text-base"
                    size="lg"
                    onClick={handlePayment}
                    disabled={
                      paymentMethod === "cash" &&
                      Number.parseFloat(paymentAmount || "0") <
                        (cart?.total || 0)
                    }
                  >
                    <Receipt className="mr-2 h-5 w-5" />
                    Complete Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => setShowMultiPayment(true)}
              className="h-12 text-base font-semibold gap-2"
              size="lg"
            >
              <Split className="h-4 w-4" />
              Split Pay
            </Button>
          </div>
        </div>
      )}

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
        <DialogContent className="max-w-[95vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newCustomerData.name}
                onChange={(e) =>
                  setNewCustomerData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={newCustomerData.phone}
                onChange={(e) =>
                  setNewCustomerData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={newCustomerData.email}
                onChange={(e) =>
                  setNewCustomerData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCustomer(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewCustomer}>
              <Check className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cash breakdown dialog */}
      <CashBreakdownDialog
        open={showCashBreakdown}
        onOpenChange={setShowCashBreakdown}
        expectedAmount={parseFloat(paymentAmount) || 0}
        onConfirm={handleCashBreakdownConfirm}
        currency={currentCurrency}
        title="Cash Payment Breakdown"
        description="Enter the exact cash denomination breakdown"
        mode="count"
      />

      {/* Multi-payment dialog */}
      <MultiPaymentDialog
        open={showMultiPayment}
        onOpenChange={setShowMultiPayment}
        totalAmount={cart?.total || 0}
        onConfirm={handleMultiPayment}
        currency={currentCurrency}
        enabledMethods={enabledPaymentMethods}
      />

      {completedSale && completedSale.cart && (
        <ReceiptPreview
          open={showReceipt}
          onClose={handleReceiptClose}
          cart={completedSale.cart}
          customer={selectedCustomer}
          paymentMethod={paymentMethod}
          amountPaid={completedSale.amountPaid}
          change={completedSale.change}
          receiptNumber={completedSale.receiptNumber}
        />
      )}
    </div>
  );
}
