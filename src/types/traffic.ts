export interface TrafficLight {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  status: 'red' | 'yellow' | 'green';
  timing: {
    red: number;
    yellow: number;
    green: number;
  };
  lastUpdated: Date;
}

export interface EmergencyVehicle {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  position: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  status: 'dispatched' | 'en_route' | 'arrived';
  priority: 'high' | 'medium' | 'low';
  estimatedArrival: Date;
}

export interface TrafficDensity {
  position: { lat: number; lng: number };
  density: 'low' | 'medium' | 'high';
  vehicleCount: number;
  averageSpeed: number;
  timestamp: Date;
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'roadblock' | 'construction' | 'weather';
  position: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high';
  description: string;
  reportedAt: Date;
  estimatedClearance?: Date;
}