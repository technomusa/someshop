"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Globe,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Settings,
  Star,
  Clock,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import { useFinanceStore } from "@/lib/finance-store";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useToast } from "@/hooks/use-toast";

export function CurrencySettings() {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettingsStore();
  const { currency, setCurrency } = usePOSStore();
  const {
    getSupportedCurrencies,
    getCurrencyConfig,
    formatCurrency,
  } = useFinanceStore();

  const [primaryCurrency, setPrimaryCurrency] = useState(
    settings.currency || currency || "USD"
  );
  const [acceptedCurrencies, setAcceptedCurrencies] = useState(
    settings.acceptedCurrencies || [primaryCurrency]
  );
  const [exchangeRateSettings, setExchangeRateSettings] = useState({
    autoUpdate: settings.autoUpdateRates || true,
    updateInterval: settings.rateUpdateInterval || 60, // minutes
    provider: settings.exchangeRateProvider || "mock",
    ...settings.exchangeRateSettings,
  });
  const [customRates, setCustomRates] = useState(settings.customExchangeRates || {});
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [showRateEditor, setShowRateEditor] = useState(null);
  const [newRate, setNewRate] = useState("");

  const supportedCurrencies = getSupportedCurrencies();
  const availableCurrencies = supportedCurrencies.filter(
    (curr) => !acceptedCurrencies.includes(curr.code)
  );

  useEffect(() => {
    // Save settings when they change
    updateSettings({
      currency: primaryCurrency,
      acceptedCurrencies,
      autoUpdateRates: exchangeRateSettings.autoUpdate,
      rateUpdateInterval: exchangeRateSettings.updateInterval,
      exchangeRateProvider: exchangeRateSettings.provider,
      exchangeRateSettings,
      customExchangeRates: customRates,
    });
  }, [primaryCurrency, acceptedCurrencies, exchangeRateSettings, customRates]);

  const handlePrimaryCurrencyChange = (newCurrency) => {
    setPrimaryCurrency(newCurrency);
    setCurrency(newCurrency);

    // Add to accepted currencies if not already there
    if (!acceptedCurrencies.includes(newCurrency)) {
      setAcceptedCurrencies((prev) => [newCurrency, ...prev]);
    } else {
      // Move to front
      setAcceptedCurrencies((prev) => [
        newCurrency,
        ...prev.filter((c) => c !== newCurrency),
      ]);
    }

    toast({
      title: "Primary Currency Updated",
      description: `Changed to ${getCurrencyConfig(newCurrency).name}`,
    });
  };

  const addAcceptedCurrency = (currencyCode) => {
    if (!acceptedCurrencies.includes(currencyCode)) {
      setAcceptedCurrencies((prev) => [...prev, currencyCode]);
      toast({
        title: "Currency Added",
        description: `${getCurrencyConfig(currencyCode).name} added to accepted currencies`,
      });
    }
    setShowAddCurrency(false);
  };

  const removeAcceptedCurrency = (currencyCode) => {
    if (currencyCode === primaryCurrency) {
      toast({
        title: "Cannot Remove Primary Currency",
        description: "Change the primary currency first before removing it",
        variant: "destructive",
      });
      return;
    }

    setAcceptedCurrencies((prev) => prev.filter((c) => c !== currencyCode));
    // Remove custom rate if exists
    setCustomRates((prev) => {
      const updated = { ...prev };
      delete updated[currencyCode];
      return updated;
    });

    toast({
      title: "Currency Removed",
      description: `${getCurrencyConfig(currencyCode).name} removed from accepted currencies`,
    });
  };

  const updateCustomRate = (currencyCode, rate) => {
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Exchange rate must be a positive number",
        variant: "destructive",
      });
      return;
    }

    setCustomRates((prev) => ({
      ...prev,
      [currencyCode]: numericRate,
    }));

    setShowRateEditor(null);
    setNewRate("");

    toast({
      title: "Exchange Rate Updated",
      description: `1 ${primaryCurrency} = ${rate} ${currencyCode}`,
    });
  };

  const resetToDefaultRates = () => {
    setCustomRates({});
    toast({
      title: "Rates Reset",
      description: "All custom exchange rates have been cleared",
    });
  };

  const CurrencyCard = ({ currencyCode, isPrimary = false, canRemove = true }) => {
    const config = getCurrencyConfig(currencyCode);
    const customRate = customRates[currencyCode];
    const hasCustomRate = customRate !== undefined;

    return (
      <Card className={isPrimary ? "border-primary ring-1 ring-primary/20" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-lg">{config.symbol}</span>
              </div>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {currencyCode}
                  {isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">{config.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isPrimary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePrimaryCurrencyChange(currencyCode)}
                  className="text-xs"
                >
                  Make Primary
                </Button>
              )}
              {canRemove && !isPrimary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAcceptedCurrency(currencyCode)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {!isPrimary && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exchange Rate:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">
                    1 {primaryCurrency} = {customRate?.toFixed(4) || "Auto"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowRateEditor(currencyCode);
                      setNewRate(customRate?.toString() || "");
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {hasCustomRate && (
                <Badge variant="outline" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Custom Rate
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Currency Settings</h2>
          <p className="text-muted-foreground">
            Manage currencies and exchange rates for your POS system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Globe className="h-3 w-3" />
            {acceptedCurrencies.length} currencies
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="currencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
          <TabsTrigger value="settings">Rate Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="currencies" className="space-y-4">
          {/* Primary Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Primary Currency
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The main currency used for pricing and reporting
              </p>
            </CardHeader>
            <CardContent>
              <Select value={primaryCurrency} onValueChange={handlePrimaryCurrencyChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{curr.symbol}</span>
                        <span>{curr.code}</span>
                        <span className="text-muted-foreground">- {curr.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Accepted Currencies */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accepted Currencies</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Currencies accepted for payments
                  </p>
                </div>
                <Dialog open={showAddCurrency} onOpenChange={setShowAddCurrency}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Currency
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Currency</DialogTitle>
                      <DialogDescription>
                        Select a currency to add to your accepted currencies
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-64">
                      <div className="grid gap-2">
                        {availableCurrencies.map((curr) => (
                          <Button
                            key={curr.code}
                            variant="ghost"
                            className="justify-start h-auto p-3"
                            onClick={() => addAcceptedCurrency(curr.code)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-bold">{curr.symbol}</span>
                              </div>
                              <div className="text-left">
                                <div className="font-medium">{curr.code}</div>
                                <div className="text-sm text-muted-foreground">
                                  {curr.name}
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {acceptedCurrencies.map((currCode) => (
                  <CurrencyCard
                    key={currCode}
                    currencyCode={currCode}
                    isPrimary={currCode === primaryCurrency}
                    canRemove={acceptedCurrencies.length > 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Exchange Rates
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Base currency: {getCurrencyConfig(primaryCurrency).name} ({primaryCurrency})
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaultRates}
                  disabled={Object.keys(customRates).length === 0}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset to Auto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {acceptedCurrencies
                  .filter((curr) => curr !== primaryCurrency)
                  .map((currCode) => {
                    const config = getCurrencyConfig(currCode);
                    const customRate = customRates[currCode];
                    const hasCustomRate = customRate !== undefined;

                    return (
                      <div
                        key={currCode}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-bold text-sm">{config.symbol}</span>
                          </div>
                          <div>
                            <div className="font-medium">{currCode}</div>
                            <div className="text-sm text-muted-foreground">
                              {config.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-mono">
                              1 {primaryCurrency} = {customRate?.toFixed(4) || "Auto"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {hasCustomRate ? "Custom rate" : "Auto-updated"}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowRateEditor(currCode);
                              setNewRate(customRate?.toString() || "");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                {acceptedCurrencies.filter((curr) => curr !== primaryCurrency).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No secondary currencies configured</p>
                    <p className="text-sm">Add currencies to see exchange rates</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Rate Update Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-update exchange rates</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically fetch latest rates from provider
                  </p>
                </div>
                <Switch
                  checked={exchangeRateSettings.autoUpdate}
                  onCheckedChange={(checked) =>
                    setExchangeRateSettings((prev) => ({
                      ...prev,
                      autoUpdate: checked,
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Update interval (minutes)</Label>
                  <Select
                    value={exchangeRateSettings.updateInterval.toString()}
                    onValueChange={(value) =>
                      setExchangeRateSettings((prev) => ({
                        ...prev,
                        updateInterval: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="1440">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rate provider</Label>
                  <Select
                    value={exchangeRateSettings.provider}
                    onValueChange={(value) =>
                      setExchangeRateSettings((prev) => ({
                        ...prev,
                        provider: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mock">Mock Data (Demo)</SelectItem>
                      <SelectItem value="ecb">European Central Bank</SelectItem>
                      <SelectItem value="fixer">Fixer.io</SelectItem>
                      <SelectItem value="exchangerate">ExchangeRate-API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p>Custom exchange rates override auto-updated rates.</p>
                    <p>Use "Reset to Auto" to clear custom rates and resume automatic updates.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rate Editor Dialog */}
      <Dialog open={!!showRateEditor} onOpenChange={() => setShowRateEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exchange Rate</DialogTitle>
            <DialogDescription>
              Set custom exchange rate for {showRateEditor && getCurrencyConfig(showRateEditor).name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Exchange Rate</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">1 {primaryCurrency} =</span>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Enter rate"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm font-medium">{showRateEditor}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              This will override the auto-updated rate for {showRateEditor}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateEditor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateCustomRate(showRateEditor, newRate)}
              disabled={!newRate || parseFloat(newRate) <= 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
