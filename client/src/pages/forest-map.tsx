import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor, formatTimeAgo, getGeoJSONCenter } from "@/lib/utils";
import { 
  Layers, 
  Ruler,
  Map as MapIcon, 
  Download,
  MapPin,
  Search
} from "lucide-react";
import { type Region, type Location } from "@shared/schema";

export default function ForestMap() {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Fetch regions
  const { data: regions = [], isLoading: regionsLoading } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
  });
  
  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/locations', selectedRegion ? `regionId=${selectedRegion}` : ''],
  });
  
  // Initialize map
  useEffect(() => {
    // This would actually use Leaflet in a real implementation
    if (typeof window !== 'undefined' && !mapInitialized) {
      // Mock leaflet map initialization
      setTimeout(() => {
        setMapInitialized(true);
      }, 500);
    }
  }, [mapInitialized]);

  // Select the first region on initial load
  useEffect(() => {
    if (regions.length > 0 && !selectedRegion) {
      setSelectedRegion(regions[0].id);
    }
  }, [regions, selectedRegion]);

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-neutral-800">Forest Map</h1>
          <p className="text-neutral-600 mt-1">Interactive map showing forest areas and zones</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            Layers
          </Button>
          <Button variant="default" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export Map
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with regions and locations */}
        <Card className="lg:col-span-1 overflow-hidden">
          <Tabs defaultValue="regions">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="regions" className="p-0">
              <div className="divide-y divide-neutral-200 max-h-[70vh] overflow-y-auto">
                {regionsLoading ? (
                  // Skeleton loading
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                      <div className="h-5 bg-neutral-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-full"></div>
                    </div>
                  ))
                ) : (
                  regions.map((region) => (
                    <div 
                      key={region.id} 
                      className={`p-4 cursor-pointer transition-colors ${selectedRegion === region.id ? 'bg-primary-light bg-opacity-10' : 'hover:bg-neutral-50'}`}
                      onClick={() => setSelectedRegion(region.id)}
                    >
                      <h3 className="font-medium text-neutral-800">{region.name}</h3>
                      <p className="text-sm text-neutral-600 mt-1">{region.description}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="locations" className="p-0">
              <div className="p-4 border-b border-neutral-200">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                  <input 
                    type="text" 
                    placeholder="Search locations..." 
                    className="pl-8 pr-4 py-2 w-full border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="divide-y divide-neutral-200 max-h-[65vh] overflow-y-auto">
                {locationsLoading ? (
                  // Skeleton loading
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center animate-pulse">
                      <div className="h-4 w-4 bg-neutral-200 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-neutral-200 rounded w-2/3 mb-1"></div>
                        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : locations.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                    <p>No locations found</p>
                    <p className="text-sm mt-1">Select a region or add new locations</p>
                  </div>
                ) : (
                  locations.map((location) => {
                    const statusColor = getStatusColor(location.status);
                    return (
                      <div 
                        key={location.id} 
                        className={`p-4 cursor-pointer transition-colors flex items-start ${selectedLocation === location.id ? 'bg-primary-light bg-opacity-10' : 'hover:bg-neutral-50'}`}
                        onClick={() => setSelectedLocation(location.id)}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full bg-${statusColor} mr-3 flex-shrink-0`}></div>
                        <div>
                          <h4 className="font-medium text-neutral-800">{location.name}</h4>
                          <p className="text-xs text-neutral-600 mt-1">Last updated: {formatTimeAgo(location.lastUpdated)}</p>
                          <p className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded mt-1 inline-block">
                            {location.coordinates.coordinates[1].toFixed(1)}°N, {location.coordinates.coordinates[0].toFixed(1)}°W
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Main map area */}
        <Card className="lg:col-span-3">
          <CardHeader className="p-4 border-b border-neutral-200">
            <CardTitle className="font-sans font-bold text-neutral-800 flex items-center">
              <MapIcon className="h-5 w-5 mr-2" />
              {selectedRegion && regions.find(r => r.id === selectedRegion)?.name || "Forest Map"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 relative">
            <div className="h-[70vh] w-full bg-neutral-100 flex items-center justify-center">
              {mapInitialized ? (
                <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1552083375-1447ce886485?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center relative">
                  {/* This would be replaced with actual Leaflet map */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
                    <div className="bg-white p-4 rounded shadow max-w-md text-center">
                      <h3 className="font-medium">Leaflet Map Implementation</h3>
                      <p className="text-sm text-neutral-600 mt-2">
                        In a real implementation, this would be an interactive Leaflet map showing:
                      </p>
                      <ul className="text-left text-sm mt-2 space-y-1">
                        <li>• Region boundaries as GeoJSON polygons</li>
                        <li>• Location markers with status colors</li>
                        <li>• Interactive zoom and pan controls</li>
                        <li>• Layer toggles for different data visualization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="material-icons text-5xl text-neutral-400">map</span>
                  <p className="text-neutral-500 mt-2">Loading map...</p>
                </div>
              )}
              
              {/* Map controls overlay */}
              <div className="absolute top-4 left-4 bg-white rounded-md shadow p-2 flex flex-col">
                <Button variant="ghost" size="icon" className="mb-1">
                  <span className="material-icons">add</span>
                </Button>
                <Button variant="ghost" size="icon" className="mb-1">
                  <span className="material-icons">remove</span>
                </Button>
                <Button variant="ghost" size="icon" className="mb-1">
                  <Layers className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Ruler className="h-4 w-4" />
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
