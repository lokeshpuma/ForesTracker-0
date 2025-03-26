import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTaskSchema, type Task, type InsertTask, type User } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  MapPin,
  User as UserIcon,
  Tag
} from "lucide-react";

type TaskFormValues = z.infer<typeof taskFormSchema>;

// Extended schema with validation
const taskFormSchema = insertTaskSchema.extend({
  scheduledDate: z.date({
    required_error: "A scheduled date is required",
  }),
});

export default function Schedule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: InsertTask) => {
      return apiRequest('POST', '/api/tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('PUT', `/api/tasks/${id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task marked as complete",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing tasks
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      priority: "normal",
      status: "pending",
      category: "routine",
      assignedTo: undefined,
      scheduledDate: new Date(),
    },
  });

  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    createTaskMutation.mutate(data);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === "" || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    // Date filtering
    let matchesDate = true;
    const taskDate = new Date(task.scheduledDate);
    const now = new Date();
    
    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      matchesDate = taskDate >= today && taskDate < tomorrow;
    } else if (dateFilter === "upcoming") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      matchesDate = taskDate >= today && taskDate <= nextWeek;
    } else if (dateFilter === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      matchesDate = taskDate < today && task.status !== "completed";
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  // Group tasks by date for the agenda view
  const groupedTasks: Record<string, Task[]> = {};
  
  filteredTasks.forEach(task => {
    const dateKey = format(new Date(task.scheduledDate), 'yyyy-MM-dd');
    if (!groupedTasks[dateKey]) {
      groupedTasks[dateKey] = [];
    }
    groupedTasks[dateKey].push(task);
  });

  // Sort dates for the agenda view
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-neutral-800">Schedule</h1>
          <p className="text-neutral-600 mt-1">Manage forest management activities and tasks</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for the forest management schedule
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      className="col-span-3"
                      {...form.register("title")}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      className="col-span-3"
                      {...form.register("description")}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      className="col-span-3"
                      {...form.register("location")}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select
                      onValueChange={(value) => form.setValue("priority", value)}
                      defaultValue={form.getValues("priority")}
                    >
                      <SelectTrigger id="priority" className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      onValueChange={(value) => form.setValue("category", value)}
                      defaultValue={form.getValues("category")}
                    >
                      <SelectTrigger id="category" className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="planting">Planting</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignedTo" className="text-right">
                      Assign To
                    </Label>
                    <Select
                      onValueChange={(value) => form.setValue("assignedTo", parseInt(value))}
                    >
                      <SelectTrigger id="assignedTo" className="col-span-3">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="scheduledDate" className="text-right">
                      Scheduled Date
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                              setDate(date);
                              if (date) {
                                form.setValue("scheduledDate", date);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
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
                placeholder="Search tasks..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[120px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="truncate">Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="truncate">Priority: {priorityFilter === "all" ? "All" : priorityFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="truncate">Date: {dateFilter === "all" ? "All" : dateFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">Next 7 Days</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
              <TabsTrigger value="agenda" className="data-[state=active]:bg-white">Agenda View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Task</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Priority</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Scheduled Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b animate-pulse">
                          <td className="py-4 px-4">
                            <div className="h-4 w-48 bg-neutral-200 rounded mb-1"></div>
                            <div className="h-3 w-32 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 w-16 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 w-20 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 w-28 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 w-20 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="h-8 w-8 bg-neutral-200 rounded-full ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-neutral-500">
                          <div className="flex flex-col items-center">
                            <CalendarIcon className="h-12 w-12 mb-2 text-neutral-400" />
                            No tasks found
                            <p className="text-sm mt-1">Try changing your filters or add a new task</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const priorityColor = task.priority === 'high' ? 'warning' : 
                                            task.priority === 'low' ? 'info' : 'primary';
                        
                        const categoryColor = task.category === 'routine' ? 'info' :
                                            task.category === 'maintenance' ? 'primary' :
                                            task.category === 'planting' ? 'success' : 'neutral';
                        
                        const statusColor = getStatusColor(task.status);
                        
                        const isOverdue = new Date(task.scheduledDate) < new Date() && task.status !== 'completed';
                        
                        return (
                          <tr key={task.id} className="border-b hover:bg-neutral-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <Checkbox
                                  id={`task-${task.id}`}
                                  checked={task.completed}
                                  onCheckedChange={(checked) => {
                                    if (checked && !task.completed) {
                                      completeTaskMutation.mutate(task.id);
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <div>
                                  <div className={`text-sm font-medium ${task.completed ? 'line-through text-neutral-400' : ''}`}>
                                    {task.title}
                                  </div>
                                  {task.description && (
                                    <div className={`text-xs text-neutral-500 mt-1 ${task.completed ? 'line-through text-neutral-400' : ''}`}>
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${priorityColor} bg-opacity-10 text-${priorityColor} capitalize`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${categoryColor} bg-opacity-10 text-${categoryColor} capitalize`}>
                                {task.category}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">{task.location}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <div className="text-sm">{formatDate(task.scheduledDate)}</div>
                                {isOverdue && (
                                  <div className="text-xs text-error flex items-center mt-1">
                                    <AlertTriangle size={12} className="mr-1" /> Overdue
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor} bg-opacity-10 text-${statusColor} capitalize`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this task?")) {
                                    deleteTaskMutation.mutate(task.id);
                                  }
                                }}
                              >
                                <span className="material-icons text-neutral-500">delete</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="agenda" className="mt-0 p-6">
              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-5 w-40 bg-neutral-200 rounded mb-4"></div>
                      <div className="border rounded-lg p-4 space-y-4">
                        {Array.from({ length: 2 }).map((_, j) => (
                          <div key={j} className="flex">
                            <div className="h-8 w-8 bg-neutral-200 rounded-full mr-4"></div>
                            <div className="flex-1">
                              <div className="h-4 w-48 bg-neutral-200 rounded mb-2"></div>
                              <div className="h-3 w-32 bg-neutral-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="h-12 w-12 mb-2 text-neutral-400" />
                    No tasks found
                    <p className="text-sm mt-1">Try changing your filters or add a new task</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDates.map(dateKey => {
                    const formattedDate = format(new Date(dateKey), 'EEEE, MMMM d, yyyy');
                    const isToday = new Date(dateKey).toDateString() === new Date().toDateString();
                    
                    return (
                      <div key={dateKey}>
                        <div className="flex items-center mb-4">
                          <h3 className="text-lg font-bold">{formattedDate}</h3>
                          {isToday && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">Today</span>
                          )}
                        </div>
                        
                        <Card>
                          <CardContent className="p-4 divide-y">
                            {groupedTasks[dateKey].map(task => {
                              const priorityColor = task.priority === 'high' ? 'warning' : 
                                                  task.priority === 'low' ? 'info' : 'primary';
                              
                              const categoryColor = task.category === 'routine' ? 'info' :
                                                  task.category === 'maintenance' ? 'primary' :
                                                  task.category === 'planting' ? 'success' : 'neutral';
                              
                              const statusColor = getStatusColor(task.status);
                              
                              return (
                                <div key={task.id} className="py-4 first:pt-0 last:pb-0">
                                  <div className="flex items-start">
                                    <Checkbox
                                      id={`agenda-task-${task.id}`}
                                      checked={task.completed}
                                      onCheckedChange={(checked) => {
                                        if (checked && !task.completed) {
                                          completeTaskMutation.mutate(task.id);
                                        }
                                      }}
                                      className="mt-0.5 mr-3"
                                    />
                                    <div className="flex-1">
                                      <div className="flex flex-wrap gap-2 mb-2">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${priorityColor} bg-opacity-10 text-${priorityColor} capitalize`}>
                                          {task.priority}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${categoryColor} bg-opacity-10 text-${categoryColor} capitalize`}>
                                          {task.category}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${statusColor} bg-opacity-10 text-${statusColor} capitalize`}>
                                          {task.status}
                                        </span>
                                      </div>
                                      
                                      <h4 className={`text-base font-medium ${task.completed ? 'line-through text-neutral-400' : ''}`}>
                                        {task.title}
                                      </h4>
                                      
                                      {task.description && (
                                        <p className={`text-sm text-neutral-600 mt-1 ${task.completed ? 'line-through text-neutral-400' : ''}`}>
                                          {task.description}
                                        </p>
                                      )}
                                      
                                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-neutral-500">
                                        <div className="flex items-center">
                                          <MapPin size={12} className="mr-1" />
                                          {task.location}
                                        </div>
                                        
                                        {task.assignedTo && (
                                          <div className="flex items-center">
                                            <UserIcon size={12} className="mr-1" />
                                            {users.find(u => u.id === task.assignedTo)?.fullName || `User #${task.assignedTo}`}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to delete this task?")) {
                                          deleteTaskMutation.mutate(task.id);
                                        }
                                      }}
                                    >
                                      <span className="material-icons text-neutral-500">delete</span>
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
