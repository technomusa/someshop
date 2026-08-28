"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/lib/settings-store";
import { Store, Save } from "lucide-react";
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\xA3", name: "British Pound" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "NGN", symbol: "\u20A6", name: "Nigerian Naira" },
  { code: "ZAR", symbol: "R", name: "South African Rand" }
];
export function StoreSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2e3);
  };
  const handleCurrencyChange = (code) => {
    const currency = currencies.find((c) => c.code === code);
    if (currency) {
      setLocalSettings({
        ...localSettings,
        currency: currency.code,
        currencySymbol: currency.symbol
      });
    }
  };
  return <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
            Store Information
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-sm">
                Store Name
              </Label>
              <Input
    id="storeName"
    value={localSettings.storeName}
    onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
  />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone" className="text-sm">
                Phone Number
              </Label>
              <Input
    id="storePhone"
    value={localSettings.storePhone}
    onChange={(e) => setLocalSettings({ ...localSettings, storePhone: e.target.value })}
  />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeAddress" className="text-sm">
              Address
            </Label>
            <Input
    id="storeAddress"
    value={localSettings.storeAddress}
    onChange={(e) => setLocalSettings({ ...localSettings, storeAddress: e.target.value })}
  />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeEmail" className="text-sm">
              Email
            </Label>
            <Input
    id="storeEmail"
    type="email"
    value={localSettings.storeEmail}
    onChange={(e) => setLocalSettings({ ...localSettings, storeEmail: e.target.value })}
  />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Tax & Currency</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Configure tax rates and currency</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm">
                Currency
              </Label>
              <Select value={localSettings.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c.code} value={c.code}>
                      {c.symbol} - {c.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate" className="text-sm">
                Tax Rate (%)
              </Label>
              <Input
    id="taxRate"
    type="number"
    min="0"
    max="100"
    value={localSettings.taxRate}
    onChange={(e) => setLocalSettings({
      ...localSettings,
      taxRate: Number.parseFloat(e.target.value) || 0
    })}
  />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lowStock" className="text-sm">
              Low Stock Threshold
            </Label>
            <Input
    id="lowStock"
    type="number"
    min="1"
    value={localSettings.lowStockThreshold}
    onChange={(e) => setLocalSettings({
      ...localSettings,
      lowStockThreshold: Number.parseInt(e.target.value) || 10
    })}
  />
            <p className="text-xs text-muted-foreground">Products below this quantity will be flagged</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Receipt Settings</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Customize receipt messages</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receiptHeader" className="text-sm">
              Receipt Header
            </Label>
            <Textarea
    id="receiptHeader"
    value={localSettings.receiptHeader}
    onChange={(e) => setLocalSettings({ ...localSettings, receiptHeader: e.target.value })}
    rows={2}
  />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiptFooter" className="text-sm">
              Receipt Footer
            </Label>
            <Textarea
    id="receiptFooter"
    value={localSettings.receiptFooter}
    onChange={(e) => setLocalSettings({ ...localSettings, receiptFooter: e.target.value })}
    rows={2}
  />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Loyalty Program</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Configure customer rewards</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Enable Loyalty</Label>
              <p className="text-xs text-muted-foreground">Customers earn points</p>
            </div>
            <Switch
    checked={localSettings.enableLoyalty}
    onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableLoyalty: checked })}
  />
          </div>
          {localSettings.enableLoyalty && <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pointsPerAmount" className="text-sm">
                  Points per {localSettings.currencySymbol}
                  {localSettings.loyaltyPointsPerAmount}
                </Label>
                <Input
    id="pointsPerAmount"
    type="number"
    min="1"
    value={localSettings.loyaltyAmountPerPoint}
    onChange={(e) => setLocalSettings({
      ...localSettings,
      loyaltyAmountPerPoint: Number.parseInt(e.target.value) || 1
    })}
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPerPoint" className="text-sm">
                  Spend Amount
                </Label>
                <Input
    id="amountPerPoint"
    type="number"
    min="1"
    value={localSettings.loyaltyPointsPerAmount}
    onChange={(e) => setLocalSettings({
      ...localSettings,
      loyaltyPointsPerAmount: Number.parseInt(e.target.value) || 100
    })}
  />
              </div>
            </div>}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>;
}
