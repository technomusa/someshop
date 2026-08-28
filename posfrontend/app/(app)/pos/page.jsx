"use client";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { QuickActions } from "@/components/pos/quick-actions";
import { usePOSStore } from "@/lib/store";
// // import { sampleUsers } from "@/lib/data"; // removed, not needed // removed, using real auth
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
export default function POSPage() {
  const { createCart, activeCartId, carts, getActiveCart, _hasHydrated, loadProducts } = usePOSStore();
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    if (!_hasHydrated) return;
    // Load products once after hydration
    loadProducts();
    // Ensure a cart exists
    if (!activeCartId || !carts.find((c) => c.id === activeCartId && c.status === "active")) {
      createCart();
    }
  }, [_hasHydrated, activeCartId, carts, createCart, loadProducts]);
  const cart = getActiveCart();
  const itemCount = cart?.items.length || 0;
  const cartTotal = cart?.total || 0;
  if (!_hasHydrated) {
    return <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading POS...</p>
      </div>
    </div>;
  }
  return <div className="flex h-full flex-col overflow-hidden">
    <QuickActions />
    <div className="flex flex-1 overflow-hidden relative">
      {
        /* Product Grid - takes full width on mobile */
      }
      <div className="flex-1 overflow-hidden">
        <ProductGrid />
      </div>

      {
        /* Cart Panel - hidden on mobile, shown on lg+ */
      }
      <div className="hidden lg:flex  shrink-0 border-l">
        <CartPanel />
      </div>

      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="h-14 rounded-full shadow-xl relative pr-5 pl-4 gap-2">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {itemCount}
                </Badge>}
              </div>
              {itemCount > 0 && <span className="font-bold">${cartTotal.toFixed(2)}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96 p-0">
            <CartPanel onClose={() => setCartOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </div>;
}
