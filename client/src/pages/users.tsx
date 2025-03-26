import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertUserSchema, type User, type InsertUser } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit,
  Trash2,
  User as UserIcon,
  Shield,
  Mail
} from "lucide-react";

type UserFormValues = z.infer<typeof userFormSchema>;

// Extended schema with validation
const userFormSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: InsertUser) => {
      return apiRequest('POST', '/api/users', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { id: number; user: Partial<InsertUser> }) => {
      return apiRequest('PUT', `/api/users/${data.id}`, data.user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form for adding users
  const addUserForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: "field_worker",
      profileImage: null
    },
  });

  // Form for editing users
  const editUserForm = useForm<Partial<UserFormValues>>({
    resolver: zodResolver(userFormSchema.partial()),
    defaultValues: {
      username: editingUser?.username || "",
      fullName: editingUser?.fullName || "",
      email: editingUser?.email || "",
      role: editingUser?.role || "field_worker",
      profileImage: editingUser?.profileImage || null
    },
  });

  // Handle form submission for creating users
  const onSubmitAddUser = (data: UserFormValues) => {
    const { confirmPassword, ...userData } = data;
    createUserMutation.mutate(userData);
  };

  // Handle form submission for editing users
  const onSubmitEditUser = (data: Partial<UserFormValues>) => {
    if (!editingUser) return;
    
    // Remove confirmPassword from the data sent to the API
    const { confirmPassword, ...userData } = data;
    
    // Only include properties that have been changed
    const changes: Partial<InsertUser> = {};
    if (userData.username !== undefined && userData.username !== editingUser.username) {
      changes.username = userData.username;
    }
    if (userData.fullName !== undefined && userData.fullName !== editingUser.fullName) {
      changes.fullName = userData.fullName;
    }
    if (userData.email !== undefined && userData.email !== editingUser.email) {
      changes.email = userData.email;
    }
    if (userData.role !== undefined && userData.role !== editingUser.role) {
      changes.role = userData.role;
    }
    if (userData.password !== undefined && userData.password !== "") {
      changes.password = userData.password;
    }
    if (userData.profileImage !== undefined && userData.profileImage !== editingUser.profileImage) {
      changes.profileImage = userData.profileImage;
    }
    
    // Only update if there are changes
    if (Object.keys(changes).length > 0) {
      updateUserMutation.mutate({ id: editingUser.id, user: changes });
    } else {
      setIsEditDialogOpen(false);
      setEditingUser(null);
    }
  };

  // Set up edit form when editing user changes
  useState(() => {
    if (editingUser) {
      editUserForm.reset({
        username: editingUser.username,
        fullName: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.role,
        profileImage: editingUser.profileImage,
        password: "",
        confirmPassword: ""
      });
    }
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Role related utility functions
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-error bg-opacity-10 text-error';
      case 'manager': return 'bg-warning bg-opacity-10 text-warning';
      case 'field_worker': return 'bg-info bg-opacity-10 text-info';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const formatRoleLabel = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-neutral-800">User Management</h1>
          <p className="text-neutral-600 mt-1">Manage users and their roles</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={addUserForm.handleSubmit(onSubmitAddUser)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fullName" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      className="col-span-3"
                      {...addUserForm.register("fullName")}
                    />
                    {addUserForm.formState.errors.fullName && (
                      <p className="col-span-3 col-start-2 text-sm text-destructive">
                        {addUserForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      className="col-span-3"
                      {...addUserForm.register("username")}
                    />
                    {addUserForm.formState.errors.username && (
                      <p className="col-span-3 col-start-2 text-sm text-destructive">
                        {addUserForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="col-span-3"
                      {...addUserForm.register("email")}
                    />
                    {addUserForm.formState.errors.email && (
                      <p className="col-span-3 col-start-2 text-sm text-destructive">
                        {addUserForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      className="col-span-3"
                      {...addUserForm.register("password")}
                    />
                    {addUserForm.formState.errors.password && (
                      <p className="col-span-3 col-start-2 text-sm text-destructive">
                        {addUserForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="col-span-3"
                      {...addUserForm.register("confirmPassword")}
                    />
                    {addUserForm.formState.errors.confirmPassword && (
                      <p className="col-span-3 col-start-2 text-sm text-destructive">
                        {addUserForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select
                      onValueChange={(value) => addUserForm.setValue("role", value)}
                      defaultValue={addUserForm.getValues("role")}
                    >
                      <SelectTrigger id="role" className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="field_worker">Field Worker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
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
                placeholder="Search users..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 max-w-xs">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>Role: {roleFilter === "all" ? "All" : formatRoleLabel(roleFilter)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="field_worker">Field Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 bg-neutral-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-neutral-200 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-neutral-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-neutral-200 rounded"></div>
                      <div className="h-6 w-20 bg-neutral-200 rounded mt-2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="col-span-full py-8 text-center text-neutral-500">
                <div className="flex flex-col items-center">
                  <UserIcon className="h-12 w-12 mb-2 text-neutral-400" />
                  No users found
                  <p className="text-sm mt-1">Try changing your filters or add a new user</p>
                </div>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const roleBadgeColor = getRoleBadgeColor(user.role);
                
                return (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.profileImage || ""} alt={user.fullName} />
                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{user.fullName}</h3>
                            <p className="text-sm text-neutral-500">@{user.username}</p>
                          </div>
                        </div>
                        <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Update user details
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={editUserForm.handleSubmit(onSubmitEditUser)}>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-fullName" className="text-right">
                                    Full Name
                                  </Label>
                                  <Input
                                    id="edit-fullName"
                                    className="col-span-3"
                                    defaultValue={user.fullName}
                                    {...editUserForm.register("fullName")}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-username" className="text-right">
                                    Username
                                  </Label>
                                  <Input
                                    id="edit-username"
                                    className="col-span-3"
                                    defaultValue={user.username}
                                    {...editUserForm.register("username")}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-email" className="text-right">
                                    Email
                                  </Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    className="col-span-3"
                                    defaultValue={user.email}
                                    {...editUserForm.register("email")}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-password" className="text-right">
                                    New Password
                                  </Label>
                                  <Input
                                    id="edit-password"
                                    type="password"
                                    className="col-span-3"
                                    placeholder="Leave blank to keep current password"
                                    {...editUserForm.register("password")}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-confirmPassword" className="text-right">
                                    Confirm Password
                                  </Label>
                                  <Input
                                    id="edit-confirmPassword"
                                    type="password"
                                    className="col-span-3"
                                    placeholder="Leave blank to keep current password"
                                    {...editUserForm.register("confirmPassword")}
                                  />
                                  {editUserForm.formState.errors.confirmPassword && (
                                    <p className="col-span-3 col-start-2 text-sm text-destructive">
                                      {editUserForm.formState.errors.confirmPassword.message}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-role" className="text-right">
                                    Role
                                  </Label>
                                  <Select
                                    onValueChange={(value) => editUserForm.setValue("role", value)}
                                    defaultValue={user.role}
                                  >
                                    <SelectTrigger id="edit-role" className="col-span-3">
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="manager">Manager</SelectItem>
                                      <SelectItem value="field_worker">Field Worker</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={updateUserMutation.isPending}>
                                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-neutral-500" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-neutral-500" />
                          <span>User ID: {user.id}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleBadgeColor}`}>
                          {formatRoleLabel(user.role)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this user?")) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
