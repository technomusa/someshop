"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { usePOSStore } from "@/lib/store";
import { useFinanceStore } from "@/lib/finance-store";
import { useSettingsStore } from "@/lib/settings-store";
import { AlertTriangle, CheckCircle, Lock, Calculator, Wallet, Banknote, Download, User } from "lucide-react";

export function EndOfDayClose() {
  const { salesHistory = [], currentUser } = usePOSStore();
  const { 
    closeDay, 
    getTodayClosure, 
    logAudit, 
    getDenominations, 
    getDefaultDenominations,
    calculateCashTotal 
  } = useFinanceStore();
  const { settings } = useSettingsStore();
  const currency = settings?.currency || "USD";
  const currencySymbol = settings?.currencySymbol || "$";
  const denominations = getDenominations(currency);
  const defaultDenoms = getDefaultDenominations(currency);
  
  const [cardTotal, setCardTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [denoms, setDenoms] = useState(defaultDenoms);
  const todayClosure = getTodayClosure?.();

  const totals = useMemo(() => {
    const today = new Date().toDateString();
    const completed = salesHistory.filter((s) => s?.completedAt && new Date(s.completedAt).toDateString() === today && s.status === "completed");
    const expected = completed.reduce((sum, s) => sum + (s?.cart?.total || 0), 0);
    return {
      expected,
      transactions: completed.length
    };
  }, [salesHistory]);

  const cashCount = useMemo(() => {
    return calculateCashTotal(denoms);
  }, [denoms, calculateCashTotal]);

  const handleClose = () => {
    const card = parseFloat(cardTotal || "0") || 0;
    const closure = closeDay({
      cashCount,
      cardTotal: card,
      expectedTotal: totals.expected,
      notes,
      denominations: denoms,
      cashier: currentUser?.name || "Unknown",
      currency
    });
    logAudit({
      kind: "closure-signoff",
      message: `Closure signed by ${currentUser?.name || "Unknown"}`,
      metadata: { discrepancy: closure?.discrepancy, status: closure?.status }
    });
    setNotes("");
    setDenoms(getDefaultDenominations(currency));
    setCardTotal("");
    return closure;
  };

  const closed = !!todayClosure?.closedAt;
  const discrepancy = todayClosure?.discrepancy ?? 0;

  return <Card id="eod">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">End of Day Close</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Mandatory daily cash-up and audit</CardDescription>
          </div>
          {closed ? <Badge variant={Math.abs(discrepancy) < 0.01 ? "secondary" : "destructive"}>
              {Math.abs(discrepancy) < 0.01 ? "Balanced" : "Mismatch"}
            </Badge> : <Badge variant="destructive">Required</Badge>}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {closed ? <Alert variant="default" className="bg-muted/70">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Closed for today</AlertTitle>
            <AlertDescription className="text-sm">
              Cash: ${todayClosure.cashCount?.toFixed(2)} · Card: ${todayClosure.cardTotal?.toFixed(2)} · Expected: ${todayClosure.expectedTotal?.toFixed(2)} · Discrepancy: {discrepancy.toFixed(2)}
            </AlertDescription>
          </Alert> : <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Pending close</AlertTitle>
            <AlertDescription className="text-sm">
              Please reconcile and close the account before end of day.
            </AlertDescription>
          </Alert>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <SummaryTile icon={Calculator} label="Expected total" value={`${currencySymbol}${totals.expected.toFixed(2)}`} />
          <SummaryTile icon={Wallet} label="Transactions" value={totals.transactions} />
          <SummaryTile icon={Lock} label="Status" value={closed ? "Closed" : "Open"} tone={closed ? "ok" : "warn"} />
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              <p className="text-sm font-medium">Cash breakdown</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {denominations.map((denom) => (
                <div key={denom.value} className="space-y-1">
                  <Label className="text-xs">{denom.label} x</Label>
                  <Input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={denoms[denom.value.toString()] || ""}
                    onChange={(e) => setDenoms((prev) => ({ ...prev, [denom.value.toString()]: e.target.value }))}
                    placeholder="0"
                    disabled={closed}
                  />
                </div>
              ))}
            </div>
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm flex justify-between">
              <span>Total cash counted</span>
              <span className="font-semibold">{currencySymbol}{cashCount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Cashier / Sign-off
              </div>
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                {currentUser?.name || "Unknown user"}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Card settlements</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={cardTotal}
                onChange={(e) => setCardTotal(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Variance reason, vault drop, etc."
              />
            </div>
            <Alert variant="default" className="bg-muted/70">
              <AlertTitle>Discrepancy preview</AlertTitle>
              <AlertDescription className="text-sm">
                Cash + Card: {currencySymbol}{(cashCount + (parseFloat(cardTotal || "0") || 0)).toFixed(2)} · Expected: {currencySymbol}{totals.expected.toFixed(2)} ·
                Delta: {currencySymbol}{Math.abs(cashCount + (parseFloat(cardTotal || "0") || 0) - totals.expected).toFixed(2)}
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">Discrepancy will be calculated automatically.</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDenoms(getDefaultDenominations(currency));
                setCardTotal("");
                setNotes("");
              }}
            >
              Reset
            </Button>
            {closed && todayClosure ? (
              <Button variant="outline" size="sm" onClick={() => exportClosure(todayClosure)}>
                <Download className="mr-2 h-4 w-4" />
                Export closure
              </Button>
            ) : null}
            <Button onClick={handleClose} disabled={closed}>
              {closed ? "Already closed" : "Close day"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone
}) {
  const toneClass = tone === "warn" ? "text-amber-600 dark:text-amber-300" : "text-emerald-600 dark:text-emerald-300";
  return <div className="rounded-lg border p-3 sm:p-4 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${toneClass}`} />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>;
}

function exportClosure(closure) {
  const rows = [
    ["Date", closure.date],
    ["Opening Cash", closure.openingCash ?? ""],
    ["Cash Count", closure.cashCount ?? ""],
    ["Card Total", closure.cardTotal ?? ""],
    ["Expected Total", closure.expectedTotal ?? ""],
    ["Discrepancy", closure.discrepancy ?? ""],
    ["Status", closure.status ?? ""],
    ["Notes", closure.notes ?? ""]
  ];
  if (closure.denominations) {
    rows.push(["Denominations", "Qty"]);
    Object.entries(closure.denominations).forEach(([value, qty]) => {
      rows.push([`$${parseFloat(value).toFixed(2)}`, qty]);
    });
  }
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `closure-${closure.date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

