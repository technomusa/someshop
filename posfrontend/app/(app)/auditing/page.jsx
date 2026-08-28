"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Download, 
  RefreshCw,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Bell,
  Calendar
} from "lucide-react";
import { useFinanceStore } from "@/lib/finance-store";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useProductStore } from "@/lib/product-store";
import { format } from "date-fns";
import { EndOfDayClose } from "@/components/reports/end-of-day-close";
import { DailyAudit } from "@/components/reports/daily-audit";
import { AuditLog } from "@/components/reports/audit-log";
import { toast } from "sonner";

export default function AuditingPage() {
  const { 
    getTodayClosure, 
    getClosures, 
    checkEODStatus,
    getActiveAlerts,
    getDenominations,
    getDefaultDenominations,
    calculateCashTotal,
    exportClosuresCsv
  } = useFinanceStore();
  const { salesHistory, currentUser } = usePOSStore();
  const { settings } = useSettingsStore();
  const { products, getLowStockProducts, getExpiringProducts } = useProductStore();
  
  const [activeTab, setActiveTab] = useState("closure");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const eodStatus = checkEODStatus();
  const todayClosure = getTodayClosure();
  const closures = getClosures();
  const activeAlerts = getActiveAlerts();
  const currency = settings?.currency || "USD";
  const currencySymbol = settings?.currencySymbol || "$";
  const denominations = getDenominations(currency);
  
  // Calculate today's sales totals
  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    const todays = (salesHistory || []).filter(
      (sale) => sale?.completedAt && 
      new Date(sale.completedAt).toDateString() === today && 
      sale.status === "completed"
    );
    const cashSales = todays.filter((s) => s.paymentMethod === "cash");
    const cardSales = todays.filter((s) => s.paymentMethod === "card");
    
    return {
      total: todays.reduce((sum, s) => sum + (s.cart?.total || 0), 0),
      count: todays.length,
      cashTotal: cashSales.reduce((sum, s) => sum + (s.cart?.total || 0), 0),
      cardTotal: cardSales.reduce((sum, s) => sum + (s.cart?.total || 0), 0)
    };
  }, [salesHistory]);
  
  // Check for overdue closures periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const status = checkEODStatus();
      if (!status.isClosed && status.isOverdue) {
        toast.error("End of day closure is overdue! Please close accounts immediately.", {
          duration: 10000
        });
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkEODStatus]);
  
  const handleExport = () => {
    const csv = exportClosuresCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `closures-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Closures exported successfully");
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Auditing & Financial Control</h1>
            <p className="text-sm text-muted-foreground">
              Daily closures, cash reconciliation, and financial auditing
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Status Alerts */}
        {activeAlerts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missed Closures Detected</AlertTitle>
            <AlertDescription>
              {activeAlerts.length} day(s) without proper closure. Admin has been notified.
            </AlertDescription>
          </Alert>
        )}
        
        {!eodStatus.isClosed && (
          <Alert variant={eodStatus.isOverdue ? "destructive" : "default"}>
            <Bell className="h-4 w-4" />
            <AlertTitle>
              {eodStatus.isOverdue ? "OVERDUE: " : ""}End of Day Closure Required
            </AlertTitle>
            <AlertDescription>
              {eodStatus.isOverdue 
                ? "The daily closure deadline has passed. Please close accounts immediately."
                : "Complete the end-of-day closure before the deadline to ensure proper auditing."}
            </AlertDescription>
          </Alert>
        )}
        
        {todayClosure && (
          <Alert variant={todayClosure.status === "balanced" ? "default" : "destructive"}>
            {todayClosure.status === "balanced" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              Today's Closure: {todayClosure.status === "balanced" ? "Balanced" : "Mismatch Detected"}
            </AlertTitle>
            <AlertDescription>
              Closed at {format(new Date(todayClosure.closedAt), "h:mm a")} by {todayClosure.cashier || "Unknown"}.
              {todayClosure.discrepancy !== 0 && (
                <span className="block mt-1">
                  Discrepancy: {currencySymbol}{Math.abs(todayClosure.discrepancy).toFixed(2)}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="closure">EOD Close</TabsTrigger>
              <TabsTrigger value="audit">Daily Audit</TabsTrigger>
              <TabsTrigger value="history">Closure History</TabsTrigger>
              <TabsTrigger value="logs">Audit Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="closure" className="space-y-6 mt-6">
              <EndOfDayClose key={refreshKey} />
            </TabsContent>
            
            <TabsContent value="audit" className="space-y-6 mt-6">
              <DailyAudit />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Closure History</CardTitle>
                  <CardDescription>Past daily closures and reconciliations</CardDescription>
                </CardHeader>
                <CardContent>
                  {closures.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No closure history available</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-3">
                        {closures
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((closure) => (
                            <Card key={closure.id} className={closure.status === "mismatch" ? "border-destructive/50" : ""}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">
                                        {format(new Date(closure.date), "MMM d, yyyy")}
                                      </span>
                                      <Badge variant={closure.status === "balanced" ? "default" : "destructive"}>
                                        {closure.status}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Cash</p>
                                        <p className="font-semibold">{currencySymbol}{closure.cashCount?.toFixed(2) || "0.00"}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Card</p>
                                        <p className="font-semibold">{currencySymbol}{closure.cardTotal?.toFixed(2) || "0.00"}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Expected</p>
                                        <p className="font-semibold">{currencySymbol}{closure.expectedTotal?.toFixed(2) || "0.00"}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Discrepancy</p>
                                        <p className={`font-semibold flex items-center gap-1 ${
                                          closure.discrepancy === 0 ? "text-green-600" : "text-destructive"
                                        }`}>
                                          {closure.discrepancy === 0 ? (
                                            <CheckCircle2 className="h-3 w-3" />
                                          ) : closure.discrepancy > 0 ? (
                                            <TrendingUp className="h-3 w-3" />
                                          ) : (
                                            <TrendingDown className="h-3 w-3" />
                                          )}
                                          {currencySymbol}{Math.abs(closure.discrepancy || 0).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                    {closure.cashier && (
                                      <p className="text-xs text-muted-foreground">
                                        Closed by: {closure.cashier} at {format(new Date(closure.closedAt), "h:mm a")}
                                      </p>
                                    )}
                                    {closure.notes && (
                                      <p className="text-xs text-muted-foreground italic">{closure.notes}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-6 mt-6">
              <AuditLog />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

