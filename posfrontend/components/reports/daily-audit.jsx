"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePOSStore } from "@/lib/store";
import { useProductStore } from "@/lib/product-store";
import { Download, Copy, CheckCheck, AlertTriangle, Package, Receipt, TrendingUp, CheckCircle } from "lucide-react";

export function DailyAudit() {
  const { salesHistory = [] } = usePOSStore();
  const { products = [] } = useProductStore();
  const [copied, setCopied] = useState(false);

  const {
    salesTotal,
    transactions,
    avgOrder,
    refunds,
    lowStockCount,
    expiringCount,
    inventoryValue,
    retailValue,
    todaySales
  } = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todays = salesHistory.filter((sale) => sale?.completedAt && new Date(sale.completedAt).toDateString() === todayStr);
    const completed = todays.filter((s) => s.status === "completed");
    const refundsList = todays.filter((s) => s.status === "refunded");
    const salesTotalCalc = completed.reduce((sum, s) => sum + (s?.cart?.total || 0), 0);
    const avgOrderCalc = completed.length > 0 ? salesTotalCalc / completed.length : 0;
    const lowStock = products.filter((p) => (p.stock ?? 0) <= (p.reorderLevel ?? 0));
    const expiring = products.filter((p) => p.expiryDate && new Date(p.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3));
    const inventoryVal = products.reduce((sum, p) => sum + (p.stock ?? 0) * (p.costPrice ?? 0), 0);
    const retailVal = products.reduce((sum, p) => sum + (p.stock ?? 0) * (p.basePrice ?? 0), 0);
    return {
      salesTotal: salesTotalCalc,
      transactions: completed.length,
      avgOrder: avgOrderCalc,
      refunds: refundsList.length,
      lowStockCount: lowStock.length,
      expiringCount: expiring.length,
      inventoryValue: inventoryVal,
      retailValue: retailVal,
      todaySales: completed
    };
  }, [salesHistory, products]);

  const summaryText = `Daily audit:
- Sales: $${salesTotal.toFixed(2)} across ${transactions} transactions (avg $${avgOrder.toFixed(2)})
- Refunds: ${refunds}
- Low stock: ${lowStockCount}, Expiring soon: ${expiringCount}
- Inventory value: $${inventoryValue.toFixed(2)} (retail $${retailValue.toFixed(2)})`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Sales Total", salesTotal.toFixed(2)],
      ["Transactions", transactions],
      ["Avg Order", avgOrder.toFixed(2)],
      ["Refunds", refunds],
      ["Low Stock", lowStockCount],
      ["Expiring Soon", expiringCount],
      ["Inventory Value", inventoryValue.toFixed(2)],
      ["Retail Value", retailValue.toFixed(2)]
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "daily-audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return <Card>
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">Daily Audit</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Sales, refunds, and stock health for today</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatChip icon={Receipt} label="Sales" value={`$${salesTotal.toFixed(2)}`} accent />
          <StatChip icon={TrendingUp} label="Avg Order" value={`$${avgOrder.toFixed(2)}`} />
          <StatChip icon={CheckCircle} label="Transactions" value={transactions} />
          <StatChip icon={AlertTriangle} label="Refunds" value={refunds} tone="destructive" />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <AuditRow
            title="Low stock items"
            value={lowStockCount}
            hint="At or below reorder level"
            icon={Package}
            tone={lowStockCount > 0 ? "destructive" : "muted"}
          />
          <AuditRow
            title="Expiring soon"
            value={expiringCount}
            hint="Within 7 days"
            icon={AlertTriangle}
            tone={expiringCount > 0 ? "warning" : "muted"}
          />
          <AuditRow
            title="Inventory value"
            value={`$${inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            hint={`Retail: $${retailValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={Package}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Today’s transactions</p>
            <Badge variant="outline">{todaySales.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {todaySales.slice(0, 6).map((sale) => <div key={sale.id} className="rounded-lg border p-3 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{sale.receiptNumber || "Sale"}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.cart?.items?.length || 0} items · ${(sale.cart?.total || 0).toFixed(2)}
                  </p>
                </div>
                <Badge variant={sale.status === "completed" ? "secondary" : "outline"} className="capitalize">
                  {sale.status || "completed"}
                </Badge>
              </div>)}
            {todaySales.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet today.</p>}
          </div>
        </div>
      </CardContent>
    </Card>;
}

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
  tone
}) {
  const tones = {
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
    muted: "bg-muted text-foreground"
  };
  return <div className={`rounded-lg border p-3 sm:p-4 flex items-center gap-3 ${tone ? tones[tone] : ""}`}>
      <div className={`rounded-md ${accent ? "bg-primary/10 text-primary" : "bg-muted text-foreground"} p-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-base sm:text-lg font-semibold">{value}</p>
      </div>
    </div>;
}

function AuditRow({
  title,
  value,
  hint,
  icon: Icon,
  tone
}) {
  const toneClass = tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground";
  return <div className="rounded-lg border p-3 sm:p-4 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${toneClass}`} />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>;
}

