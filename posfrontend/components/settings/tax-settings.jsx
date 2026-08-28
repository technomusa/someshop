"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/lib/settings-store";
import { Plus, MoreHorizontal, Pencil, Trash2, Percent } from "lucide-react";
export function TaxSettings() {
  const { taxConfigs, addTaxConfig, updateTaxConfig, deleteTaxConfig } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    rate: 0,
    isDefault: false,
    appliesTo: ["all"]
  });
  const resetForm = () => {
    setFormData({
      name: "",
      rate: 0,
      isDefault: false,
      appliesTo: ["all"]
    });
    setEditingTax(null);
  };
  const handleSubmit = () => {
    if (editingTax) {
      updateTaxConfig(editingTax.id, formData);
    } else {
      addTaxConfig(formData);
    }
    setIsOpen(false);
    resetForm();
  };
  const handleEdit = (tax) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      rate: tax.rate,
      isDefault: tax.isDefault,
      appliesTo: tax.appliesTo
    });
    setIsOpen(true);
  };
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Tax Configuration
          </CardTitle>
          <CardDescription>Manage tax rates for different product categories</CardDescription>
        </div>
        <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}
  >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTax ? "Edit Tax Rate" : "Add Tax Rate"}</DialogTitle>
              <DialogDescription>Configure a new tax rate for your products</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taxName">Tax Name</Label>
                <Input
    id="taxName"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="e.g., Standard VAT"
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Rate (%)</Label>
                <Input
    id="taxRate"
    type="number"
    min="0"
    max="100"
    step="0.1"
    value={formData.rate}
    onChange={(e) => setFormData({ ...formData, rate: Number.parseFloat(e.target.value) || 0 })}
  />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isDefault">Default Tax Rate</Label>
                  <p className="text-sm text-muted-foreground">Applied to new products by default</p>
                </div>
                <Switch
    id="isDefault"
    checked={formData.isDefault}
    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
  />
              </div>
            </div>
            <DialogFooter>
              <Button
    variant="outline"
    onClick={() => {
      setIsOpen(false);
      resetForm();
    }}
  >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingTax ? "Save Changes" : "Add Tax Rate"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxConfigs.map((tax) => <TableRow key={tax.id}>
                <TableCell className="font-medium">{tax.name}</TableCell>
                <TableCell>{tax.rate}%</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {tax.appliesTo.includes("all") ? "All Products" : tax.appliesTo.join(", ")}
                  </Badge>
                </TableCell>
                <TableCell>{tax.isDefault && <Badge>Default</Badge>}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(tax)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteTaxConfig(tax.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>;
}
