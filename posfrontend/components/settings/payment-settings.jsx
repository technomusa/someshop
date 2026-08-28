"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/lib/settings-store";
import { Banknote, CreditCard, Smartphone, Wallet } from "lucide-react";
const iconMap = {
  banknote: Banknote,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  wallet: Wallet
};
export function PaymentSettings() {
  const { paymentMethods, togglePaymentMethod } = useSettingsStore();
  return <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Enable or disable payment options at checkout</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((method) => {
    const Icon = iconMap[method.icon] || Wallet;
    return <div key={method.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{method.type} payment</p>
                  </div>
                </div>
                <Switch checked={method.isEnabled} onCheckedChange={() => togglePaymentMethod(method.id)} />
              </div>;
  })}
        </div>
      </CardContent>
    </Card>;
}
