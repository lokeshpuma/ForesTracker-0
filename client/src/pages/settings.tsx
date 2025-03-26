import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Globe, 
  Bell, 
  User, 
  Shield, 
  Database, 
  Mail, 
  HelpCircle,
  AlertTriangle
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  
  // State for general settings
  const [systemName, setSystemName] = useState("Forest Management System");
  const [organizationName, setOrganizationName] = useState("Forest Department");
  const [defaultRegion, setDefaultRegion] = useState("north");
  const [timeZone, setTimeZone] = useState("UTC-7");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  
  // State for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);
  
  // State for appearance settings
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  // Mock mutation for saving settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      // In a real implementation, this would make an API call to save settings
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSaveSettings = () => {
    const settings = {
      general: {
        systemName,
        organizationName,
        defaultRegion,
        timeZone,
        dateFormat
      },
      notifications: {
        emailNotifications,
        taskReminders,
        criticalAlerts,
        weeklyReports,
        systemUpdates
      },
      appearance: {
        sidebarCollapsed,
        darkMode,
        highContrastMode,
        compactMode
      }
    };
    
    saveSettingsMutation.mutate(settings);
  };

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-neutral-800">Settings</h1>
          <p className="text-neutral-600 mt-1">Configure your forest management system</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={handleSaveSettings} 
            className="flex items-center gap-1" 
            disabled={saveSettingsMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <nav className="flex flex-col">
              <button 
                className={cn(
                  "flex items-center px-4 py-3 text-sm border-l-2 transition-colors", 
                  activeTab === "general" 
                    ? "border-primary bg-primary bg-opacity-5 text-primary font-medium" 
                    : "border-transparent hover:bg-neutral-50 text-neutral-700"
                )}
                onClick={() => setActiveTab("general")}
              >
                <Globe className="h-4 w-4 mr-3" />
                General Settings
              </button>
              
              <button 
                className={cn(
                  "flex items-center px-4 py-3 text-sm border-l-2 transition-colors", 
                  activeTab === "notifications" 
                    ? "border-primary bg-primary bg-opacity-5 text-primary font-medium" 
                    : "border-transparent hover:bg-neutral-50 text-neutral-700"
                )}
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="h-4 w-4 mr-3" />
                Notifications
              </button>
              
              <button 
                className={cn(
                  "flex items-center px-4 py-3 text-sm border-l-2 transition-colors", 
                  activeTab === "appearance" 
                    ? "border-primary bg-primary bg-opacity-5 text-primary font-medium" 
                    : "border-transparent hover:bg-neutral-50 text-neutral-700"
                )}
                onClick={() => setActiveTab("appearance")}
              >
                <User className="h-4 w-4 mr-3" />
                Appearance
              </button>
              
              <button 
                className={cn(
                  "flex items-center px-4 py-3 text-sm border-l-2 transition-colors", 
                  activeTab === "permissions" 
                    ? "border-primary bg-primary bg-opacity-5 text-primary font-medium" 
                    : "border-transparent hover:bg-neutral-50 text-neutral-700"
                )}
                onClick={() => setActiveTab("permissions")}
              >
                <Shield className="h-4 w-4 mr-3" />
                Permissions & Access
              </button>
              
              <button 
                className={cn(
                  "flex items-center px-4 py-3 text-sm border-l-2 transition-colors", 
                  activeTab === "data" 
                    ? "border-primary bg-primary bg-opacity-5 text-primary font-medium" 
                    : "border-transparent hover:bg-neutral-50 text-neutral-700"
                )}
                onClick={() => setActiveTab("data")}
              >
                <Database className="h-4 w-4 mr-3" />
                Data Management
              </button>
              
              <button 
                className={cn(
                  "flex items-center px-4 py-3 text-sm border-l-2 transition-colors", 
                  activeTab === "support" 
                    ? "border-primary bg-primary bg-opacity-5 text-primary font-medium" 
                    : "border-transparent hover:bg-neutral-50 text-neutral-700"
                )}
                onClick={() => setActiveTab("support")}
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Help & Support
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div>
                <h2 className="text-xl font-medium mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="system-name">System Name</Label>
                    <Input 
                      id="system-name" 
                      value={systemName} 
                      onChange={(e) => setSystemName(e.target.value)} 
                    />
                    <p className="text-sm text-neutral-500">This name will appear in the browser tab and system reports.</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="organization-name">Organization Name</Label>
                    <Input 
                      id="organization-name" 
                      value={organizationName} 
                      onChange={(e) => setOrganizationName(e.target.value)} 
                    />
                    <p className="text-sm text-neutral-500">Your organization or department name.</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="default-region">Default Region</Label>
                    <Select value={defaultRegion} onValueChange={setDefaultRegion}>
                      <SelectTrigger id="default-region">
                        <SelectValue placeholder="Select a default region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north">North Region</SelectItem>
                        <SelectItem value="east">East Region</SelectItem>
                        <SelectItem value="south">South Region</SelectItem>
                        <SelectItem value="west">West Region</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-500">Default region to display on maps and reports.</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select a time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-12">UTC-12:00</SelectItem>
                        <SelectItem value="UTC-11">UTC-11:00</SelectItem>
                        <SelectItem value="UTC-10">UTC-10:00</SelectItem>
                        <SelectItem value="UTC-9">UTC-09:00</SelectItem>
                        <SelectItem value="UTC-8">UTC-08:00</SelectItem>
                        <SelectItem value="UTC-7">UTC-07:00</SelectItem>
                        <SelectItem value="UTC-6">UTC-06:00</SelectItem>
                        <SelectItem value="UTC-5">UTC-05:00</SelectItem>
                        <SelectItem value="UTC-4">UTC-04:00</SelectItem>
                        <SelectItem value="UTC-3">UTC-03:00</SelectItem>
                        <SelectItem value="UTC-2">UTC-02:00</SelectItem>
                        <SelectItem value="UTC-1">UTC-01:00</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="UTC+1">UTC+01:00</SelectItem>
                        <SelectItem value="UTC+2">UTC+02:00</SelectItem>
                        <SelectItem value="UTC+3">UTC+03:00</SelectItem>
                        <SelectItem value="UTC+4">UTC+04:00</SelectItem>
                        <SelectItem value="UTC+5">UTC+05:00</SelectItem>
                        <SelectItem value="UTC+6">UTC+06:00</SelectItem>
                        <SelectItem value="UTC+7">UTC+07:00</SelectItem>
                        <SelectItem value="UTC+8">UTC+08:00</SelectItem>
                        <SelectItem value="UTC+9">UTC+09:00</SelectItem>
                        <SelectItem value="UTC+10">UTC+10:00</SelectItem>
                        <SelectItem value="UTC+11">UTC+11:00</SelectItem>
                        <SelectItem value="UTC+12">UTC+12:00</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-500">System time zone for scheduling and reports.</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select a date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                        <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-500">How dates will be displayed throughout the system.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="block">Email Notifications</Label>
                        <p className="text-sm text-neutral-500">Receive notifications via email</p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={emailNotifications} 
                        onCheckedChange={setEmailNotifications} 
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-5">
                    <h3 className="text-md font-medium">Notification Types</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="task-reminders" className="block">Task Reminders</Label>
                        <p className="text-sm text-neutral-500">Notifications about upcoming and due tasks</p>
                      </div>
                      <Switch 
                        id="task-reminders" 
                        checked={taskReminders} 
                        onCheckedChange={setTaskReminders} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="critical-alerts" className="block">Critical Alerts</Label>
                        <p className="text-sm text-neutral-500">Immediate alerts for critical forest conditions</p>
                      </div>
                      <Switch 
                        id="critical-alerts" 
                        checked={criticalAlerts} 
                        onCheckedChange={setCriticalAlerts} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekly-reports" className="block">Weekly Reports</Label>
                        <p className="text-sm text-neutral-500">Weekly summary of forest activities and metrics</p>
                      </div>
                      <Switch 
                        id="weekly-reports" 
                        checked={weeklyReports} 
                        onCheckedChange={setWeeklyReports} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="system-updates" className="block">System Updates</Label>
                        <p className="text-sm text-neutral-500">Notifications about system maintenance and updates</p>
                      </div>
                      <Switch 
                        id="system-updates" 
                        checked={systemUpdates} 
                        onCheckedChange={setSystemUpdates} 
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notification-email">Notification Email</Label>
                    <Input id="notification-email" type="email" placeholder="Your email address" />
                    <p className="text-sm text-neutral-500">Email address to receive notifications</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sidebar-collapsed" className="block">Collapsed Sidebar</Label>
                      <p className="text-sm text-neutral-500">Show icons only in the sidebar navigation</p>
                    </div>
                    <Switch 
                      id="sidebar-collapsed" 
                      checked={sidebarCollapsed} 
                      onCheckedChange={setSidebarCollapsed} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode" className="block">Dark Mode</Label>
                      <p className="text-sm text-neutral-500">Switch between light and dark color theme</p>
                    </div>
                    <Switch 
                      id="dark-mode" 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="high-contrast" className="block">High Contrast Mode</Label>
                      <p className="text-sm text-neutral-500">Increase contrast for better visibility</p>
                    </div>
                    <Switch 
                      id="high-contrast" 
                      checked={highContrastMode} 
                      onCheckedChange={setHighContrastMode} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-mode" className="block">Compact Mode</Label>
                      <p className="text-sm text-neutral-500">Reduce padding and margins for denser layout</p>
                    </div>
                    <Switch 
                      id="compact-mode" 
                      checked={compactMode} 
                      onCheckedChange={setCompactMode} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="theme-color">Theme Color</Label>
                    <div className="flex gap-4 mt-2">
                      <button className="w-8 h-8 bg-green-700 rounded-full border-2 border-white shadow-sm"></button>
                      <button className="w-8 h-8 bg-blue-700 rounded-full"></button>
                      <button className="w-8 h-8 bg-amber-700 rounded-full"></button>
                      <button className="w-8 h-8 bg-red-700 rounded-full"></button>
                      <button className="w-8 h-8 bg-purple-700 rounded-full"></button>
                      <button className="w-8 h-8 bg-neutral-700 rounded-full"></button>
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">Select the primary color for the interface</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Permissions & Access */}
            {activeTab === "permissions" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Permissions & Access Control</h2>
                
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3 items-start mb-6">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Admin Access Required</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        You need administrative privileges to modify these settings. Contact your system administrator for assistance.
                      </p>
                    </div>
                  </div>
                  
                  <div className="opacity-60 pointer-events-none">
                    <div className="grid gap-2 mb-6">
                      <Label htmlFor="role-settings">Default Role for New Users</Label>
                      <Select defaultValue="field_worker">
                        <SelectTrigger id="role-settings">
                          <SelectValue placeholder="Select default role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="field_worker">Field Worker</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-neutral-500">Default role assigned to newly created user accounts</p>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-md font-medium mt-6 mb-4">Role Permissions</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Admin Role</h4>
                        <div className="grid gap-2">
                          <div className="flex items-center">
                            <input type="checkbox" id="admin-user-manage" className="mr-2" checked readOnly />
                            <Label htmlFor="admin-user-manage">User Management</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="admin-settings" className="mr-2" checked readOnly />
                            <Label htmlFor="admin-settings">Settings Configuration</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="admin-data" className="mr-2" checked readOnly />
                            <Label htmlFor="admin-data">Data Management</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Manager Role</h4>
                        <div className="grid gap-2">
                          <div className="flex items-center">
                            <input type="checkbox" id="manager-task-create" className="mr-2" checked readOnly />
                            <Label htmlFor="manager-task-create">Create Tasks</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="manager-reports" className="mr-2" checked readOnly />
                            <Label htmlFor="manager-reports">Generate Reports</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="manager-inventory" className="mr-2" checked readOnly />
                            <Label htmlFor="manager-inventory">Manage Inventory</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Field Worker Role</h4>
                        <div className="grid gap-2">
                          <div className="flex items-center">
                            <input type="checkbox" id="worker-view-tasks" className="mr-2" checked readOnly />
                            <Label htmlFor="worker-view-tasks">View Assigned Tasks</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="worker-update-tasks" className="mr-2" checked readOnly />
                            <Label htmlFor="worker-update-tasks">Update Task Status</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="worker-submit-reports" className="mr-2" checked readOnly />
                            <Label htmlFor="worker-submit-reports">Submit Activity Reports</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Data Management */}
            {activeTab === "data" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Data Management</h2>
                
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3 items-start mb-6">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Admin Access Required</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        You need administrative privileges to modify these settings. Contact your system administrator for assistance.
                      </p>
                    </div>
                  </div>
                  
                  <div className="opacity-60 pointer-events-none">
                    <div className="grid gap-4 mb-6">
                      <h3 className="text-md font-medium">Data Import & Export</h3>
                      
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                          <span className="material-icons text-sm">upload</span>
                          Import Data
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <span className="material-icons text-sm">download</span>
                          Export Data
                        </Button>
                      </div>
                      
                      <p className="text-sm text-neutral-500">Import data from CSV or export system data for backup</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-2 mt-6">
                      <h3 className="text-md font-medium mb-3">Data Retention</h3>
                      
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="block">Activity Logs</Label>
                            <p className="text-sm text-neutral-500">How long to keep activity logs</p>
                          </div>
                          <Select defaultValue="1-year">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3-months">3 Months</SelectItem>
                              <SelectItem value="6-months">6 Months</SelectItem>
                              <SelectItem value="1-year">1 Year</SelectItem>
                              <SelectItem value="3-years">3 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="block">Completed Tasks</Label>
                            <p className="text-sm text-neutral-500">How long to keep completed tasks</p>
                          </div>
                          <Select defaultValue="1-year">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3-months">3 Months</SelectItem>
                              <SelectItem value="6-months">6 Months</SelectItem>
                              <SelectItem value="1-year">1 Year</SelectItem>
                              <SelectItem value="3-years">3 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="block">Generated Reports</Label>
                            <p className="text-sm text-neutral-500">How long to keep generated reports</p>
                          </div>
                          <Select defaultValue="3-years">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3-months">3 Months</SelectItem>
                              <SelectItem value="6-months">6 Months</SelectItem>
                              <SelectItem value="1-year">1 Year</SelectItem>
                              <SelectItem value="3-years">3 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="grid gap-2">
                      <h3 className="text-md font-medium text-destructive mb-3">Danger Zone</h3>
                      
                      <div className="border border-destructive border-dashed rounded-md p-4">
                        <h4 className="text-sm font-medium text-destructive">Reset System Data</h4>
                        <p className="text-sm text-neutral-600 mt-1 mb-3">
                          This will permanently delete all data in the system. This action cannot be undone.
                        </p>
                        <Button variant="destructive" size="sm">Reset All Data</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Help & Support */}
            {activeTab === "support" && (
              <div>
                <h2 className="text-xl font-medium mb-6">Help & Support</h2>
                
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <h3 className="text-md font-medium">Contact Support</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="support-subject">Subject</Label>
                        <Input id="support-subject" placeholder="Enter subject" />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="support-message">Message</Label>
                        <Textarea 
                          id="support-message" 
                          placeholder="Describe your issue or question" 
                          className="min-h-[150px]" 
                        />
                      </div>
                      
                      <Button className="w-fit">Submit Support Request</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4">
                    <h3 className="text-md font-medium">Documentation & Resources</h3>
                    
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-primary">description</span>
                        <a href="#" className="text-primary hover:underline">User Manual</a>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-primary">school</span>
                        <a href="#" className="text-primary hover:underline">Training Videos</a>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-primary">help_outline</span>
                        <a href="#" className="text-primary hover:underline">FAQ</a>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-primary">support_agent</span>
                        <a href="#" className="text-primary hover:underline">Live Chat Support</a>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4">
                    <h3 className="text-md font-medium">System Information</h3>
                    
                    <div className="bg-neutral-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-neutral-500">Version:</p>
                          <p className="font-medium">2.5.1</p>
                        </div>
                        
                        <div>
                          <p className="text-neutral-500">Last Updated:</p>
                          <p className="font-medium">June 10, 2023</p>
                        </div>
                        
                        <div>
                          <p className="text-neutral-500">Server Status:</p>
                          <p className="font-medium text-success">Online</p>
                        </div>
                        
                        <div>
                          <p className="text-neutral-500">Database Status:</p>
                          <p className="font-medium text-success">Connected</p>
                        </div>
                        
                        <div>
                          <p className="text-neutral-500">License:</p>
                          <p className="font-medium">Professional</p>
                        </div>
                        
                        <div>
                          <p className="text-neutral-500">Expiration:</p>
                          <p className="font-medium">December 31, 2023</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-fit">Check for Updates</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
