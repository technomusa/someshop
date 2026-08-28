"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
const data = [
  { name: "Phones", value: 45200, color: "#3b82f6" },
  { name: "Laptops", value: 32800, color: "#8b5cf6" },
  { name: "Smartwatches", value: 18500, color: "#06b6d4" },
  { name: "Accessories", value: 12400, color: "#f97316" },
  { name: "Clothing", value: 15600, color: "#ec4899" },
  { name: "Cold Store", value: 8900, color: "#14b8a6" }
];
export function CategoryChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>Revenue distribution across departments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip
    contentStyle={{
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px"
    }}
    formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
  />
              <Legend
    formatter={(value, entry) => {
      const item = data.find((d) => d.name === value);
      const percentage = item ? Number(item.value / total * 100).toFixed(1) : '0.0';
      return `${value} (${percentage}%)`;
    }}
  />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>;
}
