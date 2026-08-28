"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Gift, Mail, MapPin, Phone, ShoppingBag, Star, Receipt } from "lucide-react";
import { format } from "date-fns";
function getLoyaltyTier(points) {
  if (points >= 5e3) return { tier: "Platinum", color: "bg-purple-500", nextTier: "Max Level", pointsNeeded: 0 };
  if (points >= 2e3) return { tier: "Gold", color: "bg-yellow-500", nextTier: "Platinum", pointsNeeded: 5e3 - points };
  if (points >= 500) return { tier: "Silver", color: "bg-gray-400", nextTier: "Gold", pointsNeeded: 2e3 - points };
  return { tier: "Bronze", color: "bg-orange-400", nextTier: "Silver", pointsNeeded: 500 - points };
}
export function CustomerDetails({ open, onOpenChange, customer, onEdit }) {
  if (!customer) return null;
  const loyalty = getLoyaltyTier(customer.loyaltyPoints);
  const progress = loyalty.tier === "Platinum" ? 100 : loyalty.tier === "Gold" ? (customer.loyaltyPoints - 2e3) / 3e3 * 100 : loyalty.tier === "Silver" ? (customer.loyaltyPoints - 500) / 1500 * 100 : customer.loyaltyPoints / 500 * 100;
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {customer.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">{customer.name}</SheetTitle>
                <Badge className={`${loyalty.color} text-white mt-1`}>{loyalty.tier} Member</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] mt-6">
          <div className="space-y-6">
            {
    /* Contact Info */
  }
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.email && <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>}
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                {customer.address && <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.address}</span>
                  </div>}
              </CardContent>
            </Card>

            {
    /* Loyalty Card */
  }
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Loyalty Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold">{customer.loyaltyPoints.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Available Points</p>
                  </div>
                  <Button size="sm">
                    <Gift className="mr-2 h-4 w-4" />
                    Add Points
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{loyalty.tier}</span>
                    <span>{loyalty.nextTier}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${loyalty.color} transition-all`} style={{ width: `${progress}%` }} />
                  </div>
                  {loyalty.pointsNeeded > 0 && <p className="text-xs text-muted-foreground">
                      {loyalty.pointsNeeded.toLocaleString()} more points to {loyalty.nextTier}
                    </p>}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{customer.totalPurchases}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${(customer.totalPurchases * 150).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Lifetime Spend</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {
    /* Tabs */
  }
            <Tabs defaultValue="history">
              <TabsList className="w-full">
                <TabsTrigger value="history" className="flex-1">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="refunds" className="flex-1">
                  <Receipt className="mr-2 h-4 w-4" />
                  Refunds
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-4">
                {customer.purchaseHistory.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No purchase history yet</p>
                  </div> : <div className="space-y-3">
                    {customer.purchaseHistory.map((sale) => <div key={sale.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{sale.receiptNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(sale.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${Number(sale.cart.total ?? 0).toFixed(2)}</p>
                          <Badge variant="outline">{sale.cart.items.length} items</Badge>
                        </div>
                      </div>)}
                  </div>}
              </TabsContent>

              <TabsContent value="refunds" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No refunds or exchanges</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-sm text-muted-foreground">
              <p>Customer since: {format(new Date(customer.createdAt), "MMMM d, yyyy")}</p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>;
}
