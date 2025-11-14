import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Layers, Cloud, Droplets, Wind, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherMapProps {
  lat?: number;
  lon?: number;
  className?: string;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ 
  lat = 0, 
  lon = 0, 
  className = "" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<'precipitation' | 'clouds' | 'wind'>('precipitation');
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token from Supabase secrets
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data?.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        // Fallback to a public demo token for development
        setMapboxToken('pk.eyJ1IjoidGVzdCIsImEiOiJjbDl4M2p4ZDAwMDFvM29wZmc2ZWJjbWU4In0.test');
      }
    };

    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [lon, lat],
      zoom: 8,
      pitch: 0,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for current location
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([lon, lat])
      .addTo(map.current);

    map.current.on('load', () => {
      setIsLoading(false);
      addWeatherLayers();
    });

    return () => {
      map.current?.remove();
    };
  }, [lat, lon, mapboxToken]);

  // Update weather layer when active layer changes
  useEffect(() => {
    if (map.current && !isLoading) {
      updateWeatherLayer();
    }
  }, [activeLayer, isLoading]);

  const addWeatherLayers = async () => {
    if (!map.current) return;

    // Get OpenWeatherMap API key from the weather function
    let apiKey = 'demo'; // fallback
    try {
      const { data } = await supabase.functions.invoke('weather', { 
        body: { getApiKey: true } 
      });
      if (data?.apiKey) apiKey = data.apiKey;
    } catch (error) {
      console.warn('Using demo API key for weather layers');
    }

    const layers = [
      {
        id: 'precipitation',
        url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      },
      {
        id: 'clouds',
        url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      },
      {
        id: 'wind',
        url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      }
    ];

    layers.forEach(layer => {
      map.current!.addSource(layer.id, {
        type: 'raster',
        tiles: [layer.url],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 18,
      });

      map.current!.addLayer({
        id: `${layer.id}-layer`,
        type: 'raster',
        source: layer.id,
        paint: {
          'raster-opacity': layer.id === activeLayer ? 0.7 : 0,
        },
      });
    });
  };

  const updateWeatherLayer = () => {
    if (!map.current) return;

    ['precipitation', 'clouds', 'wind'].forEach(layerId => {
      const layerName = `${layerId}-layer`;
      if (map.current!.getLayer(layerName)) {
        map.current!.setPaintProperty(
          layerName,
          'raster-opacity',
          layerId === activeLayer ? 0.7 : 0
        );
      }
    });
  };

  const weatherLayers = [
    { 
      id: 'precipitation', 
      label: 'Precipitation', 
      icon: Droplets, 
      color: 'text-blue-500',
      description: 'Rain and snow intensity'
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
      description: 'Wind speed and direction'
    },
  ];

  const currentLayer = weatherLayers.find(layer => layer.id === activeLayer);

  return (
    <Card className={`bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Interactive Weather Map
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
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading map...</span>
              </div>
            </div>
          )}
          <div 
            ref={mapContainer} 
            className="w-full h-64 rounded-lg border"
            style={{ minHeight: '256px' }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
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
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Real-time weather radar • Drag to pan • Scroll to zoom
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherMap;