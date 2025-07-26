import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrafficMap from '@/components/TrafficMap';
import TrafficDashboard from '@/components/TrafficDashboard';
import ApiKeyInput from '@/components/ApiKeyInput';
import { Map, BarChart3 } from 'lucide-react';

const Index = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    // Check localStorage for saved API key
    if (typeof window !== 'undefined') {
      return localStorage.getItem('googleMapsApiKey') || '';
    }
    return '';
  });

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    // Save to localStorage for future sessions
    localStorage.setItem('googleMapsApiKey', key);
  };

  if (!apiKey) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="map" className="h-screen flex flex-col">
        <div className="border-b border-border bg-card px-6 py-3">
          <TabsList className="grid w-fit grid-cols-2 bg-muted">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Traffic Map
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="map" className="flex-1 p-6 m-0">
          <TrafficMap apiKey={apiKey} />
        </TabsContent>
        
        <TabsContent value="dashboard" className="flex-1 m-0">
          <TrafficDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
