import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertRegionSchema, 
  insertLocationSchema,
  insertInventorySchema,
  insertActivitySchema,
  insertTaskSchema,
  insertMetricSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper for error handling
const handleZodError = (error: ZodError, res: Response) => {
  const validationError = fromZodError(error);
  return res.status(400).json({ error: validationError.message });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // =============== USER ROUTES ===============
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // =============== REGION ROUTES ===============
  app.get("/api/regions", async (req, res) => {
    try {
      const regions = await storage.getRegions();
      res.json(regions);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve regions" });
    }
  });

  app.get("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const region = await storage.getRegion(id);
      
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }
      
      res.json(region);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve region" });
    }
  });

  app.post("/api/regions", async (req, res) => {
    try {
      const regionData = insertRegionSchema.parse(req.body);
      const region = await storage.createRegion(regionData);
      res.status(201).json(region);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to create region" });
    }
  });

  app.put("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const regionData = insertRegionSchema.partial().parse(req.body);
      const updatedRegion = await storage.updateRegion(id, regionData);
      
      if (!updatedRegion) {
        return res.status(404).json({ error: "Region not found" });
      }
      
      res.json(updatedRegion);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to update region" });
    }
  });

  app.delete("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRegion(id);
      
      if (!success) {
        return res.status(404).json({ error: "Region not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete region" });
    }
  });

  // =============== LOCATION ROUTES ===============
  app.get("/api/locations", async (req, res) => {
    try {
      const regionId = req.query.regionId ? parseInt(req.query.regionId as string) : undefined;
      
      if (regionId) {
        const locations = await storage.getLocationsByRegion(regionId);
        return res.json(locations);
      }
      
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve location" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to create location" });
    }
  });

  app.put("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const locationData = insertLocationSchema.partial().parse(req.body);
      const updatedLocation = await storage.updateLocation(id, locationData);
      
      if (!updatedLocation) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLocation(id);
      
      if (!success) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete location" });
    }
  });

  // =============== INVENTORY ROUTES ===============
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventoryItems();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve inventory" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getInventoryItem(id);
      
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve inventory item" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = insertInventorySchema.partial().parse(req.body);
      const updatedItem = await storage.updateInventoryItem(id, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInventoryItem(id);
      
      if (!success) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // =============== ACTIVITY ROUTES ===============
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (limit) {
        const activities = await storage.getRecentActivities(limit);
        return res.json(activities);
      }
      
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve activities" });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve activity" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  app.put("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activityData = insertActivitySchema.partial().parse(req.body);
      const updatedActivity = await storage.updateActivity(id, activityData);
      
      if (!updatedActivity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteActivity(id);
      
      if (!success) {
        return res.status(404).json({ error: "Activity not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete activity" });
    }
  });

  // =============== TASK ROUTES ===============
  app.get("/api/tasks", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (limit) {
        const tasks = await storage.getUpcomingTasks(limit);
        return res.json(tasks);
      }
      
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.put("/api/tasks/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const completedTask = await storage.completeTask(id);
      
      if (!completedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(completedTask);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // =============== METRIC ROUTES ===============
  app.get("/api/metrics", async (req, res) => {
    try {
      const latest = req.query.latest === 'true';
      
      if (latest) {
        const metrics = await storage.getLatestMetrics();
        return res.json(metrics);
      }
      
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve metrics" });
    }
  });

  app.get("/api/metrics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const metric = await storage.getMetric(id);
      
      if (!metric) {
        return res.status(404).json({ error: "Metric not found" });
      }
      
      res.json(metric);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve metric" });
    }
  });

  app.post("/api/metrics", async (req, res) => {
    try {
      const metricData = insertMetricSchema.parse(req.body);
      const metric = await storage.createMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to create metric" });
    }
  });

  app.put("/api/metrics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const metricData = insertMetricSchema.partial().parse(req.body);
      const updatedMetric = await storage.updateMetric(id, metricData);
      
      if (!updatedMetric) {
        return res.status(404).json({ error: "Metric not found" });
      }
      
      res.json(updatedMetric);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ error: "Failed to update metric" });
    }
  });

  app.delete("/api/metrics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMetric(id);
      
      if (!success) {
        return res.status(404).json({ error: "Metric not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete metric" });
    }
  });

  return httpServer;
}
