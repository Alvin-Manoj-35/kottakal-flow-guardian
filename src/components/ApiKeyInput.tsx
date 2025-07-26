import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Key, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-control">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Kottakal Traffic Management System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your Google Maps API key to access the traffic control dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey" className="text-sm font-medium text-foreground">
                Google Maps API Key
              </Label>
              <Input
                id="apikey"
                type={showKey ? 'text' : 'password'}
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-input border-border text-foreground"
                required
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKey ? 'Hide' : 'Show'} API key
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={!apiKey.trim()}
            >
              Access Traffic Control System
            </Button>
          </form>

          <div className="rounded-lg bg-muted/50 p-3 border border-border">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-xs text-foreground font-medium">
                  Need a Google Maps API key?
                </p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to Google Cloud Console</li>
                  <li>Enable Maps JavaScript API</li>
                  <li>Create credentials (API key)</li>
                  <li>Restrict the API key to your domain</li>
                </ol>
                <a
                  href="https://console.cloud.google.com/google/maps-apis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Open Google Cloud Console
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and used only for map services
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyInput;