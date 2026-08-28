"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { sampleUsers } from "@/lib/data";
const cashierData = [
  { userId: "user003", transactions: 47, sales: 15420.5, target: 2e4, avgTicket: 328.09 },
  { userId: "user002", transactions: 38, sales: 12850, target: 18e3, avgTicket: 338.16 }
];
export function CashierPerformance() {
  const cashiers = cashierData.map((data) => {
    const user = sampleUsers.find((u) => u.id === data.userId);
    const progress = data.sales / data.target * 100;
    return { ...data, user, progress };
  });
  return <Card>
      <CardHeader>
        <CardTitle>Cashier Performance</CardTitle>
        <CardDescription>Daily sales targets and achievements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {cashiers.map((cashier) => <div key={cashier.userId} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={cashier.user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {cashier.user?.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{cashier.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{cashier.transactions} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${cashier.sales.toLocaleString()}</p>
                <Badge variant={cashier.progress >= 100 ? "default" : "secondary"}>
                  {cashier.progress >= 100 ? "Target Met" : `${Number(cashier.progress ?? 0).toFixed(0)}% of target`}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span>
                  ${cashier.sales.toLocaleString()} / ${cashier.target.toLocaleString()}
                </span>
              </div>
              <Progress value={Math.min(cashier.progress, 100)} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted p-2 text-center">
                <p className="font-bold">${Number(cashier.avgTicket ?? 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Avg. Ticket</p>
              </div>
              <div className="rounded-lg bg-muted p-2 text-center">
                <p className="font-bold">{cashier.transactions}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </div>
          </div>)}
      </CardContent>
    </Card>;
}
