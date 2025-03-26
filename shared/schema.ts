import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User and Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("field_worker"), // admin, manager, field_worker
  profileImage: text("profile_image")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  profileImage: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Forest regions
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coordinates: jsonb("coordinates").notNull() // GeoJSON coordinates
});

export const insertRegionSchema = createInsertSchema(regions).pick({
  name: true,
  description: true,
  coordinates: true
});

export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

// Forest locations within regions
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  regionId: integer("region_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("healthy"), // healthy, monitoring, critical, unclassified
  coordinates: jsonb("coordinates").notNull(), // GeoJSON point
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  regionId: true,
  name: true,
  status: true,
  coordinates: true
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Tree and plant inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // tree, water, fertilizer, tools, etc.
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(), // units, kg, liters, etc.
  status: text("status").notNull(), // available, low_supply, maintenance, depleted
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  type: true,
  name: true,
  quantity: true,
  unit: true,
  status: true
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// Activity logs and reports
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // planting, monitoring, maintenance, etc.
  description: text("description").notNull(),
  location: text("location").notNull(),
  team: text("team"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  coordinates: jsonb("coordinates") // Optional GeoJSON point
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
  location: true,
  team: true,
  coordinates: true
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Scheduled tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  priority: text("priority").notNull().default("normal"), // low, normal, high
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  category: text("category").notNull(), // routine, maintenance, planting, monitoring
  assignedTo: integer("assigned_to"), // user id
  scheduledDate: timestamp("scheduled_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at")
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  location: true,
  priority: true,
  status: true,
  category: true,
  assignedTo: true,
  scheduledDate: true
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Forest metrics
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  previousValue: real("previous_value"),
  changePercentage: real("change_percentage"),
  trend: text("trend"), // up, down, stable
  icon: text("icon"),
  category: text("category").notNull(), // coverage, species, risk, health
  timestamp: timestamp("timestamp").notNull().defaultNow()
});

export const insertMetricSchema = createInsertSchema(metrics).pick({
  name: true,
  value: true,
  unit: true,
  previousValue: true,
  changePercentage: true,
  trend: true,
  icon: true,
  category: true
});

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;
