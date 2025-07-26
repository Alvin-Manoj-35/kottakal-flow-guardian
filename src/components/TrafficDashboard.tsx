import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  Car, 
  Clock, 
  MapPin, 
  Navigation, 
  Users,
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react';

interface DashboardStats {
  totalVehicles: number;
  activeIncidents: number;
  emergencyVehicles: number;
  trafficLights: number;
  averageSpeed: number;
  congestionLevel: number;
}

const TrafficDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 1247,
    activeIncidents: 3,
    emergencyVehicles: 2,
    trafficLights: 10, // Updated to reflect the 10 main junctions
    averageSpeed: 23,
    congestionLevel: 68
  });

  const [emergencyMode, setEmergencyMode] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalVehicles: prev.totalVehicles + Math.floor(Math.random() * 10 - 5),
        averageSpeed: Math.max(10, Math.min(60, prev.averageSpeed + Math.floor(Math.random() * 6 - 3))),
        congestionLevel: Math.max(0, Math.min(100, prev.congestionLevel + Math.floor(Math.random() * 10 - 5)))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activateEmergencyMode = () => {
    setEmergencyMode(true);
    // In a real system, this would trigger emergency protocols
    setTimeout(() => setEmergencyMode(false), 30000); // Auto-deactivate after 30 seconds
  };

  const getCongestionColor = (level: number) => {
    if (level < 30) return 'text-traffic-low';
    if (level < 70) return 'text-traffic-medium';
    return 'text-traffic-high';
  };

  const getCongestionBg = (level: number) => {
    if (level < 30) return 'bg-traffic-low';
    if (level < 70) return 'bg-traffic-medium';
    return 'bg-traffic-high';
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-dashboard min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kottakal Traffic Control Center</h1>
          <p className="text-muted-foreground">Real-time traffic management and emergency response</p>
        </div>
        <Button
          onClick={activateEmergencyMode}
          variant={emergencyMode ? "destructive" : "outline"}
          className={`${emergencyMode ? 'animate-pulse-emergency bg-emergency text-foreground' : ''}`}
        >
          <Shield className="mr-2 h-4 w-4" />
          {emergencyMode ? 'Emergency Active' : 'Emergency Mode'}
        </Button>
      </div>

      {/* Emergency Alert */}
      {emergencyMode && (
        <Card className="border-emergency bg-emergency/10 shadow-emergency">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-emergency animate-pulse" />
              <div>
                <h3 className="font-semibold text-foreground">Emergency Mode Activated</h3>
                <p className="text-sm text-muted-foreground">
                  All traffic lights prioritizing emergency vehicle passage. Clear routes being optimized.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-control">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalVehicles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2.3% from last hour
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-control">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-traffic-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeIncidents}</div>
            <p className="text-xs text-traffic-medium">
              2 accidents, 1 construction
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-control">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emergency Vehicles</CardTitle>
            <Navigation className="h-4 w-4 text-emergency" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.emergencyVehicles}</div>
            <p className="text-xs text-emergency">
              1 ambulance, 1 fire truck
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-control">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Speed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.averageSpeed} km/h</div>
            <p className="text-xs text-muted-foreground">
              Normal traffic flow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Congestion Indicator */}
      <Card className="bg-card border-border shadow-control">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="h-5 w-5" />
            Traffic Congestion Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Level</span>
            <Badge 
              variant="outline" 
              className={`${getCongestionColor(stats.congestionLevel)} border-current`}
            >
              {stats.congestionLevel < 30 ? 'Light' : stats.congestionLevel < 70 ? 'Moderate' : 'Heavy'}
            </Badge>
          </div>
          <Progress 
            value={stats.congestionLevel} 
            className="w-full"
            style={{
              background: 'hsl(var(--muted))'
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Light</span>
            <span>Moderate</span>
            <span>Heavy</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border shadow-control">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Traffic Light Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Zap className="mr-2 h-4 w-4" />
              Optimize Timing
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Schedule Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-control">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Emergency Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Navigation className="mr-2 h-4 w-4" />
              Dispatch Vehicle
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Clear Routes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-control">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Traffic Lights</span>
              <Badge variant="outline" className="text-traffic-low border-traffic-low">
                10/10 Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Cameras</span>
              <Badge variant="outline" className="text-traffic-low border-traffic-low">
                24/24 Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Sensors</span>
              <Badge variant="outline" className="text-traffic-medium border-traffic-medium">
                18/20 Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrafficDashboard;