"use client";
import { useState, useEffect } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Globe,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Calculator,
  AlertCircle,
  CheckCircle,
  Settings,
  Star,
  Clock,
} from "lucide-react";
import { useFinanceStore } from "@/lib/finance-store";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useToast } from "@/hooks/use-toast";

// Mock exchange rates - in a real app, you'd fetch these from an API
const MOCK_EXCHANGE_RATES = {
  USD: { EUR: 0.85, GBP: 0.73, KES: 150.25, CAD: 1.35, AUD: 1.52, JPY: 149.50, INR: 83.12 },
  EUR: { USD: 1.18, GBP: 0.86, KES: 177.35, CAD: 1.59, AUD: 1.79, JPY: 176.20, INR: 97.90 },
  GBP: { USD: 1.37, EUR: 1.16, KES: 206.15, CAD: 1.85, AUD: 2.08, JPY: 204.85, INR: 113.87 },
  KES: { USD: 0.0067, EUR: 0.0056, GBP: 0.0048, CAD: 0.009, AUD: 0.010, JPY: 0.99, INR: 0.55 },
  CAD: { USD: 0.74, EUR: 0.63, GBP: 0.54, KES: 111.30, AUD: 1.13, JPY: 110.74, INR: 61.57 },
  AUD: { USD: 0.66, EUR: 0.56, GBP: 0.48, KES: 98.85, CAD: 0.89, JPY: 98.36, INR: 54.68 },
  JPY: { USD: 0.0067, EUR: 0.0057, GBP: 0.0049, KES: 1.01, CAD: 0.009, AUD: 0.010, INR: 0.56 },
  INR: { USD: 0.012, EUR: 0.010, GBP: 0.0088, KES: 1.82, CAD: 0.016, AUD: 0.018, JPY: 1.80 },
};

