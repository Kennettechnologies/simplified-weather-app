import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, X, Info, Zap, Cloud, Wind } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  type: 'thunderstorm' | 'rain' | 'wind' | 'temperature' | 'other';
  isActive: boolean;
  timestamp: Date;
}

interface WeatherAlertsProps {
  weatherData?: any;
  className?: string;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ 
  weatherData, 
  className = "" 
}) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check for notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Generate alerts based on weather data
    if (weatherData) {
      generateAlerts(weatherData);
    }
  }, [weatherData]);

  const generateAlerts = (data: any) => {
    const newAlerts: WeatherAlert[] = [];

    // Temperature alerts
    if (data.temperature < -10) {
      newAlerts.push({
        id: 'temp-extreme-cold',
        title: 'Extreme Cold Warning',
        description: `Temperature is ${data.temperature}°C. Risk of frostbite and hypothermia.`,
        severity: 'extreme',
        type: 'temperature',
        isActive: true,
        timestamp: new Date()
      });
    } else if (data.temperature > 40) {
      newAlerts.push({
        id: 'temp-extreme-heat',
        title: 'Extreme Heat Warning',
        description: `Temperature is ${data.temperature}°C. Risk of heat stroke and dehydration.`,
        severity: 'extreme',
        type: 'temperature',
        isActive: true,
        timestamp: new Date()
      });
    }

    // Wind alerts
    if (data.windSpeed > 50) {
      newAlerts.push({
        id: 'wind-high',
        title: 'High Wind Warning',
        description: `Wind speeds of ${data.windSpeed} km/h. Avoid outdoor activities.`,
        severity: 'high',
        type: 'wind',
        isActive: true,
        timestamp: new Date()
      });
    }

    // Air quality alerts
    if (data.aqi >= 4) {
      newAlerts.push({
        id: 'air-quality-poor',
        title: 'Poor Air Quality Alert',
        description: `Air quality is ${data.aqiDescription}. Consider staying indoors.`,
        severity: 'high',
        type: 'other',
        isActive: true,
        timestamp: new Date()
      });
    }

    // UV alerts
    if (data.uvIndex > 8) {
      newAlerts.push({
        id: 'uv-high',
        title: 'High UV Index Alert',
        description: `UV Index is ${data.uvIndex}. Use strong sun protection.`,
        severity: 'moderate',
        type: 'other',
        isActive: true,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);

    // Send notifications for severe alerts
    if (notificationsEnabled && newAlerts.some(alert => alert.severity === 'extreme' || alert.severity === 'high')) {
      sendNotification(newAlerts[0]);
    }
  };

  const sendNotification = (alert: WeatherAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.description,
        icon: '/favicon.ico',
        tag: alert.id
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive weather alerts'
        });
      }
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'destructive';
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'thunderstorm': return Zap;
      case 'rain': return Cloud;
      case 'wind': return Wind;
      case 'temperature': return AlertTriangle;
      default: return Info;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className={`bg-card/50 backdrop-blur-sm ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Weather Alerts
            </CardTitle>
            {!notificationsEnabled && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestNotificationPermission}
                className="text-xs"
              >
                Enable Notifications
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Bell className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-sm text-muted-foreground">No active weather alerts</p>
            <p className="text-xs text-muted-foreground mt-1">Current conditions are normal</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500 animate-pulse" />
            Weather Alerts ({alerts.length})
          </CardTitle>
          {!notificationsEnabled && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={requestNotificationPermission}
              className="text-xs"
            >
              Enable Notifications
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const AlertIcon = getAlertIcon(alert.type);
          return (
            <div 
              key={alert.id} 
              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 animate-fade-in"
            >
              <AlertIcon className="w-5 h-5 mt-0.5 text-orange-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{alert.title}</h4>
                  <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="h-auto p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default WeatherAlerts;