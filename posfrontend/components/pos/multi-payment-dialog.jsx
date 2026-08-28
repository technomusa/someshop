"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  Plus,
  Minus,
  Trash2,
  Calculator,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Split,
  Receipt,
  Building2,
  Gift,
  PieChart,
} from "lucide-react";
import { useFinanceStore } from "@/lib/finance-store";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useToast } from "@/hooks/use-toast";
import { CashBreakdownDialog } from "./cash-breakdown-dialog";

const PAYMENT_METHOD_ICONS = {
  cash: Banknote,
  card: CreditCard,
  mobile_money: Smartphone,
  bank_transfer: Building2,
  gift_card: Gift,
  store_credit: Wallet,
};

const PAYMENT_METHOD_COLORS = {
  cash: "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20",
  card: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20",
  mobile_money: "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/20",
  bank_transfer: "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/20",
  gift_card: "bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900/20",
  store_credit: "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20",
};

export function MultiPaymentDialog({
  open,
  onOpenChange,
  totalAmount = 0,
  onConfirm,
  currency = "USD",
  enabledMethods = ["cash", "card", "mobile_money"],
}) {
  const { toast } = useToast();
  const { settings } = useSettingsStore();
  const {
    getPaymentMethodConfig,
    formatCurrency,
    splitPayment,
    getCurrencyConfig,
  } = useFinanceStore();

  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("split");
  const [newPaymentMethod, setNewPaymentMethod] = useState("cash");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [showCashBreakdown, setShowCashBreakdown] = useState(false);
  const [selectedCashPayment, setSelectedCashPayment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");

  const currencyConfig = getCurrencyConfig(currency);
  const paymentSplit = splitPayment(totalAmount, payments);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPayments([]);
      setNewPaymentAmount("");
      setPaymentReference("");
    }
  }, [open]);

  const addPayment = () => {
    const amount = parseFloat(newPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (paymentSplit.remaining < amount) {
      toast({
        title: "Amount Too Large",
        description: `Cannot exceed remaining amount of ${formatCurrency(paymentSplit.remaining, currency)}`,
        variant: "destructive",
      });
      return;
    }

    const newPayment = {
      id: Date.now().toString(),
      method: newPaymentMethod,
      amount,
      reference: paymentReference || undefined,
      timestamp: new Date(),
    };

    setPayments((prev) => [...prev, newPayment]);
    setNewPaymentAmount("");
    setPaymentReference("");

    toast({
      title: "Payment Added",
      description: `${formatCurrency(amount, currency)} via ${getPaymentMethodConfig(newPaymentMethod)?.name}`,
    });
  };

  const removePayment = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);
    toast({
      title: "Payment Removed",
      description: "Payment method has been removed from the split",
    });
  };

  const updatePaymentAmount = (id, newAmount) => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) return;

    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, amount } : p))
    );
  };

  const handleCashBreakdown = (paymentId) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    setSelectedCashPayment(payment);
    setShowCashBreakdown(true);
  };

  const confirmCashBreakdown = (breakdownData) => {
    if (!selectedCashPayment) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedCashPayment.id
          ? {
              ...p,
              breakdown: breakdownData.breakdown,
              actualAmount: breakdownData.total,
              breakdownStats: breakdownData.stats,
            }
          : p
      )
    );

    setSelectedCashPayment(null);
    toast({
      title: "Cash Breakdown Updated",
      description: `Breakdown saved for ${formatCurrency(breakdownData.total, currency)}`,
    });
  };

  const quickSplit = (method) => {
    switch (method) {
      case "equal":
        const equalAmount = totalAmount / 2;
        setPayments([
          {
            id: "1",
            method: "cash",
            amount: equalAmount,
            timestamp: new Date(),
          },
          {
            id: "2",
            method: "card",
            amount: equalAmount,
            timestamp: new Date(),
          },
        ]);
        break;
      case "cash_first":
        const cashAmount = Math.min(totalAmount, 100);
        setPayments([
          {
            id: "1",
            method: "cash",
            amount: cashAmount,
            timestamp: new Date(),
          },
          {
            id: "2",
            method: "card",
            amount: totalAmount - cashAmount,
            timestamp: new Date(),
          },
        ]);
        break;
      case "card_primary":
        const cardAmount = totalAmount * 0.8;
        setPayments([
          {
            id: "1",
            method: "card",
            amount: cardAmount,
            timestamp: new Date(),
          },
          {
            id: "2",
            method: "cash",
            amount: totalAmount - cardAmount,
            timestamp: new Date(),
          },
        ]);
        break;
    }
    setActiveTab("split");
  };

  const handleConfirm = () => {
    if (payments.length === 0) {
      toast({
        title: "No Payments Added",
        description: "Please add at least one payment method",
        variant: "destructive",
      });
      return;
    }

    if (!paymentSplit.isComplete) {
      toast({
        title: "Incomplete Payment",
        description: `${formatCurrency(paymentSplit.remaining, currency)} remaining to be paid`,
        variant: "destructive",
      });
      return;
    }

    // Validate cash payments have breakdown if required
    const cashPayments = payments.filter((p) => p.method === "cash");
    const invalidCash = cashPayments.find((p) => !p.breakdown && p.amount > 0);

    if (invalidCash) {
      toast({
        title: "Cash Breakdown Required",
        description: "Please provide cash breakdown for all cash payments",
        variant: "destructive",
      });
      return;
    }

    onConfirm?.({
      payments,
      totalAmount,
      currency,
      split: paymentSplit,
    });
  };

  const PaymentMethodCard = ({ method, config }) => {
    const Icon = PAYMENT_METHOD_ICONS[method] || Wallet;
    const isEnabled = enabledMethods.includes(method);

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          newPaymentMethod === method ? 'ring-2 ring-primary' : ''
        } ${!isEnabled ? 'opacity-50' : ''}`}
        onClick={() => isEnabled && setNewPaymentMethod(method)}
      >
        <CardContent className="p-3 text-center">
          <Icon className="h-6 w-6 mx-auto mb-2" />
          <div className="text-sm font-medium">{config?.name || method}</div>
        </CardContent>
      </Card>
    );
  };

  const PaymentItem = ({ payment }) => {
    const config = getPaymentMethodConfig(payment.method);
    const Icon = PAYMENT_METHOD_ICONS[payment.method] || Wallet;
    const colorClass = PAYMENT_METHOD_COLORS[payment.method] || "bg-gray-100 border-gray-300";

    return (
      <Card className={`border-2 ${colorClass}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{config?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(payment.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm w-16">Amount:</Label>
              <Input
                type="number"
                step="0.01"
                value={payment.amount}
                onChange={(e) => updatePaymentAmount(payment.id, e.target.value)}
                className="flex-1 h-8"
              />
            </div>

            {payment.reference && (
              <div className="flex items-center gap-2">
                <Label className="text-sm w-16">Ref:</Label>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {payment.reference}
                </span>
              </div>
            )}

            {payment.method === "cash" && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCashBreakdown(payment.id)}
                  className="w-full gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  {payment.breakdown ? "Update" : "Add"} Cash Breakdown
                </Button>
                {payment.breakdown && (
                  <div className="text-xs text-muted-foreground">
                    Breakdown: {payment.breakdownStats?.totalPieces} pieces
                    ({payment.breakdownStats?.bills.count} bills, {payment.breakdownStats?.coins.count} coins)
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Percentage:</span>
              <span className="font-medium">{payment.percentage?.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Split className="h-5 w-5" />
              Multi-Payment Processing
            </DialogTitle>
            <DialogDescription>
              Split the payment across multiple methods
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quick">Quick Split</TabsTrigger>
                  <TabsTrigger value="split">Payment Split</TabsTrigger>
                </TabsList>

                <TabsContent value="quick" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-2"
                      onClick={() => quickSplit("equal")}
                    >
                      <PieChart className="h-5 w-5" />
                      <span className="text-xs">50/50 Split</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-2"
                      onClick={() => quickSplit("cash_first")}
                    >
                      <Banknote className="h-5 w-5" />
                      <span className="text-xs">Cash + Card</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-2"
                      onClick={() => quickSplit("card_primary")}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="text-xs">Card Primary</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="split" className="space-y-4">
                  {/* Add payment section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Add Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Payment method selection */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {enabledMethods.map((method) => (
                          <PaymentMethodCard
                            key={method}
                            method={method}
                            config={getPaymentMethodConfig(method)}
                          />
                        ))}
                      </div>

                      {/* Amount input */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter amount"
                            value={newPaymentAmount}
                            onChange={(e) => setNewPaymentAmount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reference (Optional)</Label>
                          <Input
                            placeholder="Transaction reference"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={addPayment}
                        disabled={!newPaymentAmount || parseFloat(newPaymentAmount) <= 0}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Payment
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Payment list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Payment Methods</h3>
                      <Badge variant="secondary">{payments.length} methods</Badge>
                    </div>

                    {payments.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          <Split className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No payment methods added yet</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <ScrollArea className="h-80">
                        <div className="space-y-3">
                          {payments.map((payment) => (
                            <PaymentItem key={payment.id} payment={payment} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Summary sidebar */}
            <div className="space-y-4">
              {/* Total amount */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Transaction Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(totalAmount, currency)}
                  </div>
                </CardContent>
              </Card>

              {/* Payment summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Paid:</span>
                    <span className="font-medium">
                      {formatCurrency(paymentSplit.totalPaid, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span
                      className={`font-medium ${
                        paymentSplit.remaining > 0.01 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {formatCurrency(paymentSplit.remaining, currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    {paymentSplit.isComplete ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Complete</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600 font-medium">Incomplete</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment breakdown */}
              {payments.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {payments.map((payment) => {
                          const config = getPaymentMethodConfig(payment.method);
                          const Icon = PAYMENT_METHOD_ICONS[payment.method];
                          return (
                            <div key={payment.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Icon className="h-3 w-3" />
                                <span>{config?.name}</span>
                              </div>
                              <div className="text-right">
                                <div>{formatCurrency(payment.amount, currency)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {payment.percentage?.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!paymentSplit.isComplete}
              className="gap-2"
            >
              <Receipt className="h-4 w-4" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cash breakdown dialog */}
      <CashBreakdownDialog
        open={showCashBreakdown}
        onOpenChange={setShowCashBreakdown}
        expectedAmount={selectedCashPayment?.amount || 0}
        onConfirm={confirmCashBreakdown}
        currency={currency}
        title="Cash Payment Breakdown"
        description="Enter the cash denomination breakdown for this payment"
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method from the split?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => removePayment(showDeleteConfirm)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
