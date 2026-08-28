"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Clock, Play, Trash2, ShoppingBag } from "lucide-react";
import { usePOSStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
export function HeldCarts() {
  const { carts, resumeCart, deleteCart, createCart, activeCartId } = usePOSStore();
  const heldCarts = carts.filter((cart) => cart.status === "held");
  const handleResume = (cartId) => {
    if (!activeCartId || !carts.find((c) => c.id === activeCartId && c.status === "active")) {
    }
    resumeCart(cartId);
  };
  return <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative bg-transparent flex-shrink-0">
          <Clock className="mr-1 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Held Carts</span>
          {heldCarts.length > 0 && <Badge className="ml-1 sm:ml-2">{heldCarts.length}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Held Carts</SheetTitle>
          <SheetDescription>Resume or delete previously held carts</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {heldCarts.length === 0 ? <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingBag className="mb-4 h-12 w-12 opacity-20" />
              <p>No held carts</p>
            </div> : <div className="space-y-3">
              {heldCarts.map((cart) => <div key={cart.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {cart.items.length} items - ${Number(cart.total ?? 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(cart.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="secondary">Held</Badge>
                  </div>
                  {cart.holdNote && <p className="text-sm italic text-muted-foreground">Note: {cart.holdNote}</p>}
                  <div className="text-sm text-muted-foreground">
                    {cart.items.slice(0, 3).map((item) => <p key={item.id} className="truncate">
                        {item.quantity}x {item.product.name}
                      </p>)}
                    {cart.items.length > 3 && <p>+{cart.items.length - 3} more items</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleResume(cart.id)}>
                      <Play className="mr-1 h-4 w-4" />
                      Resume
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteCart(cart.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>)}
            </div>}
        </ScrollArea>
      </SheetContent>
    </Sheet>;
}
