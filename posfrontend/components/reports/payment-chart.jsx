"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
const data = [
  { name: "Mon", cash: 1800, card: 1900, mobile: 500 },
  { name: "Tue", cash: 1500, card: 1800, mobile: 500 },
  { name: "Wed", cash: 2100, card: 2300, mobile: 700 },
  { name: "Thu", cash: 1900, card: 2100, mobile: 600 },
  { name: "Fri", cash: 2500, card: 2900, mobile: 800 },
  { name: "Sat", cash: 3200, card: 3500, mobile: 1100 },
  { name: "Sun", cash: 2200, card: 2400, mobile: 800 }
];
export function PaymentChart() {
  return <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Daily breakdown by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
    className="text-xs"
    tick={{ fill: "hsl(var(--muted-foreground))" }}
    tickFormatter={(value) => `$${value}`}
  />
              <Tooltip
    contentStyle={{
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px"
    }}
    formatter={(value) => `$${value.toLocaleString()}`}
  />
              <Legend />
              <Bar dataKey="cash" fill="#22c55e" name="Cash" radius={[4, 4, 0, 0]} />
              <Bar dataKey="card" fill="#3b82f6" name="Card" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mobile" fill="#f97316" name="Mobile Money" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>;
}
