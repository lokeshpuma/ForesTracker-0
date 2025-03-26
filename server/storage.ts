import { 
  users, type User, type InsertUser,
  regions, type Region, type InsertRegion,
  locations, type Location, type InsertLocation,
  inventory, type Inventory, type InsertInventory,
  activities, type Activity, type InsertActivity,
  tasks, type Task, type InsertTask,
  metrics, type Metric, type InsertMetric
} from "@shared/schema";

// Storage interface with CRUD methods for all entities
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Regions
  getRegion(id: number): Promise<Region | undefined>;
  getRegions(): Promise<Region[]>;
  createRegion(region: InsertRegion): Promise<Region>;
  updateRegion(id: number, region: Partial<InsertRegion>): Promise<Region | undefined>;
  deleteRegion(id: number): Promise<boolean>;
  
  // Locations
  getLocation(id: number): Promise<Location | undefined>;
  getLocations(): Promise<Location[]>;
  getLocationsByRegion(regionId: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Inventory
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getInventoryItems(): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  
  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getUpcomingTasks(limit: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  completeTask(id: number): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Metrics
  getMetric(id: number): Promise<Metric | undefined>;
  getMetrics(): Promise<Metric[]>;
  getLatestMetrics(): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined>;
  deleteMetric(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private regions: Map<number, Region>;
  private locations: Map<number, Location>;
  private inventoryItems: Map<number, Inventory>;
  private activities: Map<number, Activity>;
  private tasks: Map<number, Task>;
  private metrics: Map<number, Metric>;
  
  // Track IDs for each entity
  private userId: number;
  private regionId: number;
  private locationId: number;
  private inventoryId: number;
  private activityId: number;
  private taskId: number;
  private metricId: number;

  constructor() {
    // Initialize storage maps
    this.users = new Map();
    this.regions = new Map();
    this.locations = new Map();
    this.inventoryItems = new Map();
    this.activities = new Map();
    this.tasks = new Map();
    this.metrics = new Map();
    
    // Initialize IDs
    this.userId = 1;
    this.regionId = 1;
    this.locationId = 1;
    this.inventoryId = 1;
    this.activityId = 1;
    this.taskId = 1;
    this.metricId = 1;
    
    // Seed data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Region methods
  async getRegion(id: number): Promise<Region | undefined> {
    return this.regions.get(id);
  }
  
  async getRegions(): Promise<Region[]> {
    return Array.from(this.regions.values());
  }
  
  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const id = this.regionId++;
    const region: Region = { ...insertRegion, id };
    this.regions.set(id, region);
    return region;
  }
  
  async updateRegion(id: number, regionData: Partial<InsertRegion>): Promise<Region | undefined> {
    const existingRegion = this.regions.get(id);
    if (!existingRegion) return undefined;
    
    const updatedRegion = { ...existingRegion, ...regionData };
    this.regions.set(id, updatedRegion);
    return updatedRegion;
  }
  
  async deleteRegion(id: number): Promise<boolean> {
    return this.regions.delete(id);
  }
  
  // Location methods
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocationsByRegion(regionId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.regionId === regionId
    );
  }
  
  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.locationId++;
    const location: Location = { 
      ...insertLocation, 
      id, 
      lastUpdated: new Date()
    };
    this.locations.set(id, location);
    return location;
  }
  
  async updateLocation(id: number, locationData: Partial<InsertLocation>): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) return undefined;
    
    const updatedLocation = { 
      ...existingLocation, 
      ...locationData,
      lastUpdated: new Date()
    };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }
  
  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }
  
  // Inventory methods
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventoryItems.get(id);
  }
  
  async getInventoryItems(): Promise<Inventory[]> {
    return Array.from(this.inventoryItems.values());
  }
  
  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = this.inventoryId++;
    const item: Inventory = { 
      ...insertItem, 
      id, 
      lastUpdated: new Date()
    };
    this.inventoryItems.set(id, item);
    return item;
  }
  
  async updateInventoryItem(id: number, itemData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const existingItem = this.inventoryItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { 
      ...existingItem, 
      ...itemData,
      lastUpdated: new Date()
    };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }
  
  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      timestamp: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  async updateActivity(id: number, activityData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existingActivity = this.activities.get(id);
    if (!existingActivity) return undefined;
    
    const updatedActivity = { ...existingActivity, ...activityData };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }
  
  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getUpcomingTasks(limit: number): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values())
      .filter(task => !task.completed && task.scheduledDate > now)
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      .slice(0, limit);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      completed: false,
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async completeTask(id: number): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const completedTask = { 
      ...existingTask, 
      completed: true, 
      status: 'completed',
      completedAt: new Date()
    };
    this.tasks.set(id, completedTask);
    return completedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Metric methods
  async getMetric(id: number): Promise<Metric | undefined> {
    return this.metrics.get(id);
  }
  
  async getMetrics(): Promise<Metric[]> {
    return Array.from(this.metrics.values());
  }
  
  async getLatestMetrics(): Promise<Metric[]> {
    const categories = ['coverage', 'species', 'risk', 'health'];
    
    // Get latest metric for each category
    const latestMetrics: Metric[] = [];
    
    for (const category of categories) {
      const categoryMetrics = Array.from(this.metrics.values())
        .filter(metric => metric.category === category)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      if (categoryMetrics.length > 0) {
        latestMetrics.push(categoryMetrics[0]);
      }
    }
    
    return latestMetrics;
  }
  
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.metricId++;
    const metric: Metric = { 
      ...insertMetric, 
      id, 
      timestamp: new Date()
    };
    this.metrics.set(id, metric);
    return metric;
  }
  
  async updateMetric(id: number, metricData: Partial<InsertMetric>): Promise<Metric | undefined> {
    const existingMetric = this.metrics.get(id);
    if (!existingMetric) return undefined;
    
    const updatedMetric = { ...existingMetric, ...metricData };
    this.metrics.set(id, updatedMetric);
    return updatedMetric;
  }
  
  async deleteMetric(id: number): Promise<boolean> {
    return this.metrics.delete(id);
  }
  
  // Seed initial data for development
  private seedData() {
    // Seed admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      fullName: 'Admin User',
      email: 'admin@forestmanager.com',
      role: 'admin',
      profileImage: null
    });

    // Seed manager user
    this.createUser({
      username: 'jforester',
      password: 'password123',
      fullName: 'John Forester',
      email: 'john@forestmanager.com',
      role: 'manager',
      profileImage: null
    });

    // Seed field worker
    this.createUser({
      username: 'fieldworker',
      password: 'field123',
      fullName: 'Field Worker',
      email: 'field@forestmanager.com',
      role: 'field_worker',
      profileImage: null
    });

    // Seed regions
    const northRegion = this.createRegion({
      name: 'North Region',
      description: 'Northern forest area with pine and spruce trees',
      coordinates: { 
        type: 'Polygon',
        coordinates: [[[45.3, -122.7], [45.4, -122.7], [45.4, -122.6], [45.3, -122.6], [45.3, -122.7]]]
      }
    });

    const eastRegion = this.createRegion({
      name: 'East Region',
      description: 'Eastern forest with mixed deciduous trees',
      coordinates: {
        type: 'Polygon',
        coordinates: [[[45.2, -122.5], [45.3, -122.5], [45.3, -122.4], [45.2, -122.4], [45.2, -122.5]]]
      }
    });

    const southRegion = this.createRegion({
      name: 'South Region',
      description: 'Southern forest border with oak and maple',
      coordinates: {
        type: 'Polygon',
        coordinates: [[[45.1, -122.6], [45.2, -122.6], [45.2, -122.5], [45.1, -122.5], [45.1, -122.6]]]
      }
    });

    const westRegion = this.createRegion({
      name: 'West Region',
      description: 'Western border with mixed coniferous forest',
      coordinates: {
        type: 'Polygon',
        coordinates: [[[45.2, -122.8], [45.3, -122.8], [45.3, -122.7], [45.2, -122.7], [45.2, -122.8]]]
      }
    });

    // Seed locations
    this.createLocation({
      regionId: 1,
      name: 'North Ridge Trail',
      status: 'healthy',
      coordinates: {
        type: 'Point',
        coordinates: [45.35, -122.75]
      }
    });

    this.createLocation({
      regionId: 2,
      name: 'East Forest Boundary',
      status: 'monitoring',
      coordinates: {
        type: 'Point',
        coordinates: [45.25, -122.45]
      }
    });

    this.createLocation({
      regionId: 3,
      name: 'Southern Clearing',
      status: 'critical',
      coordinates: {
        type: 'Point',
        coordinates: [45.15, -122.55]
      }
    });

    // Seed inventory
    this.createInventoryItem({
      type: 'plant',
      name: 'Pine Saplings',
      quantity: 1250,
      unit: 'units',
      status: 'available'
    });

    this.createInventoryItem({
      type: 'water',
      name: 'Water Reserves',
      quantity: 15000,
      unit: 'liters',
      status: 'low_supply'
    });

    this.createInventoryItem({
      type: 'fertilizer',
      name: 'Fertilizer',
      quantity: 500,
      unit: 'kg',
      status: 'available'
    });

    this.createInventoryItem({
      type: 'tools',
      name: 'Tools',
      quantity: 45,
      unit: 'sets',
      status: 'maintenance'
    });

    // Seed activities
    this.createActivity({
      userId: 2,
      type: 'planting',
      description: 'Planted 250 new saplings',
      location: 'North Sector',
      team: 'Field Team Alpha',
      coordinates: {
        type: 'Point',
        coordinates: [45.34, -122.72]
      }
    });

    this.createActivity({
      userId: 3,
      type: 'monitoring',
      description: 'Soil quality assessment completed',
      location: 'East Sector',
      team: 'Research Team',
      coordinates: {
        type: 'Point',
        coordinates: [45.26, -122.47]
      }
    });

    this.createActivity({
      userId: 2,
      type: 'maintenance',
      description: 'Pest detection alert',
      location: 'South Sector',
      team: 'Monitoring Station 4',
      coordinates: {
        type: 'Point',
        coordinates: [45.14, -122.56]
      }
    });

    this.createActivity({
      userId: 3,
      type: 'maintenance',
      description: 'Irrigation system maintenance',
      location: 'West Sector',
      team: 'Maintenance Team',
      coordinates: {
        type: 'Point',
        coordinates: [45.24, -122.76]
      }
    });

    // Seed tasks
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 5);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 7);

    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 10);

    this.createTask({
      title: 'Weekly tree health inspection',
      description: 'Complete standard health assessment for all trees in sector',
      location: 'North Region',
      priority: 'normal',
      status: 'pending',
      category: 'routine',
      assignedTo: 2,
      scheduledDate: futureDate1
    });

    this.createTask({
      title: 'Trail maintenance and clearing',
      description: 'Clear fallen branches and repair walking paths',
      location: 'East Region',
      priority: 'normal',
      status: 'pending',
      category: 'maintenance',
      assignedTo: 3,
      scheduledDate: futureDate2
    });

    this.createTask({
      title: 'Wildlife census preparations',
      description: 'Set up camera traps and prepare for upcoming wildlife count',
      location: 'All Regions',
      priority: 'high',
      status: 'pending',
      category: 'monitoring',
      assignedTo: 2,
      scheduledDate: futureDate3
    });

    // Seed metrics
    this.createMetric({
      name: 'Forest Coverage',
      value: 12450,
      unit: 'ha',
      previousValue: 12150,
      changePercentage: 2.4,
      trend: 'up',
      icon: 'park',
      category: 'coverage'
    });

    this.createMetric({
      name: 'Tree Species',
      value: 78,
      unit: 'species',
      previousValue: 73,
      changePercentage: 6.8,
      trend: 'up',
      icon: 'eco',
      category: 'species'
    });

    this.createMetric({
      name: 'Fire Risk Index',
      value: 24,
      unit: '',
      previousValue: 21,
      changePercentage: 12,
      trend: 'up',
      icon: 'local_fire_department',
      category: 'risk'
    });

    this.createMetric({
      name: 'Health Index',
      value: 87.5,
      unit: '%',
      previousValue: 84.8,
      changePercentage: 3.2,
      trend: 'up',
      icon: 'monitor_heart',
      category: 'health'
    });
  }
}

export const storage = new MemStorage();
