import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrafficLight, EmergencyVehicle, TrafficDensity } from '@/types/traffic';
import { MapPin, AlertTriangle, Clock, Navigation } from 'lucide-react';

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

  // Initialize sample data for Kottakal
  useEffect(() => {
    const sampleTrafficLights: TrafficLight[] = [
      {
        id: 'tl-001',
        name: 'Kottakal Main Junction',
        position: { lat: 11.0510, lng: 75.9949 },
        status: 'green',
        timing: { red: 60, yellow: 10, green: 90 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-002',
        name: 'Hospital Road',
        position: { lat: 11.0520, lng: 75.9939 },
        status: 'red',
        timing: { red: 45, yellow: 8, green: 75 },
        lastUpdated: new Date()
      },
      {
        id: 'tl-003',
        name: 'Market Street',
        position: { lat: 11.0500, lng: 75.9959 },
        status: 'yellow',
        timing: { red: 50, yellow: 10, green: 80 },
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

    setTrafficLights(sampleTrafficLights);
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
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

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