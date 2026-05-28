type Entity = Record<string, unknown> & { id: number };

type MockStore = {
  users: Entity[];
  regions: Entity[];
  locations: Entity[];
  inventory: Entity[];
  activities: Entity[];
  tasks: Entity[];
  metrics: Entity[];
};

const nowIso = new Date().toISOString();
const inDaysIso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const store: MockStore = {
  users: [
    { id: 1, username: "admin", password: "admin123", fullName: "Admin User", email: "admin@forestmanager.com", role: "admin", profileImage: null },
    { id: 2, username: "jforester", password: "password123", fullName: "John Forester", email: "john@forestmanager.com", role: "manager", profileImage: null },
    { id: 3, username: "fieldworker", password: "field123", fullName: "Field Worker", email: "field@forestmanager.com", role: "field_worker", profileImage: null },
  ],
  regions: [
    { id: 1, name: "North Region", description: "Northern forest area", coordinates: { type: "Polygon", coordinates: [[[45.3, -122.7], [45.4, -122.7], [45.4, -122.6], [45.3, -122.6], [45.3, -122.7]]] } },
    { id: 2, name: "East Region", description: "Eastern forest area", coordinates: { type: "Polygon", coordinates: [[[45.2, -122.5], [45.3, -122.5], [45.3, -122.4], [45.2, -122.4], [45.2, -122.5]]] } },
  ],
  locations: [
    { id: 1, regionId: 1, name: "North Ridge Trail", status: "healthy", coordinates: { type: "Point", coordinates: [45.35, -122.75] }, lastUpdated: nowIso },
    { id: 2, regionId: 2, name: "East Forest Boundary", status: "monitoring", coordinates: { type: "Point", coordinates: [45.25, -122.45] }, lastUpdated: nowIso },
    { id: 3, regionId: 1, name: "North Valley", status: "critical", coordinates: { type: "Point", coordinates: [45.31, -122.71] }, lastUpdated: nowIso },
  ],
  inventory: [
    { id: 1, type: "plant", name: "Pine Saplings", quantity: 1250, unit: "units", status: "available", lastUpdated: nowIso },
    { id: 2, type: "water", name: "Water Reserves", quantity: 15000, unit: "liters", status: "low_supply", lastUpdated: nowIso },
    { id: 3, type: "fertilizer", name: "Fertilizer", quantity: 500, unit: "kg", status: "available", lastUpdated: nowIso },
    { id: 4, type: "tools", name: "Tools", quantity: 45, unit: "sets", status: "maintenance", lastUpdated: nowIso },
  ],
  activities: [
    { id: 1, userId: 2, type: "planting", description: "Planted 250 new saplings", location: "North Sector", team: "Field Team Alpha", timestamp: nowIso, coordinates: { type: "Point", coordinates: [45.34, -122.72] } },
    { id: 2, userId: 3, type: "monitoring", description: "Soil quality assessment completed", location: "East Sector", team: "Research Team", timestamp: nowIso, coordinates: { type: "Point", coordinates: [45.26, -122.47] } },
    { id: 3, userId: 2, type: "maintenance", description: "Pest detection alert", location: "South Sector", team: "Monitoring Station 4", timestamp: nowIso, coordinates: { type: "Point", coordinates: [45.14, -122.56] } },
    { id: 4, userId: 3, type: "maintenance", description: "Irrigation system maintenance", location: "West Sector", team: "Maintenance Team", timestamp: nowIso, coordinates: { type: "Point", coordinates: [45.24, -122.76] } },
  ],
  tasks: [
    { id: 1, title: "Weekly tree health inspection", description: "Complete standard health assessment", location: "North Region", priority: "normal", status: "pending", category: "routine", assignedTo: 2, scheduledDate: inDaysIso(5), completed: false, completedAt: null },
    { id: 2, title: "Trail maintenance and clearing", description: "Clear branches and repair paths", location: "East Region", priority: "normal", status: "pending", category: "maintenance", assignedTo: 3, scheduledDate: inDaysIso(7), completed: false, completedAt: null },
    { id: 3, title: "Wildlife census preparations", description: "Set up camera traps", location: "All Regions", priority: "high", status: "pending", category: "monitoring", assignedTo: 2, scheduledDate: inDaysIso(10), completed: false, completedAt: null },
  ],
  metrics: [
    { id: 1, name: "Forest Coverage", value: 12450, unit: "ha", previousValue: 12150, changePercentage: 2.4, trend: "up", icon: "park", category: "coverage", timestamp: nowIso },
    { id: 2, name: "Tree Species", value: 78, unit: "species", previousValue: 73, changePercentage: 6.8, trend: "up", icon: "eco", category: "species", timestamp: nowIso },
    { id: 3, name: "Fire Risk Index", value: 24, unit: "", previousValue: 21, changePercentage: 12, trend: "up", icon: "local_fire_department", category: "risk", timestamp: nowIso },
    { id: 4, name: "Health Index", value: 87.5, unit: "%", previousValue: 84.8, changePercentage: 3.2, trend: "up", icon: "monitor_heart", category: "health", timestamp: nowIso },
  ],
};

