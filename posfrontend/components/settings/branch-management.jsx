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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/lib/settings-store";
import { Plus, MoreHorizontal, Pencil, Trash2, MapPin, Building2, Star } from "lucide-react";
export function BranchManagement() {
  const { branches, addBranch, updateBranch, deleteBranch } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    isMain: false,
    isActive: true
  });
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      isMain: false,
      isActive: true
    });
    setEditingBranch(null);
  };
  const handleSubmit = () => {
    if (editingBranch) {
      updateBranch(editingBranch.id, formData);
    } else {
      addBranch(formData);
    }
    setIsOpen(false);
    resetForm();
  };
  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      isMain: branch.isMain,
      isActive: branch.isActive
    });
    setIsOpen(true);
  };
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branch Management
          </CardTitle>
          <CardDescription>Manage store locations and branches</CardDescription>
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
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
              <DialogDescription>
                {editingBranch ? "Update branch details" : "Create a new store location"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
    id="branchName"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="Enter branch name"
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchAddress">Address</Label>
                <Input
    id="branchAddress"
    value={formData.address}
    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
    placeholder="Enter full address"
  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchPhone">Phone Number</Label>
                <Input
    id="branchPhone"
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    placeholder="Enter phone number"
  />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isMain">Main Branch</Label>
                <Switch
    id="isMain"
    checked={formData.isMain}
    onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
  />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="branchActive">Branch Active</Label>
                <Switch
    id="branchActive"
    checked={formData.isActive}
    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
              <Button onClick={handleSubmit}>{editingBranch ? "Save Changes" : "Add Branch"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => <Card key={branch.id} className={!branch.isActive ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{branch.name}</h4>
                      {branch.isMain && <Badge
    variant="secondary"
    className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
  >
                          <Star className="mr-1 h-3 w-3" />
                          Main
                        </Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {branch.address}
                    </div>
                    <p className="text-sm text-muted-foreground">{branch.phone}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(branch)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {!branch.isMain && <DropdownMenuItem className="text-destructive" onClick={() => deleteBranch(branch.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3">
                  <Badge variant={branch.isActive ? "default" : "secondary"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </CardContent>
    </Card>;
}
