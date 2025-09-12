-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  temperature_unit TEXT NOT NULL DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  wind_speed_unit TEXT NOT NULL DEFAULT 'kmh' CHECK (wind_speed_unit IN ('kmh', 'mph')),
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT NOT NULL DEFAULT 'en',
  default_city_id UUID,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_forecast_push BOOLEAN NOT NULL DEFAULT false,
  severe_weather_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create saved cities table
CREATE TABLE public.saved_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  state_code TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, latitude, longitude)
);

-- Create weather cache table for performance
CREATE TABLE public.weather_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL,
  weather_data JSONB NOT NULL,
  forecast_data JSONB,
  cache_type TEXT NOT NULL CHECK (cache_type IN ('current', 'hourly', 'daily')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(city_id, cache_type)
);

-- Create weather alerts table
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'extreme')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for saved_cities
CREATE POLICY "Users can view their own cities" 
ON public.saved_cities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cities" 
ON public.saved_cities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cities" 
ON public.saved_cities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cities" 
ON public.saved_cities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for weather_cache (public read access for performance)
CREATE POLICY "Anyone can view weather cache" 
ON public.weather_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage weather cache" 
ON public.weather_cache 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create RLS policies for weather_alerts
CREATE POLICY "Users can view their own alerts" 
ON public.weather_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.weather_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert weather alerts" 
ON public.weather_alerts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_cities_updated_at
BEFORE UPDATE ON public.saved_cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user setup
CREATE OR REPLACE FUNCTION public.handle_new_weather_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for new user setup
CREATE TRIGGER on_auth_user_created_weather
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_weather_user();

-- Create indexes for performance
CREATE INDEX idx_saved_cities_user_id ON public.saved_cities(user_id);
CREATE INDEX idx_weather_cache_city_type ON public.weather_cache(city_id, cache_type);
CREATE INDEX idx_weather_cache_expires ON public.weather_cache(expires_at);
CREATE INDEX idx_weather_alerts_user_id ON public.weather_alerts(user_id);
CREATE INDEX idx_weather_alerts_unread ON public.weather_alerts(user_id, is_read);