const endpointMap: Record<string, keyof MockStore> = {
  users: "users",
  regions: "regions",
  locations: "locations",
  inventory: "inventory",
  activities: "activities",
  tasks: "tasks",
  metrics: "metrics",
};

const parseUrl = (url: string) => {
  const [path, query] = url.split("?");
  const parts = path.split("/").filter(Boolean);
  const resource = parts[1] || "";
  const id = parts[2] ? Number(parts[2]) : undefined;
  const action = parts[3];
  return { resource, id, action, params: new URLSearchParams(query || "") };
};

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: 200,
    ...init,
  });

const errorResponse = (message: string, status = 400) =>
  jsonResponse({ message }, { status });

export async function mockApiRequest(
  method: string,
  url: string,
  body?: unknown,
): Promise<Response> {
  const { resource, id, action, params } = parseUrl(url);
  const key = endpointMap[resource];
  if (!key) return errorResponse(`Unknown endpoint: ${url}`, 404);

  const list = store[key];
  const queryLimit = Number(params.get("limit") || "0");
  const latest = params.get("latest") === "true";
  const regionIdFilter = params.get("regionId");

  if (method === "GET") {
    let result = [...list];
    if (key === "locations" && regionIdFilter) {
      const regionId = Number(regionIdFilter);
      result = result.filter((item) => item.regionId === regionId);
    }
    if (key === "activities" && queryLimit > 0) {
      result = result.slice(0, queryLimit);
    }
    if (key === "tasks" && queryLimit > 0) {
      result = result.filter((item) => item.completed !== true).slice(0, queryLimit);
    }
    if (key === "metrics" && latest) {
      result = result.slice(0, 4);
    }
    return jsonResponse(result);
  }

  if (method === "POST") {
    const nextId = list.length ? Math.max(...list.map((item) => item.id)) + 1 : 1;
    const payload = (body as Record<string, unknown>) || {};
    const created: Entity = { id: nextId, ...payload };
    if (key === "inventory" || key === "locations") created.lastUpdated = nowIso;
    if (key === "activities" || key === "metrics") created.timestamp = nowIso;
    if (key === "tasks" && created.completed === undefined) {
      created.completed = false;
      created.completedAt = null;
    }
    list.push(created);
    return jsonResponse(created, { status: 201 });
  }

  if (id === undefined) return errorResponse("Missing id", 400);
  const idx = list.findIndex((item) => item.id === id);
  if (idx === -1) return errorResponse("Not found", 404);

  if (method === "PUT") {
    const existing = list[idx];
    if (key === "tasks" && action === "complete") {
      const updated = {
        ...existing,
        completed: true,
        status: "completed",
        completedAt: nowIso,
      };
      list[idx] = updated;
      return jsonResponse(updated);
    }

    const payload = (body as Record<string, unknown>) || {};
    const updated = { ...existing, ...payload };
    if (key === "inventory" || key === "locations") updated.lastUpdated = nowIso;
    list[idx] = updated;
    return jsonResponse(updated);
  }

  if (method === "DELETE") {
    list.splice(idx, 1);
    return new Response(null, { status: 204 });
  }

  return errorResponse(`Unsupported method: ${method}`, 405);
}
