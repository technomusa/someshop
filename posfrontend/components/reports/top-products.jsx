"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useProductStore } from "@/lib/product-store";
const topProductsData = [
  { id: "ph001", quantity: 45, revenue: 53955, trend: "up", change: 12 },
  { id: "lp001", quantity: 18, revenue: 62982, trend: "up", change: 8 },
  { id: "ac001", quantity: 89, revenue: 22161, trend: "down", change: -3 },
  { id: "sw001", quantity: 32, revenue: 25568, trend: "up", change: 15 },
  { id: "cs001", quantity: 156, revenue: 622.44, trend: "neutral", change: 0 },
  { id: "cl001", quantity: 67, revenue: 2345, trend: "up", change: 5 },
  { id: "ph002", quantity: 28, revenue: 30772, trend: "down", change: -7 },
  { id: "ac002", quantity: 112, revenue: 4368, trend: "up", change: 22 }
];
export function TopProducts() {
  const { products } = useProductStore();
  const topProducts = topProductsData.map((data) => {
    const product = products.find((p) => p.id === data.id);
    return {
      ...data,
      product
    };
  });
  return <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performers this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px]">
          <div className="space-y-3">
            {topProducts.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
                  {index + 1}
                </div>
                <img
    src={item.product?.images[0] || "/placeholder.svg?height=40&width=40&query=product"}
    alt={item.product?.name}
    className="h-10 w-10 rounded-md object-cover"
  />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product?.name || "Unknown Product"}</p>
                  <p className="text-sm text-muted-foreground">{item.quantity} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.revenue.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1">
                    {item.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {item.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {item.trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                    <span
    className={`text-xs ${item.trend === "up" ? "text-green-500" : item.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}
  >
                      {item.change > 0 ? "+" : ""}
                      {item.change}%
                    </span>
                  </div>
                </div>
              </div>)}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>;
}
