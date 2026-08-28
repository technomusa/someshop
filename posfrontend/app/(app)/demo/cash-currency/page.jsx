"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Calculator,
  Split,
  Banknote,
  CreditCard,
  Smartphone,
  TrendingUp,
  DollarSign,
  Coins,
  Receipt,
  Settings,
  RefreshCw,
} from "lucide-react";
import { CashBreakdownDialog } from "@/components/pos/cash-breakdown-dialog";
import { CurrencySelector, CurrencyDisplay } from "@/components/pos/currency-selector";
import { MultiPaymentDialog } from "@/components/pos/multi-payment-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFinanceStore } from "@/lib/finance-store";
import { usePOSStore } from "@/lib/store";

export default function CashCurrencyDemoPage() {
  const { toast } = useToast();
  const {
    formatCurrency,
    getSupportedCurrencies,
    getDenominations,
    calculateOptimalChange,
    getQuickAmounts
  } = useFinanceStore();
  const { currency } = usePOSStore();

  const [showCashBreakdown, setShowCashBreakdown] = useState(false);
  const [showMultiPayment, setShowMultiPayment] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currency || "USD");
  const [demoAmount, setDemoAmount] = useState(125.75);
  const [cashBreakdownResult, setCashBreakdownResult] = useState(null);
  const [multiPaymentResult, setMultiPaymentResult] = useState(null);

  const supportedCurrencies = getSupportedCurrencies();
  const currentDenominations = getDenominations(selectedCurrency);
  const quickAmounts = getQuickAmounts(selectedCurrency);
  const optimalChange = calculateOptimalChange(demoAmount, selectedCurrency);

  const handleCashBreakdownConfirm = (result) => {
    setCashBreakdownResult(result);
    toast({
      title: "Cash Breakdown Completed",
      description: `Total: ${formatCurrency(result.total, selectedCurrency)}`,
    });
  };

  const handleMultiPaymentConfirm = (result) => {
    setMultiPaymentResult(result);
    toast({
      title: "Multi-Payment Completed",
      description: `Split across ${result.payments.length} methods`,
    });
  };

  const DenominationPreview = ({ currency }) => {
    const denoms = getDenominations(currency);
    const bills = denoms.filter(d => d.type === "bill");
    const coins = denoms.filter(d => d.type === "coin");

    return (
      <div className="space-y-4">
        {bills.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-green-600" />
              Bills
            </h4>
            <div className="flex flex-wrap gap-2">
              {bills.map((denom) => (
                <Badge key={denom.value} variant="outline" className="gap-1">
                  {denom.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {coins.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-600" />
              Coins
            </h4>
            <div className="flex flex-wrap gap-2">
              {coins.map((denom) => (
                <Badge key={denom.value} variant="secondary" className="gap-1">
                  {denom.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8" />
          Cash & Currency Demo
        </h1>
        <p className="text-muted-foreground">
          Explore advanced cash breakdown variations, currency switching, and multi-payment features
        </p>
      </div>

      {/* Currency Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Currency Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Currency:</p>
              <p className="text-sm text-muted-foreground">
                Select different currencies to see denomination changes
              </p>
            </div>
            <CurrencySelector
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              showExchangeRates={true}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Available Denominations</h3>
              <DenominationPreview currency={selectedCurrency} />
            </div>
            <div>
              <h3 className="font-medium mb-2">Quick Amounts</h3>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Badge key={amount} variant="outline">
                    <CurrencyDisplay amount={amount} currency={selectedCurrency} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Demo Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Demo Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDemoAmount(Math.random() * 500 + 50)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Formatted Amount</label>
              <div className="text-2xl font-bold text-primary">
                <CurrencyDisplay amount={demoAmount} currency={selectedCurrency} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Actions</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDemoAmount(100)}
                >
                  $100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDemoAmount(250.50)}
                >
                  $250.50
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cash-breakdown" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cash-breakdown">Cash Breakdown</TabsTrigger>
          <TabsTrigger value="multi-payment">Multi-Payment</TabsTrigger>
          <TabsTrigger value="currency-features">Currency Features</TabsTrigger>
        </TabsList>

        <TabsContent value="cash-breakdown" className="space-y-4">
          {/* Cash Breakdown Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cash Breakdown Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Optimal Change Calculation</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Auto-calculated optimal denomination breakdown for{" "}
                      <CurrencyDisplay amount={demoAmount} currency={selectedCurrency} />
                    </p>
                    <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                      {Object.entries(optimalChange).map(([value, count]) => {
                        if (count > 0) {
                          const denom = currentDenominations.find(d => d.value.toString() === value);
                          return (
                            <div key={value} className="flex justify-between text-sm">
                              <span>{denom?.label}:</span>
                              <span className="font-medium">{count} pieces</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowCashBreakdown(true)}
                    className="w-full gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    Open Cash Breakdown Dialog
                  </Button>
                </div>

                <div className="space-y-4">
                  {cashBreakdownResult && (
                    <div>
                      <h3 className="font-medium mb-2">Last Breakdown Result</h3>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Amount:</span>
                          <CurrencyDisplay
                            amount={cashBreakdownResult.total}
                            currency={cashBreakdownResult.currency || selectedCurrency}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Total Pieces: {cashBreakdownResult.stats?.totalPieces}</p>
                          <p>Bills: {cashBreakdownResult.stats?.bills.count} pieces</p>
                          <p>Coins: {cashBreakdownResult.stats?.coins.count} pieces</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multi-payment" className="space-y-4">
          {/* Multi-Payment Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Split className="h-5 w-5" />
                Multi-Payment Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Payment Splitting</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Split payments across multiple methods with cash breakdown support
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        <span>Cash</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Card</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowMultiPayment(true)}
                    className="w-full gap-2"
                  >
                    <Split className="h-4 w-4" />
                    Open Multi-Payment Dialog
                  </Button>
                </div>

                <div className="space-y-4">
                  {multiPaymentResult && (
                    <div>
                      <h3 className="font-medium mb-2">Last Payment Split</h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between font-medium">
                          <span>Total Amount:</span>
                          <CurrencyDisplay
                            amount={multiPaymentResult.totalAmount}
                            currency={multiPaymentResult.currency}
                          />
                        </div>
                        <div className="space-y-2">
                          {multiPaymentResult.payments.map((payment, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="capitalize">{payment.method.replace('_', ' ')}:</span>
                              <CurrencyDisplay
                                amount={payment.amount}
                                currency={multiPaymentResult.currency}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency-features" className="space-y-4">
          {/* Currency Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Currency Features Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportedCurrencies.map((curr) => (
                  <Card key={curr.code} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold">{curr.symbol}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{curr.code}</div>
                        <div className="text-xs text-muted-foreground">{curr.name}</div>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Decimals:</span>
                        <span>{curr.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Denominations:</span>
                        <span>{getDenominations(curr.code).length}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Example: <CurrencyDisplay amount={demoAmount} currency={curr.code} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calculator className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Smart Cash Breakdown</div>
                        <div className="text-sm text-muted-foreground">
                          Automatic optimal denomination calculation
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Split className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Multi-Payment Support</div>
                        <div className="text-sm text-muted-foreground">
                          Split payments across multiple methods
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Multi-Currency</div>
                        <div className="text-sm text-muted-foreground">
                          Support for 8+ currencies with proper formatting
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Exchange Rates</div>
                        <div className="text-sm text-muted-foreground">
                          Real-time currency conversion support
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CashBreakdownDialog
        open={showCashBreakdown}
        onOpenChange={setShowCashBreakdown}
        expectedAmount={demoAmount}
        onConfirm={handleCashBreakdownConfirm}
        currency={selectedCurrency}
        title="Demo Cash Breakdown"
        description="Try counting cash with different denominations"
        mode="count"
      />

      <MultiPaymentDialog
        open={showMultiPayment}
        onOpenChange={setShowMultiPayment}
        totalAmount={demoAmount}
        onConfirm={handleMultiPaymentConfirm}
        currency={selectedCurrency}
        enabledMethods={["cash", "card", "mobile_money", "bank_transfer"]}
      />
    </div>
  );
}
