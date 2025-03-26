import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor, formatNumberWithCommas, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Inventory, type InsertInventory } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventorySchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  ArrowUpDown
} from "lucide-react";

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

// Extended schema with validation
const inventoryFormSchema = insertInventorySchema.extend({
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
});

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const { toast } = useToast();

  // Fetch inventory items
  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory'],
  });

  // Create inventory item mutation
  const createInventoryMutation = useMutation({
    mutationFn: (data: InsertInventory) => {
      return apiRequest('POST', '/api/inventory', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update inventory item mutation
  const updateInventoryMutation = useMutation({
    mutationFn: (data: { id: number; item: Partial<InsertInventory> }) => {
      return apiRequest('PUT', `/api/inventory/${data.id}`, data.item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
      setEditingItem(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete inventory item mutation
  const deleteInventoryMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete inventory item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing inventory items
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      type: editingItem?.type || "",
      name: editingItem?.name || "",
      quantity: editingItem?.quantity || 0,
      unit: editingItem?.unit || "",
      status: editingItem?.status || "available",
    },
  });

  // Reset form when editing item changes
  useState(() => {
    if (editingItem) {
      form.reset({
        type: editingItem.type,
        name: editingItem.name,
        quantity: editingItem.quantity,
        unit: editingItem.unit,
        status: editingItem.status,
      });
    } else {
      form.reset({
        type: "",
        name: "",
        quantity: 0,
        unit: "",
        status: "available",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: InventoryFormValues) => {
    if (editingItem) {
      updateInventoryMutation.mutate({ id: editingItem.id, item: data });
    } else {
      createInventoryMutation.mutate(data);
    }
  };

  // Filter inventory items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique types and statuses for filters
  const types = ["all", ...new Set(inventory.map(item => item.type))];
  const statuses = ["all", ...new Set(inventory.map(item => item.status))];

  // Icons for inventory types
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "plant": return "grass";
      case "water": return "water_drop";
      case "fertilizer": return "compost";
      case "tools": return "construction";
      default: return "inventory_2";
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-neutral-800">Inventory Management</h1>
          <p className="text-neutral-600 mt-1">Manage forest resources and supplies</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription>
                  Add a new resource to the inventory
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      onValueChange={(value) => form.setValue("type", value)}
                      defaultValue={form.getValues("type")}
                    >
                      <SelectTrigger id="type" className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plant">Plant</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="fertilizer">Fertilizer</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      {...form.register("name")}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      className="col-span-3"
                      {...form.register("quantity", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unit
                    </Label>
                    <Input
                      id="unit"
                      className="col-span-3"
                      {...form.register("unit")}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      onValueChange={(value) => form.setValue("status", value)}
                      defaultValue={form.getValues("status")}
                    >
                      <SelectTrigger id="status" className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="low_supply">Low Supply</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="depleted">Depleted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createInventoryMutation.isPending}>
                    {createInventoryMutation.isPending ? "Saving..." : "Save Resource"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <Input
                placeholder="Search resources..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[120px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="truncate">Type: {typeFilter === "all" ? "All" : typeFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="truncate">Status: {statusFilter === "all" ? "All" : statusFilter.replace("_", " ")}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Statuses" : status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="w-full justify-start p-2 bg-neutral-50 border-b rounded-none">
              <TabsTrigger value="list" className="data-[state=active]:bg-white">List View</TabsTrigger>
              <TabsTrigger value="grid" className="data-[state=active]:bg-white">Grid View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer">
                          Type <ArrowUpDown size={16} className="ml-1" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer">
                          Name <ArrowUpDown size={16} className="ml-1" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer">
                          Quantity <ArrowUpDown size={16} className="ml-1" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer">
                          Status <ArrowUpDown size={16} className="ml-1" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <div className="flex items-center cursor-pointer">
                          Last Updated <ArrowUpDown size={16} className="ml-1" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b animate-pulse">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
                              <div className="h-4 w-20 bg-neutral-200 rounded ml-3"></div>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="h-6 w-20 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="h-4 w-28 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="h-8 w-20 bg-neutral-200 rounded ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-500">
                          <div className="flex flex-col items-center">
                            <span className="material-icons text-4xl mb-2">inventory_2</span>
                            No resources found
                            <p className="text-sm mt-1">Try changing your filters or add a new resource</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => {
                        const statusColor = getStatusColor(item.status);
                        return (
                          <tr key={item.id} className="border-b hover:bg-neutral-50">
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="material-icons text-primary mr-2">{getTypeIcon(item.type)}</span>
                                <span className="text-sm font-medium capitalize">{item.type}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="text-sm font-medium">{item.name}</span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="text-sm font-mono">
                                {formatNumberWithCommas(item.quantity)} {item.unit}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor} bg-opacity-10 text-${statusColor} capitalize`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="text-sm text-neutral-600">{formatDate(item.lastUpdated)}</span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-right">
                              <div className="flex justify-end">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => setEditingItem(item)}
                                    >
                                      <Edit size={16} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Resource</DialogTitle>
                                      <DialogDescription>
                                        Update resource details
                                      </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={form.handleSubmit(onSubmit)}>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-type" className="text-right">
                                            Type
                                          </Label>
                                          <Select
                                            onValueChange={(value) => form.setValue("type", value)}
                                            defaultValue={item.type}
                                          >
                                            <SelectTrigger id="edit-type" className="col-span-3">
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="plant">Plant</SelectItem>
                                              <SelectItem value="water">Water</SelectItem>
                                              <SelectItem value="fertilizer">Fertilizer</SelectItem>
                                              <SelectItem value="tools">Tools</SelectItem>
                                              <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-name" className="text-right">
                                            Name
                                          </Label>
                                          <Input
                                            id="edit-name"
                                            className="col-span-3"
                                            defaultValue={item.name}
                                            {...form.register("name")}
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-quantity" className="text-right">
                                            Quantity
                                          </Label>
                                          <Input
                                            id="edit-quantity"
                                            type="number"
                                            className="col-span-3"
                                            defaultValue={item.quantity}
                                            {...form.register("quantity", { valueAsNumber: true })}
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-unit" className="text-right">
                                            Unit
                                          </Label>
                                          <Input
                                            id="edit-unit"
                                            className="col-span-3"
                                            defaultValue={item.unit}
                                            {...form.register("unit")}
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-status" className="text-right">
                                            Status
                                          </Label>
                                          <Select
                                            onValueChange={(value) => form.setValue("status", value)}
                                            defaultValue={item.status}
                                          >
                                            <SelectTrigger id="edit-status" className="col-span-3">
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="available">Available</SelectItem>
                                              <SelectItem value="low_supply">Low Supply</SelectItem>
                                              <SelectItem value="maintenance">Maintenance</SelectItem>
                                              <SelectItem value="depleted">Depleted</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button type="submit" disabled={updateInventoryMutation.isPending}>
                                          {updateInventoryMutation.isPending ? "Updating..." : "Update Resource"}
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this resource?")) {
                                      deleteInventoryMutation.mutate(item.id);
                                    }
                                  }}
                                >
                                  <Trash2 size={16} className="text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="grid" className="mt-0 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                          <div className="ml-3">
                            <div className="h-5 w-28 bg-neutral-200 rounded mb-1"></div>
                            <div className="h-4 w-20 bg-neutral-200 rounded"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-neutral-200 rounded"></div>
                          <div className="h-4 w-3/4 bg-neutral-200 rounded"></div>
                          <div className="h-6 w-1/3 bg-neutral-200 rounded mt-4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredInventory.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-neutral-500">
                    <div className="flex flex-col items-center">
                      <span className="material-icons text-4xl mb-2">inventory_2</span>
                      No resources found
                      <p className="text-sm mt-1">Try changing your filters or add a new resource</p>
                    </div>
                  </div>
                ) : (
                  filteredInventory.map((item) => {
                    const statusColor = getStatusColor(item.status);
                    return (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                              <div className={`h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center`}>
                                <span className="material-icons text-primary">{getTypeIcon(item.type)}</span>
                              </div>
                              <div className="ml-3">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-neutral-500 capitalize">{item.type}</p>
                              </div>
                            </div>
                            <div className="flex">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this resource?")) {
                                    deleteInventoryMutation.mutate(item.id);
                                  }
                                }}
                              >
                                <Trash2 size={16} className="text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="text-neutral-500">Quantity:</span>
                              <span className="font-mono font-medium">{formatNumberWithCommas(item.quantity)} {item.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Last Updated:</span>
                              <span>{formatDate(item.lastUpdated)}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor} bg-opacity-10 text-${statusColor} capitalize`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
