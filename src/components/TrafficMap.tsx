import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrafficLight, EmergencyVehicle, TrafficDensity } from '@/types/traffic';
import { MapPin, AlertTriangle, Clock, Navigation, Route, Trash2, Save, Play } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface TrafficMapProps {
  apiKey: string;
}

const TrafficMap: React.FC<TrafficMapProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
  const [emergencyVehicles, setEmergencyVehicles] = useState<EmergencyVehicle[]>([]);
  const [trafficDensity, setTrafficDensity] = useState<TrafficDensity[]>([]);
  
  // Emergency route drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<'ambulance' | 'fire' | 'police'>('ambulance');
  const [drawingPath, setDrawingPath] = useState<{ lat: number; lng: number }[]>([]);
  const [currentDrawingLine, setCurrentDrawingLine] = useState<any>(null);
  const [drawnRoutes, setDrawnRoutes] = useState<{
    id: string;
    type: 'ambulance' | 'fire' | 'police';
    path: { lat: number; lng: number }[];
    polyline: any;
  }[]>([]);

  // Helper function to get vehicle color
  const getVehicleColor = (type: 'ambulance' | 'fire' | 'police') => {
    switch (type) {
      case 'ambulance': return '#ef4444'; // Red for ambulance
      case 'fire': return '#f97316'; // Orange for fire truck
      case 'police': return '#3b82f6'; // Blue for police
      default: return '#ef4444';
    }
  };

  // Emergency route drawing functions
  const startDrawing = () => {
    setIsDrawingMode(true);
    setDrawingPath([]);
    if (currentDrawingLine) {
      currentDrawingLine.setMap(null);
      setCurrentDrawingLine(null);
    }
  };

  const finishDrawing = () => {
    if (drawingPath.length >= 2) {
      const routeId = `route-${Date.now()}`;
      const newRoute = {
        id: routeId,
        type: selectedVehicleType,
        path: [...drawingPath],
        polyline: currentDrawingLine
      };
      
      setDrawnRoutes(prev => [...prev, newRoute]);
      
      // Create emergency vehicle for this route
      const newVehicle: EmergencyVehicle = {
        id: `${selectedVehicleType}-${Date.now()}`,
        type: selectedVehicleType,
        position: drawingPath[0],
        destination: drawingPath[drawingPath.length - 1],
        status: 'dispatched',
        priority: 'high',
        estimatedArrival: new Date(Date.now() + 10 * 60000) // 10 minutes ETA
      };
      
      setEmergencyVehicles(prev => [...prev, newVehicle]);
    }
    
    setIsDrawingMode(false);
    setDrawingPath([]);
    setCurrentDrawingLine(null);
  };

  const cancelDrawing = () => {
    if (currentDrawingLine) {
      currentDrawingLine.setMap(null);
    }
    setIsDrawingMode(false);
    setDrawingPath([]);
    setCurrentDrawingLine(null);
  };

  const clearAllRoutes = () => {
    drawnRoutes.forEach(route => {
      if (route.polyline) {
        route.polyline.setMap(null);
      }
    });
    setDrawnRoutes([]);
  };

  // Initialize traffic lights at main junctions in Kottakal
  useEffect(() => {
    const mainJunctionTrafficLights: TrafficLight[] = [
      {
        id: 'tl-001',
        name: 'Arya Vaidya Sala Main Junction',
        position: { lat: 11.0510, lng: 75.9949 }, // Near the famous Ayurvedic center
        status: 'green',
        timing: { red: 60, yellow: 10, green: 90 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-002',
        name: 'NH-66 Kottakal Junction',
        position: { lat: 11.0495, lng: 75.9932 }, // Main highway intersection
        status: 'red',
        timing: { red: 75, yellow: 10, green: 105 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-003',
        name: 'Hospital Road-Market Junction',
        position: { lat: 11.0525, lng: 75.9965 }, // Hospital and market area
        status: 'yellow',
        timing: { red: 50, yellow: 8, green: 85 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-004',
        name: 'Malappuram-Tirur Road Junction',
        position: { lat: 11.0535, lng: 75.9920 }, // Main road connecting to other towns
        status: 'green',
        timing: { red: 65, yellow: 10, green: 95 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-005',
        name: 'Railway Station Junction',
        position: { lat: 11.0480, lng: 75.9955 }, // Near railway connectivity
        status: 'red',
        timing: { red: 55, yellow: 8, green: 80 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-006',
        name: 'Bus Stand Circle',
        position: { lat: 11.0515, lng: 75.9975 }, // Main bus terminal area
        status: 'green',
        timing: { red: 45, yellow: 8, green: 75 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-007',
        name: 'College Road Junction',
        position: { lat: 11.0545, lng: 75.9940 }, // Educational institutions area
        status: 'yellow',
        timing: { red: 40, yellow: 8, green: 70 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-008',
        name: 'Industrial Area Junction',
        position: { lat: 11.0465, lng: 75.9920 }, // Industrial zone access
        status: 'green',
        timing: { red: 60, yellow: 10, green: 90 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-009',
        name: 'Bypass Road Entry',
        position: { lat: 11.0490, lng: 75.9890 }, // New bypass road connection
        status: 'red',
        timing: { red: 70, yellow: 10, green: 100 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-010',
        name: 'Police Station Junction',
        position: { lat: 11.0520, lng: 75.9930 }, // Law enforcement area
        status: 'green',
        timing: { red: 50, yellow: 8, green: 80 },
        lastUpdated: new Date()
      }
    ];

    const sampleEmergencyVehicles: EmergencyVehicle[] = [
      {
        id: 'amb-001',
        type: 'ambulance',
        position: { lat: 11.0530, lng: 75.9929 },
        destination: { lat: 11.0495, lng: 75.9965 },
        status: 'en_route',
        priority: 'high',
        estimatedArrival: new Date(Date.now() + 8 * 60000)
      }
    ];

    const sampleTrafficDensity: TrafficDensity[] = [
      {
        position: { lat: 11.0510, lng: 75.9949 },
        density: 'high',
        vehicleCount: 45,
        averageSpeed: 15,
        timestamp: new Date()
      },
      {
        position: { lat: 11.0520, lng: 75.9939 },
        density: 'medium',
        vehicleCount: 28,
        averageSpeed: 25,
        timestamp: new Date()
      }
    ];

    setTrafficLights(mainJunctionTrafficLights);
    setEmergencyVehicles(sampleEmergencyVehicles);
    setTrafficDensity(sampleTrafficDensity);
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=visualization`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      if (mapRef.current) {
        map.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 11.0510, lng: 75.9949 }, // Kottakal coordinates
          zoom: 16,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'all',
              stylers: [{ saturation: -80 }, { lightness: -60 }]
            },
            {
              featureType: 'road',
              stylers: [{ visibility: 'on' }, { color: '#2c3e50' }]
            },
            {
              featureType: 'water',
              stylers: [{ color: '#1a1a1a' }]
            }
          ]
        });

        // Add traffic layer
        const trafficLayer = new window.google.maps.TrafficLayer();
        trafficLayer.setMap(map.current);

        setIsLoaded(true);
        
        // Add click listener for drawing emergency routes
        map.current.addListener('click', (event: any) => {
          if (isDrawingMode) {
            const clickedPoint = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            
            setDrawingPath(prev => {
              const newPath = [...prev, clickedPoint];
              
              // Update the polyline with new path
              if (currentDrawingLine) {
                currentDrawingLine.setPath(newPath);
              } else {
                const newPolyline = new window.google.maps.Polyline({
                  path: newPath,
                  geodesic: true,
                  strokeColor: getVehicleColor(selectedVehicleType),
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  icons: [{
                    icon: {
                      path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                      scale: 4,
                      strokeColor: getVehicleColor(selectedVehicleType)
                    },
                    offset: '100%',
                    repeat: '50px'
                  }],
                  map: map.current
                });
                setCurrentDrawingLine(newPolyline);
              }
              
              return newPath;
            });
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey, isDrawingMode, selectedVehicleType, drawingPath, currentDrawingLine]);

  useEffect(() => {
    if (!isLoaded || !map.current) return;

    // Add traffic light markers
    trafficLights.forEach(light => {
      const marker = new window.google.maps.Marker({
        position: light.position,
        map: map.current,
        title: light.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: light.status === 'red' ? '#ef4444' : light.status === 'yellow' ? '#f59e0b' : '#22c55e',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #000;">
            <h3>${light.name}</h3>
            <p>Status: <strong style="color: ${light.status === 'red' ? '#ef4444' : light.status === 'yellow' ? '#f59e0b' : '#22c55e'}">${light.status.toUpperCase()}</strong></p>
            <p>Timing: R:${light.timing.red}s Y:${light.timing.yellow}s G:${light.timing.green}s</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });
    });

    // Add emergency vehicle markers
    emergencyVehicles.forEach(vehicle => {
      const marker = new window.google.maps.Marker({
        position: vehicle.position,
        map: map.current,
        title: `${vehicle.type.toUpperCase()} - ${vehicle.id}`,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        animation: window.google.maps.Animation.BOUNCE
      });

      // Draw route line
      const routeLine = new window.google.maps.Polyline({
        path: [vehicle.position, vehicle.destination],
        geodesic: true,
        strokeColor: '#ef4444',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map.current
      });
    });

    // Add traffic density heatmap
    if (window.google.maps.visualization) {
      const heatmapData = trafficDensity.map(density => ({
        location: new window.google.maps.LatLng(density.position.lat, density.position.lng),
        weight: density.vehicleCount
      }));

      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        radius: 50,
        opacity: 0.6
      });

      heatmap.setMap(map.current);
    }
  }, [isLoaded, trafficLights, emergencyVehicles, trafficDensity]);

  const toggleTrafficLight = (lightId: string) => {
    setTrafficLights(prev => prev.map(light => {
      if (light.id === lightId) {
        const statuses: ('red' | 'yellow' | 'green')[] = ['red', 'yellow', 'green'];
        const currentIndex = statuses.indexOf(light.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        return { ...light, status: nextStatus, lastUpdated: new Date() };
      }
      return light;
    }));
  };

  if (!apiKey) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-accent" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">Google Maps API Key Required</h3>
        <p className="text-muted-foreground mb-4">
          Please enter your Google Maps API key to load the traffic management system.
        </p>
        <p className="text-sm text-muted-foreground">
          Get your API key at: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a>
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Map */}
      <div className="lg:col-span-3">
        <Card className="h-full border-border bg-card overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />
        </Card>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-4 overflow-y-auto">
        {/* Traffic Lights Control */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Traffic Lights
          </h3>
          <div className="space-y-2">
            {trafficLights.map(light => (
              <div key={light.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{light.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={light.status === 'red' ? 'destructive' : light.status === 'yellow' ? 'default' : 'default'}
                      className={`text-xs ${
                        light.status === 'green' ? 'bg-traffic-low text-background' :
                        light.status === 'yellow' ? 'bg-traffic-medium text-background' :
                        'bg-traffic-high text-foreground'
                      }`}
                    >
                      {light.status.toUpperCase()}
                    </Badge>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {light.timing[light.status]}s
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTrafficLight(light.id)}
                  className="ml-2"
                >
                  Toggle
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Vehicles */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4 text-emergency" />
            Emergency Vehicles
          </h3>
          <div className="space-y-2">
            {emergencyVehicles.map(vehicle => (
              <div key={vehicle.id} className="p-3 rounded-lg bg-secondary border-l-4 border-emergency">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="destructive" className="bg-emergency text-foreground">
                    {vehicle.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${
                    vehicle.priority === 'high' ? 'border-emergency text-emergency' : 'border-border'
                  }`}>
                    {vehicle.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-foreground">Status: {vehicle.status.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">
                  ETA: {vehicle.estimatedArrival.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Route Drawing */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            <Route className="h-4 w-4 text-emergency" />
            Draw Emergency Route
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Vehicle Type</label>
              <Select 
                value={selectedVehicleType} 
                onValueChange={(value: 'ambulance' | 'fire' | 'police') => setSelectedVehicleType(value)}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambulance">🚑 Ambulance</SelectItem>
                  <SelectItem value="fire">🚒 Fire Truck</SelectItem>
                  <SelectItem value="police">🚓 Police</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {!isDrawingMode ? (
                <Button 
                  onClick={startDrawing}
                  className="flex-1 bg-emergency hover:bg-emergency/90 text-foreground"
                  size="sm"
                >
                  <Route className="mr-2 h-4 w-4" />
                  Start Drawing
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={finishDrawing}
                    className="flex-1 bg-traffic-low hover:bg-traffic-low/90 text-background"
                    size="sm"
                    disabled={drawingPath.length < 2}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Finish
                  </Button>
                  <Button 
                    onClick={cancelDrawing}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {isDrawingMode && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Click on the map to draw route points. Need at least 2 points to finish.
                <br />Current points: {drawingPath.length}
              </div>
            )}

            {drawnRoutes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Active Routes ({drawnRoutes.length})
                  </span>
                  <Button
                    onClick={clearAllRoutes}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {drawnRoutes.map(route => (
                    <div key={route.id} className="flex items-center justify-between p-2 bg-secondary rounded text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getVehicleColor(route.type) }}
                        />
                        <span className="text-foreground">
                          {route.type === 'ambulance' ? '🚑' : route.type === 'fire' ? '🚒' : '🚓'} 
                          {route.type.charAt(0).toUpperCase() + route.type.slice(1)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {route.path.length} points
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Traffic Density Stats */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3 text-foreground">Traffic Density</h3>
          <div className="space-y-3">
            {trafficDensity.map((density, index) => (
              <div key={index} className="p-2 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-1">
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      density.density === 'high' ? 'border-traffic-high text-traffic-high' :
                      density.density === 'medium' ? 'border-traffic-medium text-traffic-medium' :
                      'border-traffic-low text-traffic-low'
                    }`}
                  >
                    {density.density.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {density.vehicleCount} vehicles
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg Speed: {density.averageSpeed} km/h
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TrafficMap;