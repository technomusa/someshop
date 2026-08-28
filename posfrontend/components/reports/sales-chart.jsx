"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
const dailyData = [
  { name: "Mon", sales: 4200, transactions: 42 },
  { name: "Tue", sales: 3800, transactions: 38 },
  { name: "Wed", sales: 5100, transactions: 51 },
  { name: "Thu", sales: 4600, transactions: 46 },
  { name: "Fri", sales: 6200, transactions: 62 },
  { name: "Sat", sales: 7800, transactions: 78 },
  { name: "Sun", sales: 5400, transactions: 54 }
];
const weeklyData = [
  { name: "Week 1", sales: 28500, transactions: 285 },
  { name: "Week 2", sales: 32100, transactions: 321 },
  { name: "Week 3", sales: 29800, transactions: 298 },
  { name: "Week 4", sales: 35400, transactions: 354 }
];
const monthlyData = [
  { name: "Jan", sales: 125e3, transactions: 1250 },
  { name: "Feb", sales: 118e3, transactions: 1180 },
  { name: "Mar", sales: 142e3, transactions: 1420 },
  { name: "Apr", sales: 135e3, transactions: 1350 },
  { name: "May", sales: 158e3, transactions: 1580 },
  { name: "Jun", sales: 165e3, transactions: 1650 }
];
export function SalesChart() {
  const [period, setPeriod] = useState("daily");
  const data = period === "daily" ? dailyData : period === "weekly" ? weeklyData : monthlyData;
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Revenue and transaction trends</CardDescription>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
    className="text-xs"
    tick={{ fill: "hsl(var(--muted-foreground))" }}
    tickFormatter={(value) => `$${Number(value / 1e3).toFixed(0)}k`}
  />
              <Tooltip
    contentStyle={{
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px"
    }}
    formatter={(value) => [`$${value.toLocaleString()}`, "Sales"]}
  />
              <Area
    type="monotone"
    dataKey="sales"
    stroke="hsl(var(--primary))"
    fill="url(#salesGradient)"
    strokeWidth={2}
  />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>;
}
