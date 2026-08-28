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
  Banknote,
  Coins,
  Calculator,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useFinanceStore } from "@/lib/finance-store";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useToast } from "@/hooks/use-toast";

export function CashBreakdownDialog({
  open,
  onOpenChange,
  expectedAmount = 0,
  onConfirm,
  title = "Cash Breakdown",
  description = "Count your cash and enter the breakdown",
  mode = "count", // 'count' or 'change'
}) {
  const { toast } = useToast();
  const { settings } = useSettingsStore();
  const { currency } = usePOSStore();
  const {
    getDenominations,
    calculateCashTotal,
    getDefaultDenominations,
    validateCashBreakdown,
    getDenominationStats,
    calculateOptimalChange,
    getCurrencyConfig,
    formatCurrency,
  } = useFinanceStore();

  const currentCurrency = currency || settings.currency || "USD";
  const denominations = getDenominations(currentCurrency);
  const currencyConfig = getCurrencyConfig(currentCurrency);

  const [breakdown, setBreakdown] = useState(() =>
    getDefaultDenominations(currentCurrency),
  );
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [quickAmount, setQuickAmount] = useState("");
  const [activeTab, setActiveTab] = useState("breakdown");

  // Calculate totals and validation
  const calculatedTotal = calculateCashTotal(breakdown);
  const validation = validateCashBreakdown(
    breakdown,
    expectedAmount,
    selectedCurrency,
  );
  const stats = getDenominationStats(breakdown, selectedCurrency);

  // Reset breakdown when currency changes
  useEffect(() => {
    if (selectedCurrency !== currentCurrency) {
      setBreakdown(getDefaultDenominations(selectedCurrency));
    }
  }, [selectedCurrency, getDefaultDenominations]);

  // Auto-calculate optimal breakdown for change mode
  useEffect(() => {
    if (mode === "change" && expectedAmount > 0) {
      const optimal = calculateOptimalChange(expectedAmount, selectedCurrency);
      setBreakdown(optimal);
    }
  }, [mode, expectedAmount, selectedCurrency, calculateOptimalChange]);

  const handleDenominationChange = (value, count) => {
    const numCount = Math.max(0, parseInt(count) || 0);
    setBreakdown((prev) => ({
      ...prev,
      [value]: numCount,
    }));
  };

  const handleQuickAmount = () => {
    const amount = parseFloat(quickAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const optimal = calculateOptimalChange(amount, selectedCurrency);
    setBreakdown(optimal);
    setQuickAmount("");
    setActiveTab("breakdown");
  };

  const handleReset = () => {
    setBreakdown(getDefaultDenominations(selectedCurrency));
    setQuickAmount("");
  };

  const handleConfirm = () => {
    if (!validation.isValid && mode === "count") {
      toast({
        title: "Amount Mismatch",
        description: `Expected: ${formatCurrency(
          expectedAmount,
          selectedCurrency,
        )}, Got: ${formatCurrency(calculatedTotal, selectedCurrency)}`,
        variant: "destructive",
      });
      return;
    }

    onConfirm?.({
      breakdown,
      total: calculatedTotal,
      currency: selectedCurrency,
      stats,
      validation,
    });
    onOpenChange(false);
  };

  // Group denominations by type
  const billDenoms = denominations.filter((d) => d.type === "bill");
  const coinDenoms = denominations.filter((d) => d.type === "coin");

  // Color mapping for visual distinction
  const getColorClass = (color) => {
    const colorMap = {
      green: "bg-green-100 border-green-300 dark:bg-green-900/20",
      blue: "bg-blue-100 border-blue-300 dark:bg-blue-900/20",
      red: "bg-red-100 border-red-300 dark:bg-red-900/20",
      purple: "bg-purple-100 border-purple-300 dark:bg-purple-900/20",
      orange: "bg-orange-100 border-orange-300 dark:bg-orange-900/20",
      yellow: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20",
      gold: "bg-yellow-200 border-yellow-400 dark:bg-yellow-800/20",
      silver: "bg-gray-100 border-gray-300 dark:bg-gray-800/20",
      copper: "bg-orange-200 border-orange-400 dark:bg-orange-800/20",
      brown: "bg-amber-100 border-amber-300 dark:bg-amber-900/20",
      pink: "bg-pink-100 border-pink-300 dark:bg-pink-900/20",
    };
    return colorMap[color] || "bg-gray-100 border-gray-300 dark:bg-gray-800/20";
  };

  const DenominationCard = ({ denom }) => (
    <Card
      key={denom.value}
      className={`${getColorClass(denom.color)} border-2 transition-all hover:shadow-md`}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">{denom.label}</Label>
          {denom.type === "bill" ? (
            <Banknote className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Coins className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Input
          type="number"
          min="0"
          inputMode="numeric"
          value={breakdown[denom.value.toString()] || ""}
          onChange={(e) =>
            handleDenominationChange(denom.value.toString(), e.target.value)
          }
          placeholder="0"
          className="h-8 text-center font-mono"
        />
        <div className="text-xs text-center text-muted-foreground">
          {formatCurrency(
            denom.value * (parseInt(breakdown[denom.value.toString()]) || 0),
            selectedCurrency,
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4">
          {/* Main breakdown area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Currency selector and quick actions */}
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(getDenominations()).map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="breakdown">Manual Count</TabsTrigger>
                <TabsTrigger value="quick">Quick Calculate</TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown" className="space-y-4">
                <ScrollArea className="h-96">
                  {billDenoms.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-sm">Bills</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {billDenoms.map((denom) => (
                          <DenominationCard key={denom.value} denom={denom} />
                        ))}
                      </div>
                    </div>
                  )}

                  {coinDenoms.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-amber-600" />
                        <h4 className="font-semibold text-sm">Coins</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {coinDenoms.map((denom) => (
                          <DenominationCard key={denom.value} denom={denom} />
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="quick" className="space-y-4">
                <div className="space-y-3">
                  <Label>Enter amount to calculate breakdown</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleQuickAmount} className="gap-2">
                      <Zap className="h-4 w-4" />
                      Calculate
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This will calculate the optimal denomination breakdown for
                    the entered amount.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            {/* Total amount card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedTotal, selectedCurrency)}
                </div>
                {expectedAmount > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Expected:</span>
                      <span>
                        {formatCurrency(expectedAmount, selectedCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Difference:</span>
                      <span
                        className={
                          validation.difference > 0.01
                            ? "text-red-600"
                            : validation.difference < -0.01
                              ? "text-green-600"
                              : "text-muted-foreground"
                        }
                      >
                        {validation.difference > 0
                          ? "+"
                          : ""}
                        {formatCurrency(validation.difference, selectedCurrency)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Amount matches
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        Amount mismatch
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Breakdown Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total pieces:</span>
                  <Badge variant="secondary">{stats.totalPieces}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Bills:</span>
                  <div className="text-right">
                    <div>{stats.bills.count} pcs</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(stats.bills.value, selectedCurrency)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Coins:</span>
                  <div className="text-right">
                    <div>{stats.coins.count} pcs</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(stats.coins.value, selectedCurrency)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mode === "count" && !validation.isValid}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm {mode === "change" ? "Change" : "Count"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
