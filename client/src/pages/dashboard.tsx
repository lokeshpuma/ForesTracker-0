import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  formatNumberWithCommas, 
  getStatusColor,
  formatTimeAgo 
} from "@/lib/utils";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  FileDownIcon, 
  FullscreenIcon, 
  LayersIcon, 
  MinusIcon, 
  MoreVerticalIcon, 
  PlusIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Metric, type Location, type Inventory, type Activity, type Task } from "@shared/schema";

// Tree health chart data
const treeHealthData = [
  { month: 'Jan', healthIndex: 82, growthRate: 1.2, disease: 4.1 },
  { month: 'Feb', healthIndex: 83.1, growthRate: 1.5, disease: 3.9 },
  { month: 'Mar', healthIndex: 84.0, growthRate: 1.7, disease: 3.7 },
  { month: 'Apr', healthIndex: 85.2, growthRate: 2.1, disease: 3.5 },
  { month: 'May', healthIndex: 87.5, growthRate: 2.4, disease: 3.1 },
  { month: 'Jun', healthIndex: 88.1, growthRate: 2.6, disease: 2.9 },
];

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState("north");
  
  // Fetch metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery<Metric[]>({
    queryKey: ['/api/metrics', 'latest=true'],
  });

  // Fetch monitored locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  // Fetch inventory items
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory'],
  });

  // Fetch recent activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', 'limit=4'],
  });

  // Fetch upcoming tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', 'limit=3'],
  });

  return (
    <AppLayout>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-neutral-800">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Overview of forest health and management activities</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <div className="relative">
            <Select defaultValue={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north">North Region</SelectItem>
                <SelectItem value="east">East Region</SelectItem>
                <SelectItem value="south">South Region</SelectItem>
                <SelectItem value="west">West Region</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="default" className="flex items-center gap-1">
            <FileDownIcon className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricsLoading ? (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white rounded-lg shadow border-l-4 border-neutral-300 animate-pulse">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-24"></div>
                    <div className="h-6 bg-neutral-200 rounded w-32"></div>
                    <div className="h-4 bg-neutral-200 rounded w-36"></div>
                  </div>
                  <div className="p-2 bg-neutral-200 rounded-full h-10 w-10"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          metrics.map((metric) => {
            const trendIcon = metric.trend === 'up' ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />;
            const trendColor = metric.trend === 'up' ? 
              (metric.category === 'risk' ? 'text-error' : 'text-success') : 
              (metric.category === 'risk' ? 'text-success' : 'text-error');
            
            const borderColor = metric.category === 'coverage' ? 'border-primary' :
                                metric.category === 'species' ? 'border-info' :
                                metric.category === 'risk' ? 'border-warning' : 'border-success';
            
            const bgColor = metric.category === 'coverage' ? 'bg-primary-light bg-opacity-10' :
                            metric.category === 'species' ? 'bg-info bg-opacity-10' :
                            metric.category === 'risk' ? 'bg-warning bg-opacity-10' : 'bg-success bg-opacity-10';
            
            const textColor = metric.category === 'coverage' ? 'text-primary' :
                              metric.category === 'species' ? 'text-info' :
                              metric.category === 'risk' ? 'text-warning' : 'text-success';
            
            return (
              <Card key={metric.id} className={`bg-white rounded-lg shadow border-l-4 ${borderColor}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-neutral-600 text-sm">{metric.name}</p>
                      <h3 className="text-2xl font-mono font-bold mt-1">
                        {formatNumberWithCommas(metric.value)}
                        {metric.unit ? ` ${metric.unit}` : ''}
                      </h3>
                      <p className={`text-sm ${trendColor} flex items-center mt-1`}>
                        {trendIcon}
                        {metric.changePercentage}% from last period
                      </p>
                    </div>
                    <div className={`p-2 ${bgColor} rounded-full`}>
                      <span className={`material-icons ${textColor}`}>{metric.icon}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Forest Map */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-lg shadow overflow-hidden">
            <CardHeader className="p-4 border-b border-neutral-200 flex flex-row items-center justify-between">
              <CardTitle className="font-sans font-bold text-neutral-800">Forest Map</CardTitle>
              <div className="flex">
                <Button variant="ghost" size="icon">
                  <FullscreenIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVerticalIcon className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            
            {/* Map content */}
            <div className="relative">
              <div className="map-placeholder h-80 w-full bg-neutral-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-icons text-5xl text-neutral-400">map</span>
                  <p className="text-neutral-500 mt-2">Interactive Forest Map</p>
                  <p className="text-xs text-neutral-400">Leaflet map will be displayed here</p>
                </div>
              </div>
              
              {/* Map controls overlay */}
              <div className="absolute top-4 left-4 bg-white rounded-md shadow p-2 flex flex-col">
                <Button variant="ghost" size="icon" className="mb-1">
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="mb-1">
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <LayersIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Legend overlay */}
              <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-md shadow p-3">
                <h4 className="text-sm font-medium text-neutral-800 mb-2">Map Legend</h4>
                <div className="flex items-center mb-1">
                  <span className="w-3 h-3 rounded-full bg-success mr-2"></span>
                  <span className="text-xs text-neutral-700">Healthy Growth</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-3 h-3 rounded-full bg-warning mr-2"></span>
                  <span className="text-xs text-neutral-700">Monitoring Needed</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="w-3 h-3 rounded-full bg-error mr-2"></span>
                  <span className="text-xs text-neutral-700">Critical Areas</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-neutral-400 mr-2"></span>
                  <span className="text-xs text-neutral-700">Unclassified</span>
                </div>
              </div>
            </div>
            
            {/* Map locations list */}
            <div className="p-4 border-t border-neutral-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-neutral-800">Monitored Locations</h3>
                <Button variant="link" className="text-sm text-primary">View All</Button>
              </div>
              
              <div className="space-y-3">
                {locationsLoading ? (
                  // Skeleton loading
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center py-2 px-3 rounded-md hover:bg-neutral-50 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-neutral-300 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-neutral-200 rounded w-36 mb-1"></div>
                        <div className="h-3 bg-neutral-200 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-neutral-200 rounded w-28"></div>
                    </div>
                  ))
                ) : (
                  locations.slice(0, 3).map((location) => {
                    const statusColor = getStatusColor(location.status);
                    return (
                      <div key={location.id} className="flex items-center py-2 px-3 rounded-md hover:bg-neutral-50 cursor-pointer">
                        <div className={`w-2 h-2 rounded-full bg-${statusColor} mr-3`}></div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-neutral-800">{location.name}</h4>
                          <p className="text-xs text-neutral-600">Last updated: {formatTimeAgo(location.lastUpdated)}</p>
                        </div>
                        <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded">
                          {location.coordinates.coordinates[1].toFixed(1)}°N, {location.coordinates.coordinates[0].toFixed(1)}°W
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
          
          {/* Resource Management */}
          <Card className="bg-white rounded-lg shadow mt-6">
            <CardHeader className="p-4 border-b border-neutral-200 flex flex-row items-center justify-between">
              <CardTitle className="font-sans font-bold text-neutral-800">Resource Management</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">This Month</Button>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Resource Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {inventoryLoading ? (
                      // Skeleton loading
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-5 w-5 bg-neutral-200 rounded-full mr-2"></div>
                              <div className="h-4 bg-neutral-200 rounded w-24"></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="h-4 bg-neutral-200 rounded w-20"></div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="h-5 bg-neutral-200 rounded w-16"></div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="h-4 bg-neutral-200 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="h-4 bg-neutral-200 rounded w-16 ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      inventory.map((item) => {
                        const statusColor = getStatusColor(item.status);
                        
                        let icon = "grass";
                        if (item.type === "water") icon = "water_drop";
                        if (item.type === "fertilizer") icon = "compost";
                        if (item.type === "tools") icon = "construction";
                        
                        return (
                          <tr key={item.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="material-icons text-primary mr-2">{icon}</span>
                                <span className="text-sm font-medium text-neutral-800">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm text-neutral-700 font-mono">
                                {formatNumberWithCommas(item.quantity)} {item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor} bg-opacity-10 text-${statusColor}`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                              {format(new Date(item.lastUpdated), 'yyyy-MM-dd')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="link" className="text-primary">Manage</Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Activity & Reports */}
        <div className="space-y-6">
          {/* Tree Health Chart */}
          <Card className="bg-white rounded-lg shadow overflow-hidden">
            <CardHeader className="p-4 border-b border-neutral-200">
              <CardTitle className="font-sans font-bold text-neutral-800">Tree Health Metrics</CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={treeHealthData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="healthIndex"
                      stroke="hsl(var(--success))"
                      fill="hsl(var(--success))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-neutral-50 rounded-md p-3">
                  <p className="text-xs text-neutral-600">Growth Rate</p>
                  <p className="text-lg font-bold text-neutral-800 mt-1">+2.4%</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-success flex items-center">
                      <ArrowUpIcon className="h-3 w-3 mr-1" /> 0.8%
                    </span>
                  </div>
                </div>
                
                <div className="bg-neutral-50 rounded-md p-3">
                  <p className="text-xs text-neutral-600">Disease Incidence</p>
                  <p className="text-lg font-bold text-neutral-800 mt-1">3.1%</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-success flex items-center">
                      <ArrowDownIcon className="h-3 w-3 mr-1" /> 1.2%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activities */}
          <Card className="bg-white rounded-lg shadow overflow-hidden">
            <CardHeader className="p-4 border-b border-neutral-200 flex flex-row items-center justify-between">
              <CardTitle className="font-sans font-bold text-neutral-800">Recent Activities</CardTitle>
              <Button variant="link" className="text-primary">View All</Button>
            </CardHeader>
            
            <CardContent className="p-2">
              <div className="flow-root">
                <ul className="divide-y divide-neutral-200">
                  {activitiesLoading ? (
                    // Skeleton loading
                    Array.from({ length: 4 }).map((_, i) => (
                      <li key={i} className="py-3 px-2 animate-pulse">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                            <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                            <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    activities.map((activity) => {
                      let iconColor = "";
                      let icon = "";
                      
                      if (activity.type === "planting") {
                        iconColor = "primary";
                        icon = "forest";
                      } else if (activity.type === "monitoring") {
                        iconColor = "info";
                        icon = "monitoring";
                      } else if (activity.type === "maintenance") {
                        if (activity.description.toLowerCase().includes("pest")) {
                          iconColor = "warning";
                          icon = "bug_report";
                        } else {
                          iconColor = "success";
                          icon = "water";
                        }
                      }
                      
                      return (
                        <li key={activity.id} className="py-3 px-2 hover:bg-neutral-50 rounded-md">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 rounded-full bg-${iconColor}-light bg-opacity-10 flex items-center justify-center`}>
                                <span className={`material-icons text-${iconColor} text-sm`}>{icon}</span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-neutral-800">{activity.description}</p>
                              <p className="text-xs text-neutral-500">{activity.location} - {activity.team}</p>
                              <span className="text-xs text-neutral-400">{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Tasks */}
          <Card className="bg-white rounded-lg shadow overflow-hidden">
            <CardHeader className="p-4 border-b border-neutral-200 flex flex-row items-center justify-between">
              <CardTitle className="font-sans font-bold text-neutral-800">Upcoming Tasks</CardTitle>
              <Button variant="default" size="sm" className="flex items-center gap-1">
                <span className="material-icons text-sm">add</span> 
                New Task
              </Button>
            </CardHeader>
            
            <div className="divide-y divide-neutral-200">
              {tasksLoading ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-neutral-200 rounded"></div>
                      <div className="ml-3 flex-1 space-y-1">
                        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-5 bg-neutral-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : (
                tasks.map((task) => {
                  const categoryColor = task.category === 'routine' ? 'info' :
                                      task.category === 'maintenance' ? 'primary' :
                                      task.priority === 'high' ? 'warning' : 'success';
                  
                  return (
                    <div key={task.id} className="p-4 hover:bg-neutral-50">
                      <div className="flex items-center">
                        <Checkbox id={`task-${task.id}`} />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-neutral-800">{task.title}</p>
                          <p className="text-xs text-neutral-500 mt-1">{task.location} - Scheduled for {format(new Date(task.scheduledDate), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-1 text-xs rounded-full bg-${categoryColor} bg-opacity-10 text-${categoryColor}`}>
                            {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <Button variant="ghost" className="w-full flex items-center justify-center text-neutral-600">
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                Show more tasks
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
