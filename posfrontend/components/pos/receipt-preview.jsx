"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/lib/settings-store";
import { Printer, X } from "lucide-react";
import { format } from "date-fns";
export function ReceiptPreview({
  open,
  onClose,
  cart,
  customer,
  paymentMethod,
  amountPaid,
  change,
  receiptNumber
}) {
  const { settings } = useSettingsStore();
  const receiptRef = useRef(null);
  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-sm { font-size: 12px; }
            .text-xs { font-size: 10px; }
            .my-2 { margin: 8px 0; }
            .my-4 { margin: 16px 0; }
            .flex { display: flex; justify-content: space-between; }
            .border-dashed { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-base sm:text-lg">
            Receipt Preview
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div
    ref={receiptRef}
    className="rounded-lg border bg-white p-3 sm:p-4 text-black font-mono text-xs sm:text-sm max-h-[60vh] overflow-y-auto"
  >
          <div className="text-center space-y-1">
            <h3 className="font-bold text-base sm:text-lg">{settings.storeName}</h3>
            <p className="text-[10px] sm:text-xs">{settings.storeAddress}</p>
            <p className="text-[10px] sm:text-xs">{settings.storePhone}</p>
            <p className="text-[10px] sm:text-xs">{settings.receiptHeader}</p>
          </div>

          <Separator className="my-2 sm:my-3 bg-black/20" />

          <div className="space-y-1 text-[10px] sm:text-xs">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span>{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{format(/* @__PURE__ */ new Date(), "MMM dd, yyyy HH:mm")}</span>
            </div>
            {customer && <div className="flex justify-between">
                <span>Customer:</span>
                <span>{customer.name}</span>
              </div>}
          </div>

          <Separator className="my-2 sm:my-3 bg-black/20" />

          <div className="space-y-2">
            {cart.items.map((item) => <div key={item.id} className="space-y-0.5">
                <div className="flex justify-between text-[10px] sm:text-xs">
                  <span className="flex-1 truncate pr-2">{item.product.name}</span>
                  <span>
                    {settings.currencySymbol}
                    {Number(item.total ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 pl-2">
                  {item.quantity} x {settings.currencySymbol}
                  {Number(item.unitPrice ?? 0).toFixed(2)}
                  {item.variant && item.variant.attributes && typeof item.variant.attributes === 'object' && <span className="ml-1">({Object.values(item.variant.attributes).join(", ")})</span>}
                </div>
              </div>)}
          </div>

          <Separator className="my-2 sm:my-3 bg-black/20" />

          <div className="space-y-1 text-[10px] sm:text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
                <span>
                {settings.currencySymbol}
                {Number(cart.subtotal ?? 0).toFixed(2)}
              </span>
            </div>
            {cart.discountAmount > 0 && <div className="flex justify-between">
                <span>Discount:</span>
                <span>
                  -{settings.currencySymbol}
                  {Number(cart.discountAmount ?? 0).toFixed(2)}
                </span>
              </div>}
            <div className="flex justify-between">
              <span>Tax ({settings.taxRate}%):</span>
              <span>
                {settings.currencySymbol}
                {Number(cart.taxAmount ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-xs sm:text-sm pt-1 border-t border-dashed border-black/30">
              <span>TOTAL:</span>
              <span>
                {settings.currencySymbol}
                {Number(cart.total ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <Separator className="my-2 sm:my-3 bg-black/20" />

          <div className="space-y-1 text-[10px] sm:text-xs">
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize">{paymentMethod.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span>
                {settings.currencySymbol}
                {Number(amountPaid ?? 0).toFixed(2)}
              </span>
            </div>
            {Number(change ?? 0) > 0 && <div className="flex justify-between font-bold">
                <span>Change:</span>
                <span>
                  {settings.currencySymbol}
                  {Number(change ?? 0).toFixed(2)}
                </span>
              </div>}
          </div>

          <Separator className="my-2 sm:my-3 bg-black/20" />

          <div className="text-center text-[10px] sm:text-xs space-y-1">
            <p>{settings.receiptFooter}</p>
            {customer && <p className="font-medium">Loyalty Points: +{Math.floor(cart.total / 10)}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent text-sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button className="flex-1 text-sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}
