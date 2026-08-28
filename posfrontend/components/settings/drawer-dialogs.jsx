"use client";
import { useState } from "react";
import { useAccountingStore } from "@/lib/accounting-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DrawerOpenDialog({ open, onOpenChange, onSuccess }) {
    const { openDrawer } = useAccountingStore();
    const [openingCash, setOpeningCash] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        if (!openingCash || parseFloat(openingCash) < 0) {
            toast.error("Please enter a valid opening cash amount");
            return;
        }

        setLoading(true);
        try {
            await openDrawer(parseFloat(openingCash));
            toast.success("Drawer opened successfully");
            setOpeningCash("");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to open drawer", error);
            toast.error(error.response?.data?.error || "Failed to open drawer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Open Cash Drawer</DialogTitle>
                    <DialogDescription>
                        Enter the opening cash amount to start your shift
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="opening-cash">Opening Cash Amount</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="opening-cash"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={openingCash}
                                onChange={(e) => setOpeningCash(e.target.value)}
                                className="pl-9"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleOpen} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Open Drawer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DrawerCloseDialog({ open, onOpenChange, onSuccess }) {
    const { closeDrawer, currentSession } = useAccountingStore();
    const [actualCash, setActualCash] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClose = async () => {
        if (!actualCash || parseFloat(actualCash) < 0) {
            toast.error("Please enter a valid actual cash amount");
            return;
        }

        setLoading(true);
        try {
            const result = await closeDrawer(parseFloat(actualCash), notes);
            const discrepancy = result.discrepancy || 0;

            if (discrepancy !== 0) {
                toast.warning(`Drawer closed with discrepancy: $${Number(Math.abs(discrepancy) ?? 0).toFixed(2)} ${discrepancy > 0 ? 'over' : 'short'}`);
            } else {
                toast.success("Drawer closed successfully - balanced!");
            }

            setActualCash("");
            setNotes("");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to close drawer", error);
            toast.error(error.response?.data?.error || "Failed to close drawer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Close Cash Drawer</DialogTitle>
                    <DialogDescription>
                        Count your cash and enter the actual amount to close your shift
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {currentSession && (
                        <div className="rounded-lg bg-muted p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Opening Cash:</span>
                                <span className="font-medium">${Number(currentSession.opening_cash ?? 0).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="actual-cash">Actual Cash Amount</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="actual-cash"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value)}
                                className="pl-9"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Any notes about this session..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleClose} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Close Drawer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
