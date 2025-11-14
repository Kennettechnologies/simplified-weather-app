import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  MapPin, 
  Search, 
  Settings,
  Bell,
  Plus,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sunrise,
  Sunset,
  Gauge,
  Clock,
  Zap,
  Activity,
  Lightbulb,
  AlertTriangle,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  Moon,
  Waves,
  Navigation,
  RefreshCw,
  Loader2,
  Share,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import WeatherMap from '@/components/WeatherMap';
import WeatherAlerts from '@/components/WeatherAlerts';
import WeatherWidgets, { SunriseSunsetWidget, CompassWidget } from '@/components/WeatherWidgets';
import WeatherAssistant from '@/components/WeatherAssistant';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  icon: string;
  lat: number;
  lon: number;
  cityName?: string;
  countryCode?: string;
  stateCode?: string;
  aqi?: number;
  aqiDescription?: string;
  cloudiness?: number;
  precipitation?: number;
  suggestions?: string[];
}

interface ForecastDay {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily');

  useEffect(() => {
    loadCurrentLocationWeather();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      // Since we're using MongoDB now, just use the user data from auth
      if (user.full_name) {
        setUserName(user.full_name);
      } else {
        // Fallback to email username if no full_name
        setUserName(user.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to email username
      setUserName(user.email?.split('@')[0] || 'User');
    }
  };

  const loadCurrentLocationWeather = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(`${API_BASE_URL}/api/weather`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: latitude, lon: longitude })
              });

              if (!response.ok) {
                throw new Error('Weather API request failed');
              }

              const data = await response.json();
              const transformedData = { current: data };
              updateWeatherData(transformedData);
            } catch (error) {
              console.error('Location weather error:', error);
              loadDefaultWeather();
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            loadDefaultWeather();
          }
        );
      } else {
        loadDefaultWeather();
      }
    } catch (error) {
      console.error('Weather loading error:', error);
      loadDefaultWeather();
    }
  };

  const loadDefaultWeather = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: 'Nairobi' })
      });

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      const transformedData = { current: data };
      updateWeatherData(transformedData);
    } catch (error) {
      console.error('Default weather error:', error);
      toast({
        title: "Error",
        description: "Failed to load weather data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWeatherData = (data: any) => {
    if (data.current) {
      setWeatherData({
        location: data.current.location,
        cityName: data.current.cityName,
        countryCode: data.current.countryCode,
        lat: data.current.lat,
        lon: data.current.lon,
        temperature: data.current.temperature,
        description: data.current.description,
        feelsLike: data.current.feelsLike,
        humidity: data.current.humidity,
        windSpeed: data.current.windSpeed,
        pressure: data.current.pressure,
        visibility: data.current.visibility,
        uvIndex: data.current.uvIndex,
        sunrise: data.current.sunrise || '06:00',
        sunset: data.current.sunset || '18:00',
        icon: data.current.icon,
        aqi: data.current.aqi,
        aqiDescription: data.current.aqiDescription,
        cloudiness: data.current.cloudiness,
        precipitation: data.current.precipitation,
        suggestions: data.current.suggestions
      });
    }

    if (data.forecast) {
      setForecast(data.forecast);
    }

    if (data.hourly) {
      setHourlyForecast(data.hourly);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;

    setSearchLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: searchCity.trim() })
      });

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      
      // Transform the data to match expected format
      const transformedData = {
        current: {
          location: data.location,
          cityName: data.cityName,
          countryCode: data.countryCode,
          lat: data.lat,
          lon: data.lon,
          temperature: data.temperature,
          description: data.description,
          feelsLike: data.feelsLike,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          pressure: data.pressure,
          visibility: data.visibility,
          uvIndex: data.uvIndex,
          icon: data.icon
        }
      };

      updateWeatherData(transformedData);

      toast({
        title: "Weather updated",
        description: `Loaded weather data for ${data.location}`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search for city. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
      setSearchCity('');
    }
  };

  const getWeatherIcon = (iconType: string, className = "w-8 h-8") => {
    switch (iconType) {
      case 'sunny':
        return <Sun className={`${className} text-yellow-500 animate-pulse`} />;
      case 'clear-night':
        return <Moon className={`${className} text-blue-300`} />;
      case 'partly-cloudy':
        return <Cloud className={`${className} text-gray-500`} />;
      case 'cloudy':
        return <Cloud className={`${className} text-gray-600`} />;
      case 'rain':
        return <CloudRain className={`${className} text-blue-500 animate-bounce`} />;
      case 'thunderstorm':
        return <CloudLightning className={`${className} text-purple-600 animate-pulse`} />;
      case 'snow':
        return <Snowflake className={`${className} text-blue-200 animate-spin`} />;
      case 'fog':
        return <Waves className={`${className} text-gray-400`} />;
      default:
        return <Sun className={`${className} text-yellow-500`} />;
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-800';
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Cloud className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  WeatherApp
                </h1>
              </div>
              <div className="hidden md:block text-sm text-muted-foreground">
                Welcome back, {userName}!
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for any city worldwide..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary"
                />
              </div>
              <Button type="submit" disabled={searchLoading}>
                {searchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {weatherData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Weather Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {weatherData.location}
                      </h2>
                      <p className="text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={loadCurrentLocationWeather}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(weatherData.icon, "w-16 h-16")}
                      <div>
                        <div className="text-4xl font-bold">
                          {weatherData.temperature}°C
                        </div>
                        <div className="text-lg text-muted-foreground capitalize">
                          {weatherData.description}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Feels like {weatherData.feelsLike}°C
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span>{weatherData.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-gray-500" />
                        <span>{weatherData.windSpeed} m/s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-purple-500" />
                        <span>{weatherData.pressure} hPa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-500" />
                        <span>{weatherData.visibility} km</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Widgets */}
              <WeatherWidgets weatherData={weatherData} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weather Alerts */}
              <WeatherAlerts weatherData={weatherData} />
              
              {/* Weather Assistant */}
              <WeatherAssistant weatherData={weatherData} />
            </div>
          </div>
        )}

        {/* Weather Map */}
        {weatherData && (
          <WeatherMap 
            lat={weatherData.lat} 
            lon={weatherData.lon} 
            city={weatherData.cityName || weatherData.location}
          />
        )}
      </main>
    </div>
  );
}