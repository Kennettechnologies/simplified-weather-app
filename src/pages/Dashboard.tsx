import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily');

  useEffect(() => {
    loadCurrentLocationWeather();
  }, []);

  const loadCurrentLocationWeather = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const { data, error } = await supabase.functions.invoke('weather', {
                body: { lat: latitude, lon: longitude }
              });

              if (error) throw error;
              updateWeatherData(data);
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
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { city: 'Nairobi' }
      });

      if (error) throw error;
      updateWeatherData(data);
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
        aqi: data.current.aqi,
        aqiDescription: data.current.aqiDescription,
        cloudiness: data.current.cloudiness,
        precipitation: data.current.precipitation,
        sunrise: data.current.sunrise,
        sunset: data.current.sunset,
        icon: data.current.icon,
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
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { city: searchCity.trim() }
      });

      if (error) throw error;
      updateWeatherData(data);

      toast({
        title: "Weather updated",
        description: `Loaded weather data for ${data.current.location}`,
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
        return <Cloud className={`${className} text-gray-500`} />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Enhanced share weather function with fallback
  const shareWeather = async () => {
    if (!weatherData) {
      toast({
        title: "No weather data",
        description: "Please load weather data first",
        variant: "destructive",
      });
      return;
    }

    const shareText = `🌤️ Weather in ${weatherData.location}\n🌡️ ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)\n📝 ${weatherData.description}\n💧 Humidity: ${weatherData.humidity}%\n💨 Wind: ${weatherData.windSpeed} km/h`;
    
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Weather in ${weatherData.location}`,
          text: shareText,
          url: window.location.href
        });
        toast({
          title: "Weather shared successfully!",
          description: "Weather information has been shared",
        });
      } catch (error) {
        // User cancelled sharing
        if (error.name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(shareText);
    }
  };

  // Copy to clipboard fallback
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Weather copied to clipboard!",
        description: "Weather information has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share weather information",
        variant: "destructive",
      });
    }
  };

  // Enhanced refresh function
  const refreshWeatherData = async () => {
    setLoading(true);
    try {
      if (weatherData?.cityName) {
        // Refresh by city name
        const { data, error } = await supabase.functions.invoke('weather', {
          body: { city: weatherData.cityName }
        });
        if (error) throw error;
        updateWeatherData(data);
      } else {
        // Refresh by current location
        await loadCurrentLocationWeather();
      }
      toast({
        title: "Weather data refreshed!",
        description: "Latest weather information has been loaded",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh weather data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigate to settings
  const navigateToSettings = () => {
    window.location.href = '/settings';
  };

  // Show weather alerts
  const showWeatherAlerts = () => {
    if (!weatherData) {
      toast({
        title: "No weather data",
        description: "Please load weather data first to view alerts",
        variant: "destructive",
      });
      return;
    }
    
    // Check for weather conditions that warrant alerts
    const alerts = [];
    if (weatherData.temperature < 0) alerts.push("❄️ Freezing temperatures - Dress warmly!");
    if (weatherData.temperature > 35) alerts.push("🔥 High temperature warning - Stay hydrated!");
    if (weatherData.windSpeed > 30) alerts.push("💨 Strong wind advisory - Secure loose objects!");
    if (weatherData.humidity > 85) alerts.push("💧 High humidity - Expect muggy conditions!");
    if (weatherData.description.toLowerCase().includes('storm')) alerts.push("⛈️ Storm warning - Stay indoors!");
    if (weatherData.description.toLowerCase().includes('rain')) alerts.push("🌧️ Rain expected - Bring an umbrella!");
    
    if (alerts.length === 0) {
      toast({
        title: "No weather alerts",
        description: "Current weather conditions are normal",
      });
    } else {
      toast({
        title: "Weather Alerts",
        description: alerts[0], // Show first alert in toast
        duration: 5000,
      });
    }
  };

  // Enhanced view on maps
  const viewOnMaps = () => {
    if (!weatherData) {
      toast({
        title: "No location data",
        description: "Please load weather data first",
        variant: "destructive",
      });
      return;
    }

    const url = `https://www.google.com/maps?q=${weatherData.lat},${weatherData.lon}&z=12`;
    window.open(url, '_blank');
    
    toast({
      title: "Opening maps",
      description: `Showing ${weatherData.location} on Google Maps`,
    });
  };

  const handleSaveCity = async () => {
    if (!weatherData || !user) return;
    try {
      const cityName = weatherData.cityName || weatherData.location.split(',')[0].trim();
      const countryCode = weatherData.countryCode || weatherData.location.split(',')[1]?.trim() || '';
      
      const { data: existing } = await supabase
        .from('saved_cities')
        .select('id')
        .eq('user_id', user.id)
        .eq('latitude', weatherData.lat)
        .eq('longitude', weatherData.lon)
        .single();
      
      if (existing) {
        toast({ title: 'Already Saved', description: `${weatherData.location} is already in your saved cities.` });
        return;
      }
      
      const { error } = await supabase.from('saved_cities').insert({
        user_id: user.id,
        city_name: cityName,
        country_code: countryCode,
        latitude: weatherData.lat,
        longitude: weatherData.lon,
      });
      
      if (error) throw error;
      toast({ title: 'Saved', description: `Saved ${weatherData.location} to your cities.` });
    } catch (error: any) {
      console.error('Save city error:', error);
      if (error.code === '23505') {
        toast({ title: 'Already Saved', description: `${weatherData.location} is already in your saved cities.` });
      } else {
        toast({ title: 'Error', description: 'Failed to save city', variant: 'destructive' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
          
          <div className="mt-6">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.email?.split('@')[0]}</h1>
            <p className="text-muted-foreground">Your comprehensive weather dashboard</p>
            {weatherData && (
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={() => window.location.href = '/settings'} className="hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => window.location.href = '/settings'} className="hover:scale-105 transition-transform">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="hover:scale-105 transition-transform">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Enhanced Search */}
        <Card className="mb-6 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm border-primary/20">
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
              <Button type="submit" disabled={searchLoading} className="hover:scale-105 transition-transform">
                {searchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Weather Alerts */}
        <WeatherAlerts weatherData={weatherData} className="mb-6" />

        {/* Weather Widgets Grid */}
        <WeatherWidgets weatherData={weatherData} className="mb-6" />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          {/* Main Weather Display */}
          <div className="xl:col-span-2">
            <Card className="h-full bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-weather border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl">{weatherData?.location}</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSaveCity} disabled={!weatherData} className="hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-1" />
                    Save City
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-8">
                  <div className="animate-fade-in">
                    <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {weatherData?.temperature}°C
                    </div>
                    <div className="text-xl text-muted-foreground mb-2">{weatherData?.description}</div>
                    <div className="text-lg text-muted-foreground">Feels like {weatherData?.feelsLike}°C</div>
                    {weatherData?.suggestions && weatherData.suggestions.length > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm font-medium text-primary mb-1">💡 Weather Tip:</p>
                        <p className="text-sm text-muted-foreground">{weatherData.suggestions[0]}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right animate-scale-in">
                    {getWeatherIcon(weatherData?.icon || 'partly-cloudy', 'w-32 h-32')}
                  </div>
                </div>

                {/* Detailed Weather Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 hover:scale-105 transition-transform">
                    <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-lg font-bold">{weatherData?.humidity}%</div>
                    <div className="text-xs text-muted-foreground">Humidity</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 hover:scale-105 transition-transform">
                    <Wind className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="text-lg font-bold">{weatherData?.windSpeed} km/h</div>
                    <div className="text-xs text-muted-foreground">Wind</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 hover:scale-105 transition-transform">
                    <Gauge className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <div className="text-lg font-bold">{weatherData?.pressure} hPa</div>
                    <div className="text-xs text-muted-foreground">Pressure</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 hover:scale-105 transition-transform">
                    <Eye className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-lg font-bold">{weatherData?.visibility} km</div>
                    <div className="text-xs text-muted-foreground">Visibility</div>
                  </div>
                </div>

                {/* Sun Times */}
                <div className="flex justify-around pt-4 border-t border-primary/20">
                  <div className="flex items-center gap-3 animate-fade-in">
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-950/20">
                      <Sunrise className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-lg font-medium">{weatherData?.sunrise}</div>
                      <div className="text-xs text-muted-foreground">Sunrise</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 animate-fade-in">
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-950/20">
                      <Sunset className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-lg font-medium">{weatherData?.sunset}</div>
                      <div className="text-xs text-muted-foreground">Sunset</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Weather Assistant */}
          <div className="xl:col-span-2">
            <WeatherAssistant weatherData={weatherData} className="h-full" />
          </div>
        </div>

        {/* Interactive Weather Map */}
        <WeatherMap lat={weatherData?.lat} lon={weatherData?.lon} className="mb-6" />

        {/* Advanced Forecast */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm shadow-weather border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Advanced Weather Forecast</CardTitle>
              <div className="flex rounded-lg bg-muted p-1">
                <Button
                  variant={activeTab === 'hourly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('hourly')}
                  className="text-sm hover:scale-105 transition-transform"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  24-Hour
                </Button>
                <Button
                  variant={activeTab === 'daily' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('daily')}
                  className="text-sm hover:scale-105 transition-transform"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  7-Day
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'hourly' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {hourlyForecast.slice(0, 8).map((hour, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-gradient-to-b from-muted/50 to-muted/30 hover:bg-muted/60 transition-all duration-200 hover:scale-105 animate-fade-in border border-primary/10">
                    <div className="text-sm font-medium mb-3">{hour.time}</div>
                    <div className="flex justify-center mb-3">
                      {getWeatherIcon(hour.icon, 'w-8 h-8')}
                    </div>
                    <div className="text-lg font-bold mb-2">{hour.temperature}°C</div>
                    <div className="text-xs text-muted-foreground mb-1">
                      <Droplets className="w-3 h-3 inline mr-1" />
                      {hour.humidity}%
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      <Wind className="w-3 h-3 inline mr-1" />
                      {hour.windSpeed}km/h
                    </div>
                    {hour.precipitation > 0 && (
                      <div className="text-xs text-blue-500">
                        <CloudRain className="w-3 h-3 inline mr-1" />
                        {hour.precipitation}mm
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-gradient-to-b from-muted/50 to-muted/30 hover:bg-muted/60 transition-all duration-200 hover:scale-105 animate-fade-in border border-primary/10">
                    <div className="text-lg font-medium mb-3">{day.date}</div>
                    <div className="flex justify-center mb-3">
                      {getWeatherIcon(day.icon, 'w-10 h-10')}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3" title={day.description}>
                      {day.description.length > 20 ? day.description.substring(0, 20) + '...' : day.description}
                    </div>
                    <div className="flex justify-between text-lg mb-3">
                      <span className="font-bold">{day.high}°</span>
                      <span className="text-muted-foreground">{day.low}°</span>
                    </div>
                    {day.humidity && (
                      <div className="text-xs text-muted-foreground mb-1">
                        <Droplets className="w-3 h-3 inline mr-1" />
                        {day.humidity}%
                      </div>
                    )}
                    {day.windSpeed && (
                      <div className="text-xs text-muted-foreground">
                        <Wind className="w-3 h-3 inline mr-1" />
                        {day.windSpeed}km/h
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Quick Actions & Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary"
                onClick={loadCurrentLocationWeather}
                disabled={loading}
              >
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-950/20">
                  <Navigation className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm font-medium">Use My Location</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary"
                onClick={refreshWeatherData}
                disabled={loading}
              >
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-950/20">
                  <RefreshCw className={`w-6 h-6 text-green-500 ${loading ? 'animate-spin' : ''}`} />
                </div>
                <span className="text-sm font-medium">Refresh Data</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary"
                onClick={navigateToSettings}
              >
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950/20">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Settings</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary"
                onClick={showWeatherAlerts}
                disabled={!weatherData}
              >
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-950/20">
                  <Bell className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm font-medium">Weather Alerts</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary"
                onClick={viewOnMaps}
                disabled={!weatherData}
              >
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-950/20">
                  <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-sm font-medium">View on Maps</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-all duration-200 border-primary/20 hover:border-primary"
                onClick={shareWeather}
                disabled={!weatherData}
                title={navigator.share ? "Share weather info" : "Copy weather to clipboard"}
              >
                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-950/20">
                  {navigator.share ? (
                    <Share className="w-6 h-6 text-indigo-500" />
                  ) : (
                    <Copy className="w-6 h-6 text-indigo-500" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {navigator.share ? "Share Weather" : "Copy Weather"}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}