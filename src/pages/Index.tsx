import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, MapPin, TrendingUp, Users, Shield } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Cloud className="w-8 h-8 text-primary" />,
      title: "Real-time Weather",
      description: "Get accurate, up-to-date weather information for any location worldwide."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "7-Day Forecasts",
      description: "Plan ahead with detailed weather forecasts and hourly breakdowns."
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary" />,
      title: "Multiple Cities",
      description: "Track weather in all your favorite locations and save them for quick access."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Weather Alerts",
      description: "Stay safe with severe weather warnings and customizable notifications."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sun className="absolute top-20 right-20 w-16 h-16 text-sunny/20 animate-pulse" />
        <Cloud className="absolute top-40 left-20 w-20 h-20 text-cloudy/15 animate-bounce" />
        <CloudRain className="absolute bottom-40 right-40 w-12 h-12 text-rainy/20 animate-pulse" />
        <Cloud className="absolute bottom-20 left-40 w-14 h-14 text-cloudy/10 animate-bounce" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cloud className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              WeatherApp
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Personal
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Weather Companion
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get real-time weather updates, detailed forecasts, and personalized alerts. 
            Track multiple cities and stay ahead of the weather.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/auth">Start Free Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-weather">
              <CardHeader>
                <div className="mx-auto mb-2">{feature.icon}</div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of users who trust WeatherApp for accurate weather information and forecasts.
            </p>
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/auth">Create Your Account</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Cloud className="w-6 h-6 text-primary" />
              <span className="font-semibold">WeatherApp</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 WeatherApp. Built with modern web technologies.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
