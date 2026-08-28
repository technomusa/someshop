"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Smartphone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
const transactions = [
  {
    id: "TXN001",
    receipt: "RCP-2024-0156",
    amount: 1249.99,
    items: 2,
    method: "card",
    customer: "Sarah Johnson",
    time: new Date(Date.now() - 1e3 * 60 * 5)
  },
  {
    id: "TXN002",
    receipt: "RCP-2024-0155",
    amount: 89.99,
    items: 3,
    method: "cash",
    customer: "Walk-in",
    time: new Date(Date.now() - 1e3 * 60 * 18)
  },
  {
    id: "TXN003",
    receipt: "RCP-2024-0154",
    amount: 3499,
    items: 1,
    method: "card",
    customer: "John Smith",
    time: new Date(Date.now() - 1e3 * 60 * 32)
  },
  {
    id: "TXN004",
    receipt: "RCP-2024-0153",
    amount: 45.5,
    items: 5,
    method: "mobile_money",
    customer: "Walk-in",
    time: new Date(Date.now() - 1e3 * 60 * 45)
  },
  {
    id: "TXN005",
    receipt: "RCP-2024-0152",
    amount: 799,
    items: 1,
    method: "card",
    customer: "Michael Brown",
    time: new Date(Date.now() - 1e3 * 60 * 58)
  },
  {
    id: "TXN006",
    receipt: "RCP-2024-0151",
    amount: 156.75,
    items: 4,
    method: "cash",
    customer: "Walk-in",
    time: new Date(Date.now() - 1e3 * 60 * 72)
  }
];
const methodIcons = {
  cash: <Banknote className="h-4 w-4 text-green-500" />,
  card: <CreditCard className="h-4 w-4 text-blue-500" />,
  mobile_money: <Smartphone className="h-4 w-4 text-orange-500" />
};
export function RecentTransactions() {
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest sales activity</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sales">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px]">
          <div className="space-y-3">
            {transactions.map((txn) => <div key={txn.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {methodIcons[txn.method]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{txn.receipt}</p>
                    <Badge variant="outline" className="text-xs">
                      {txn.items} items
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{txn.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${Number(txn.amount ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{format(txn.time, "h:mm a")}</p>
                </div>
              </div>)}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>;
}
