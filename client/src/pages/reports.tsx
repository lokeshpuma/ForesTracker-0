import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  formatDate, 
  formatTimeAgo, 
  getStatusColor,
  getGeoJSONCenter
} from "@/lib/utils";
import { type Activity, type Region, type Location } from "@shared/schema";
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Download, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Filter,
  Search, 
  BarChart2
} from "lucide-react";

// Sample chart data - in a real app this would come from the API
const activityTypeData = [
  { name: 'Planting', value: 35 },
  { name: 'Monitoring', value: 25 },
  { name: 'Maintenance', value: 30 },
  { name: 'Research', value: 10 },
];

const monthlyActivityData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 25 },
  { month: 'Apr', count: 32 },
  { month: 'May', count: 38 },
  { month: 'Jun', count: 42 },
];

const COLORS = ['#2E7D32', '#43A047', '#1B5E20', '#0A3D12'];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // Fetch activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  // Fetch regions and locations for filtering
  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === "" || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    const matchesLocation = locationFilter === "all" || activity.location.includes(locationFilter);
    
    // Date range filtering
    let matchesDate = true;
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    
    if (dateRangeFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      matchesDate = activityDate >= today;
    } else if (dateRangeFilter === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      matchesDate = activityDate >= lastWeek;
    } else if (dateRangeFilter === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      matchesDate = activityDate >= lastMonth;
    }
    
    return matchesSearch && matchesType && matchesLocation && matchesDate;
  });

  // Get unique types and locations for filters
  const types = ["all", ...new Set(activities.map(activity => activity.type))];
  const locationNames = ["all", ...new Set(activities.map(activity => activity.location))];

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-neutral-800">Reports & Analytics</h1>
          <p className="text-neutral-600 mt-1">Analyze forest activities and generate reports</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activity by Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {activityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activities Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-primary mr-2" />
                  <h3 className="text-sm font-medium">Period Overview</h3>
                </div>
                <p className="text-2xl font-bold">{activities.length} Activities</p>
                <p className="text-sm text-neutral-500">Last 6 months</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <BarChart2 className="h-4 w-4 text-primary mr-2" />
                  <h3 className="text-sm font-medium">Top Activity Type</h3>
                </div>
                <p className="text-2xl font-bold">Planting</p>
                <p className="text-sm text-neutral-500">35% of all activities</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-primary mr-2" />
                  <h3 className="text-sm font-medium">Most Active Region</h3>
                </div>
                <p className="text-2xl font-bold">North Region</p>
                <p className="text-sm text-neutral-500">42% of activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <Input
                placeholder="Search activities..."
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
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="truncate">Location: {locationFilter === "all" ? "All" : locationFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {locationNames.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc === "all" ? "All Locations" : loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <span className="truncate">Date: {dateRangeFilter === "all" ? "All Time" : dateRangeFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
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
              <TabsTrigger value="timeline" className="data-[state=active]:bg-white">Timeline View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Activity</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Team</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activitiesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b animate-pulse">
                          <td className="py-4 px-4">
                            <div className="h-4 w-48 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 w-20 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                          <div className="flex flex-col items-center">
                            <FileText className="h-12 w-12 mb-2 text-neutral-400" />
                            No activities found
                            <p className="text-sm mt-1">Try changing your filters or add new activities</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((activity) => {
                        let typeClass = "";
                        
                        if (activity.type === "planting") typeClass = "bg-success bg-opacity-10 text-success";
                        else if (activity.type === "monitoring") typeClass = "bg-info bg-opacity-10 text-info";
                        else if (activity.type === "maintenance") typeClass = "bg-warning bg-opacity-10 text-warning";
                        else typeClass = "bg-primary bg-opacity-10 text-primary";
                        
                        return (
                          <tr key={activity.id} className="border-b hover:bg-neutral-50">
                            <td className="py-4 px-4">
                              <div className="text-sm font-medium">{activity.description}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeClass} capitalize`}>
                                {activity.type}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">{activity.location}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">{activity.team || "—"}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">{formatDate(activity.timestamp)}</div>
                              <div className="text-xs text-neutral-500">{formatTimeAgo(activity.timestamp)}</div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0 p-6">
              <div className="relative border-l-2 border-neutral-200 ml-4 pl-6 space-y-6">
                {activitiesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="relative animate-pulse">
                      <div className="absolute w-4 h-4 bg-neutral-200 rounded-full -left-10 top-1.5"></div>
                      <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-5 w-48 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-4 w-40 bg-neutral-200 rounded"></div>
                    </div>
                  ))
                ) : filteredActivities.length === 0 ? (
                  <div className="py-8 text-center text-neutral-500">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 mb-2 text-neutral-400" />
                      No activities found
                      <p className="text-sm mt-1">Try changing your filters or add new activities</p>
                    </div>
                  </div>
                ) : (
                  filteredActivities.map((activity) => {
                    let dotColor = "";
                    let iconBg = "";
                    let icon = "";
                    
                    if (activity.type === "planting") {
                      dotColor = "bg-success";
                      iconBg = "bg-success bg-opacity-10";
                      icon = "forest";
                    } else if (activity.type === "monitoring") {
                      dotColor = "bg-info";
                      iconBg = "bg-info bg-opacity-10";
                      icon = "monitoring";
                    } else if (activity.type === "maintenance") {
                      dotColor = "bg-warning";
                      iconBg = "bg-warning bg-opacity-10";
                      icon = activity.description.toLowerCase().includes("pest") ? "bug_report" : "build";
                    } else {
                      dotColor = "bg-primary";
                      iconBg = "bg-primary bg-opacity-10";
                      icon = "fact_check";
                    }
                    
                    return (
                      <div key={activity.id} className="relative">
                        <div className={`absolute w-4 h-4 ${dotColor} rounded-full -left-10 top-1.5`}></div>
                        <div className="text-sm text-neutral-500">{formatDate(activity.timestamp)}</div>
                        <div className="flex gap-3 mt-2">
                          <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                            <span className={`material-icons text-${dotColor.replace('bg-', '')}`}>{icon}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{activity.description}</h3>
                            <div className="flex items-center text-sm text-neutral-500 mt-1 gap-2">
                              <div className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {activity.location}
                              </div>
                              {activity.team && (
                                <div className="flex items-center">
                                  <User className="h-3.5 w-3.5 mr-1" />
                                  {activity.team}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
