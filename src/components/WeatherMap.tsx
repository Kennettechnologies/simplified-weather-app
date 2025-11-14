import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Layers, Cloud, Droplets, Wind, Loader2, ExternalLink } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface WeatherMapProps {
  lat?: number;
  lon?: number;
  city?: string;
  className?: string;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ 
  lat = 0, 
  lon = 0, 
  city = "Unknown Location",
  className = "" 
}) => {
  const [activeLayer, setActiveLayer] = useState<'precipitation' | 'clouds' | 'wind'>('precipitation');
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token from your Express API
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/get-mapbox-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMapboxToken(data.token);
        } else {
          throw new Error('Failed to fetch token');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        // Use a fallback - simple embedded map
        setMapboxToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  const weatherLayers = [
    { 
      id: 'precipitation', 
      label: 'Rain', 
      icon: Droplets, 
      color: 'text-blue-500',
      description: 'Precipitation forecast'
    },
    { 
      id: 'clouds', 
      label: 'Clouds', 
      icon: Cloud, 
      color: 'text-gray-500',
      description: 'Cloud coverage'
    },
    { 
      id: 'wind', 
      label: 'Wind', 
      icon: Wind, 
      color: 'text-green-500',
      description: 'Wind patterns'
    },
  ];

  const currentLayer = weatherLayers.find(layer => layer.id === activeLayer);

  // Generate weather map URLs
  const getWeatherMapUrl = () => {
    const zoom = 8;
    const centerLat = lat || 0;
    const centerLon = lon || 0;
    
    return `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=${activeLayer}&lat=${centerLat}&lon=${centerLon}&zoom=${zoom}`;
  };

  const getStaticMapUrl = () => {
    const zoom = 10;
    const width = 600;
    const height = 300;
    
    // Using OpenStreetMap-based static map (free alternative)
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+3b82f6(${lon},${lat})/${lon},${lat},${zoom}/${width}x${height}@2x?access_token=${mapboxToken}`;
  };

  if (isLoading) {
    return (
      <Card className={`bg-card/50 backdrop-blur-sm border-primary/10 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Interactive Weather Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 rounded-lg border bg-muted/20 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading map...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-primary/10 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Weather Map - {city}
          </CardTitle>
          <div className="flex gap-1">
            {weatherLayers.map((layer) => (
              <Button
                key={layer.id}
                variant={activeLayer === layer.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveLayer(layer.id as any)}
                className="text-xs"
                title={layer.description}
              >
                <layer.icon className={`w-3 h-3 mr-1 ${layer.color}`} />
                {layer.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Static Map Preview */}
          {mapboxToken ? (
            <div className="relative">
              <img 
                src={getStaticMapUrl()} 
                alt={`Map of ${city}`}
                className="w-full h-64 rounded-lg border object-cover"
                onError={(e) => {
                  // Fallback to simple placeholder
                  e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#f1f5f9"/>
                      <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="16" fill="#64748b">
                        📍 ${city}
                      </text>
                      <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="12" fill="#94a3b8">
                        ${lat.toFixed(4)}, ${lon.toFixed(4)}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
              <div className="absolute top-2 right-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(getWeatherMapUrl(), '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Full Map
                </Button>
              </div>
            </div>
          ) : (
            // Simple fallback when no Mapbox token
            <div className="w-full h-64 rounded-lg border bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 flex flex-col items-center justify-center">
              <MapPin className="w-12 h-12 text-primary mb-2" />
              <h3 className="text-lg font-semibold">{city}</h3>
              <p className="text-sm text-muted-foreground">
                {lat.toFixed(4)}, {lon.toFixed(4)}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(getWeatherMapUrl(), '_blank')}
                className="mt-3 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Weather Map
              </Button>
            </div>
          )}

          {/* Weather Layer Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <currentLayer.icon className={`w-4 h-4 ${currentLayer.color}`} />
              <span className="text-sm font-medium">
                {currentLayer.label}: {currentLayer.description}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {lat.toFixed(4)}, {lon.toFixed(4)}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank')}
              className="flex-1"
            >
              Google Maps
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getWeatherMapUrl(), '_blank')}
              className="flex-1"
            >
              Weather Radar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherMap;