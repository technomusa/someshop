"use client";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { format } from "date-fns";
const typeStyles = {
  adjustment: { label: "Adjustment", variant: "secondary" },
  in: { label: "Received", variant: "default" },
  out: { label: "Sold", variant: "secondary" },
  transfer: { label: "Transfer", variant: "secondary" },
  damaged: { label: "Damaged", variant: "destructive" },
  lost: { label: "Lost", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
  returned: { label: "Returned", variant: "default" },
  correction: { label: "Correction", variant: "secondary" }
};

export function AdjustmentHistory() {
  // Fetch stock movements from API
  const { data: movementsData, isLoading } = useQuery({
    queryKey: ['inventory', 'movements'],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/movements');
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
  
  const movements = useMemo(() => {
    if (!movementsData || !Array.isArray(movementsData)) return [];
    return movementsData.map((movement) => ({
      ...movement,
      productName: movement.product?.name || 'Unknown',
      userName: movement.user?.name || 'Unknown',
      createdAt: movement.created_at || movement.createdAt,
      type: movement.type || 'adjustment',
      quantity: movement.quantity || 0,
      reason: movement.reason || 'Manual Adjustment',
    }));
  }, [movementsData]);
  return <Card>
      <CardHeader>
        <CardTitle>Adjustment History</CardTitle>
        <CardDescription>Recent stock adjustments and corrections</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {movements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No adjustments recorded yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => {
                    const style = typeStyles[movement.type] || typeStyles.adjustment;
                    const isValidDate = movement.createdAt && !isNaN(new Date(movement.createdAt).getTime());
                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {isValidDate ? format(new Date(movement.createdAt), "MMM d, h:mm a") : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">{movement.productName}</TableCell>
                        <TableCell>
                          <Badge variant={style.variant}>{style.label}</Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${movement.quantity < 0 ? "text-destructive" : "text-green-600"}`}
                        >
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{movement.reason}</TableCell>
                        <TableCell className="text-sm">{movement.userName}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>;
}
