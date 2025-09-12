import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge,
  Sun,
  Moon,
  CloudRain,
  Navigation
} from 'lucide-react';

interface WeatherWidgetsProps {
  weatherData?: any;
  className?: string;
}

export const WeatherWidgets: React.FC<WeatherWidgetsProps> = ({ 
  weatherData, 
  className = "" 
}) => {
  if (!weatherData) return null;

  const widgets = [
    {
      id: 'feels-like',
      title: 'Feels Like',
      value: `${weatherData.feelsLike}°C`,
      icon: Thermometer,
      color: 'text-orange-500',
      background: 'bg-orange-50 dark:bg-orange-950/20'
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: `${weatherData.humidity}%`,
      icon: Droplets,
      color: 'text-blue-500',
      background: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      id: 'wind',
      title: 'Wind Speed',
      value: `${weatherData.windSpeed} km/h`,
      icon: Wind,
      color: 'text-green-500',
      background: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      id: 'visibility',
      title: 'Visibility',
      value: `${weatherData.visibility} km`,
      icon: Eye,
      color: 'text-purple-500',
      background: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      id: 'pressure',
      title: 'Pressure',
      value: `${weatherData.pressure} hPa`,
      icon: Gauge,
      color: 'text-gray-500',
      background: 'bg-gray-50 dark:bg-gray-950/20'
    },
    {
      id: 'precipitation',
      title: 'Precipitation',
      value: `${weatherData.precipitation || 0} mm`,
      icon: CloudRain,
      color: 'text-blue-600',
      background: 'bg-blue-50 dark:bg-blue-950/20'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {widgets.map((widget) => (
        <Card 
          key={widget.id} 
          className="bg-card/50 backdrop-blur-sm hover:scale-105 transition-all duration-200 animate-fade-in"
        >
          <CardContent className="p-4">
            <div className={`rounded-full p-3 mb-3 ${widget.background} w-fit`}>
              <widget.icon className={`w-5 h-5 ${widget.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{widget.title}</p>
              <p className="text-lg font-bold">{widget.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const SunriseSunsetWidget: React.FC<{ weatherData?: any }> = ({ weatherData }) => {
  if (!weatherData) return null;

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-3 bg-orange-50 dark:bg-orange-950/20">
              <Sun className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sunrise</p>
              <p className="text-sm font-bold">{weatherData.sunrise}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full p-3 bg-orange-50 dark:bg-orange-950/20">
              <Moon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sunset</p>
              <p className="text-sm font-bold">{weatherData.sunset}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CompassWidget: React.FC<{ weatherData?: any }> = ({ weatherData }) => {
  if (!weatherData) return null;

  // Calculate wind direction (this would come from API in real implementation)
  const windDirection = 45; // degrees, placeholder

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20"></div>
            <div 
              className="absolute top-1 left-1/2 w-0.5 h-6 bg-red-500 origin-bottom transform -translate-x-1/2"
              style={{ transform: `translate(-50%, 0) rotate(${windDirection}deg)` }}
            ></div>
            <Navigation 
              className="absolute top-1/2 left-1/2 w-4 h-4 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
              style={{ transform: `translate(-50%, -50%) rotate(${windDirection}deg)` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Wind Direction</p>
          <p className="text-sm font-bold">{windDirection}° NE</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidgets;