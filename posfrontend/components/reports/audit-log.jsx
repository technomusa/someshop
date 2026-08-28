"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/lib/finance-store";
import { Download, FileText } from "lucide-react";

export function AuditLog() {
  const { auditLogs = [], exportClosuresCsv, getClosures } = useFinanceStore();

  const handleExportClosures = () => {
    const csv = exportClosuresCsv?.();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "closures.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const closures = getClosures?.() || [];

  return <Card>
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">Audit Trail</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Recent financial events & closures</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportClosures}>
            <Download className="h-4 w-4 mr-2" />
            Export closures
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        <div className="rounded-lg border bg-muted/40 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            <p className="text-sm font-medium">Daily closures</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {closures.slice(0, 4).map((c) => (
              <div key={c.id} className="rounded-md border bg-background p-3 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{c.date}</p>
                  <p className="text-xs text-muted-foreground">
                    Cash ${c.cashCount?.toFixed?.(2) ?? c.cashCount} · Card ${c.cardTotal?.toFixed?.(2) ?? c.cardTotal}
                  </p>
                </div>
                <Badge variant={c.status === "balanced" ? "secondary" : "destructive"} className="capitalize">
                  {c.status}
                </Badge>
              </div>
            ))}
            {closures.length === 0 && <p className="text-sm text-muted-foreground">No closures yet.</p>}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Latest audit events</p>
          <ScrollArea className="h-48 rounded-md border bg-muted/30">
            <div className="divide-y">
              {auditLogs.length === 0 && <p className="p-3 text-sm text-muted-foreground">No audit entries yet.</p>}
              {auditLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="p-3 flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0 capitalize">{log.kind}</Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>;
}