export function CurrencySelector({
  value,
  onChange,
  compact = false,
  showExchangeRates = true,
  showFavorites = true
}) {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettingsStore();
  const { currency, setCurrency } = usePOSStore();
  const {
    getSupportedCurrencies,
    getCurrencyConfig,
    formatCurrency
  } = useFinanceStore();

  const [open, setOpen] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(MOCK_EXCHANGE_RATES);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState(settings.favoriteCurrencies || ['USD', 'EUR']);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [conversionAmount, setConversionAmount] = useState("100");

  const supportedCurrencies = getSupportedCurrencies();
  const currentCurrency = value || currency || settings.currency || "USD";
  const currentConfig = getCurrencyConfig(currentCurrency);

  // Simulate fetching exchange rates
  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you'd fetch from an API like:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();

      setExchangeRates(MOCK_EXCHANGE_RATES);
      setLastUpdated(new Date());

      if (showExchangeRates) {
        toast({
          title: "Exchange Rates Updated",
          description: "Latest rates have been fetched successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Update Rates",
        description: "Could not fetch latest exchange rates. Using cached rates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-update exchange rates
  useEffect(() => {
    if (autoUpdate && showExchangeRates) {
      const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoUpdate, showExchangeRates]);

  const handleCurrencyChange = (newCurrency) => {
    if (onChange) {
      onChange(newCurrency);
    } else {
      setCurrency(newCurrency);
      updateSettings({ currency: newCurrency });
    }
    setOpen(false);

    toast({
      title: "Currency Changed",
      description: `Switched to ${getCurrencyConfig(newCurrency).name} (${newCurrency})`,
    });
  };

  const toggleFavorite = (currencyCode) => {
    const newFavorites = favorites.includes(currencyCode)
      ? favorites.filter(c => c !== currencyCode)
      : [...favorites, currencyCode];

    setFavorites(newFavorites);
    updateSettings({ favoriteCurrencies: newFavorites });
  };

  const getExchangeRate = (from, to) => {
    if (from === to) return 1;
    return exchangeRates[from]?.[to] || 0;
  };

  const formatExchangeRate = (rate, precision = 4) => {
    if (rate >= 1) return rate.toFixed(2);
    return rate.toFixed(precision);
  };

  const CurrencyCard = ({ currencyCode, config, isSelected, isFavorite }) => (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => handleCurrencyChange(currencyCode)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold">{config.symbol}</span>
            </div>
            <div>
              <div className="font-semibold">{currencyCode}</div>
              <div className="text-xs text-muted-foreground truncate max-w-20">
                {config.name}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {showFavorites && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currencyCode);
                }}
              >
                <Star
                  className={`h-3 w-3 ${
                    isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                />
              </Button>
            )}
            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
          </div>
        </div>

        {showExchangeRates && currencyCode !== currentCurrency && (
          <div className="text-xs text-muted-foreground">
            1 {currentCurrency} = {formatExchangeRate(getExchangeRate(currentCurrency, currencyCode))} {currencyCode}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Globe className="h-4 w-4" />
            {currentCurrency}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Currency</h4>
              {showExchangeRates && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchExchangeRates}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <ScrollArea className="h-64">
              <div className="grid gap-2">
                {supportedCurrencies.map((curr) => (
                  <div
                    key={curr.code}
                    className={`p-2 rounded cursor-pointer hover:bg-accent ${
                      curr.code === currentCurrency ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleCurrencyChange(curr.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{curr.symbol}</span>
                        <span className="text-sm">{curr.code}</span>
                      </div>
                      {curr.code === currentCurrency && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {showExchangeRates && curr.code !== currentCurrency && (
                      <div className="text-xs text-muted-foreground mt-1">
                        1 {currentCurrency} = {formatExchangeRate(getExchangeRate(currentCurrency, curr.code))} {curr.code}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Globe className="h-4 w-4" />
          {currentConfig.symbol} {currentCurrency}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Currency Selection
          </DialogTitle>
          <DialogDescription>
            Choose your preferred currency for transactions and pricing
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-4">
          {/* Currency grid */}
          <div className="lg:col-span-3 space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Available Currencies</h3>
                <Badge variant="secondary">{supportedCurrencies.length}</Badge>
              </div>

              <div className="flex items-center gap-2">
                {showExchangeRates && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchExchangeRates}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Update Rates
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Show exchange rates</Label>
                    <Switch
                      checked={showExchangeRates}
                      onCheckedChange={setShowExchangeRates}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-update rates</Label>
                    <Switch
                      checked={autoUpdate}
                      onCheckedChange={setAutoUpdate}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Favorites section */}
            {showFavorites && favorites.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-medium text-sm">Favorites</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {favorites.map((currCode) => {
                    const config = getCurrencyConfig(currCode);
                    return (
                      <CurrencyCard
                        key={currCode}
                        currencyCode={currCode}
                        config={config}
                        isSelected={currCode === currentCurrency}
                        isFavorite={true}
                      />
                    );
                  })}
                </div>
                <Separator />
              </div>
            )}

            {/* All currencies */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">All Currencies</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {supportedCurrencies.map((curr) => (
                  <CurrencyCard
                    key={curr.code}
                    currencyCode={curr.code}
                    config={curr}
                    isSelected={curr.code === currentCurrency}
                    isFavorite={favorites.includes(curr.code)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current currency info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Currency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{currentConfig.symbol}</div>
                    <div className="text-lg font-semibold">{currentCurrency}</div>
                    <div className="text-sm text-muted-foreground">{currentConfig.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exchange rate info */}
            {showExchangeRates && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Exchange Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {Object.entries(exchangeRates[currentCurrency] || {})
                        .slice(0, 5)
                        .map(([toCurrency, rate]) => (
                          <div key={toCurrency} className="flex justify-between text-xs">
                            <span>1 {currentCurrency} =</span>
                            <span>{formatExchangeRate(rate)} {toCurrency}</span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Quick converter */}
            {showExchangeRates && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Quick Convert
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Amount in {currentCurrency}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={conversionAmount}
                      onChange={(e) => setConversionAmount(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <ScrollArea className="h-24">
                    <div className="space-y-1">
                      {Object.entries(exchangeRates[currentCurrency] || {})
                        .slice(0, 3)
                        .map(([toCurrency, rate]) => {
                          const converted = parseFloat(conversionAmount || "0") * rate;
                          return (
                            <div key={toCurrency} className="text-xs">
                              <strong>{formatCurrency(converted, toCurrency)}</strong>
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CurrencyDisplay({ amount, currency, showSymbol = true, className = "" }) {
  const { formatCurrency } = useFinanceStore();

  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
    </span>
  );
}

export function ExchangeRateDisplay({ fromCurrency, toCurrency, rate, className = "" }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Badge variant="outline">{fromCurrency}</Badge>
      <TrendingUp className="h-3 w-3 text-muted-foreground" />
      <Badge variant="outline">{toCurrency}</Badge>
      <span className="font-mono">{rate.toFixed(4)}</span>
    </div>
  );
}
