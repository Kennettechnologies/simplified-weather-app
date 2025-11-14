import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


const app = express();
app.use(cors());
app.use(express.json());

// Weather API endpoint
app.post('/api/weather', async (req, res) => {
  try {
    const { city, lat, lon, getApiKey } = req.body;
    
    // Return API key if requested
    if (getApiKey) {
      return res.json({ apiKey: process.env.OPENWEATHER_API_KEY });
    }
    
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'OpenWeather API key not configured' });
    }
    
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ error: 'Either city or coordinates required' });
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message });
    }
    
    // Transform to match expected format
    const weatherData = {
      cityName: data.name,
      location: `${data.name}, ${data.sys.country}`,
      countryCode: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000,
      uvIndex: 0,
      feelsLike: Math.round(data.main.feels_like),
      icon: data.weather[0].icon
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // TODO: hash in real app
    full_name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Mapbox token endpoint  
app.post('/api/get-mapbox-token', async (req, res) => {
  try {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'Mapbox token not configured' });
    }
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get Mapbox token' });
  }
});

// Enhanced Weather assistant endpoint
app.post('/api/weather-assistant', async (req, res) => {
  try {
    const { message, weatherData } = req.body;
    
    if (!weatherData) {
      return res.json({ 
        response: 'I need weather data to help you properly. Please load weather information for your location first!' 
      });
    }

    const temp = weatherData.temperature;
    const desc = weatherData.description.toLowerCase();
    const humidity = weatherData.humidity;
    const windSpeed = weatherData.windSpeed;
    const location = weatherData.location;
    const feelsLike = weatherData.feelsLike;

    const msgLower = message.toLowerCase();
    let response = '';

    // Clothing recommendations
    if (msgLower.includes('wear') || msgLower.includes('clothes') || msgLower.includes('outfit') || msgLower.includes('dress')) {
      response = `👔 **Clothing Recommendation for ${location}:**\n\n`;
      
      if (temp <= 0) {
        response += `🧥 **Very Cold (${temp}°C)**: Heavy winter coat, thermal layers, warm hat, gloves, and insulated boots. Stay warm!`;
      } else if (temp <= 10) {
        response += `🧥 **Cold (${temp}°C)**: Warm jacket or coat, long pants, closed shoes, and consider a scarf. Layer up!`;
      } else if (temp <= 15) {
        response += `🧥 **Cool (${temp}°C)**: Light jacket or sweater, long pants, and comfortable shoes. Perfect for layering!`;
      } else if (temp <= 20) {
        response += `👕 **Mild (${temp}°C)**: Light sweater or long-sleeve shirt, jeans or pants. Very comfortable weather!`;
      } else if (temp <= 25) {
        response += `👕 **Pleasant (${temp}°C)**: T-shirt or light shirt, comfortable pants or shorts. Great weather!`;
      } else if (temp <= 30) {
        response += `👕 **Warm (${temp}°C)**: Light, breathable clothing, shorts or light pants, sandals or breathable shoes.`;
      } else {
        response += `🌡️ **Hot (${temp}°C)**: Very light, loose-fitting clothes, shorts, tank tops, sun hat, and stay hydrated!`;
      }

      // Add weather-specific advice
      if (desc.includes('rain') || desc.includes('drizzle')) {
        response += `\n☔ **Rain Alert**: Don't forget an umbrella or raincoat!`;
      }
      if (desc.includes('snow')) {
        response += `\n❄️ **Snow Alert**: Wear waterproof boots and warm layers!`;
      }
      if (windSpeed > 15) {
        response += `\n💨 **Windy**: Consider a windbreaker or jacket to stay comfortable.`;
      }
      if (humidity > 80) {
        response += `\n💧 **High Humidity**: Choose breathable, moisture-wicking fabrics.`;
      }

    // Activity recommendations
    } else if (msgLower.includes('activity') || msgLower.includes('activities') || msgLower.includes('outdoor') || msgLower.includes('do')) {
      response = `🎯 **Activity Suggestions for ${location}:**\n\n`;
      
      if (temp >= 20 && temp <= 28 && !desc.includes('rain') && !desc.includes('storm')) {
        response += `Perfect weather for outdoor activities! 🌞\n• Walking or hiking\n• Picnics in the park\n• Outdoor sports\n• Cycling\n• Photography`;
      } else if (desc.includes('rain')) {
        response += `Rainy day activities: 🌧️\n• Indoor museums or galleries\n• Shopping centers\n• Cozy cafes\n• Reading at home\n• Indoor fitness`;
      } else if (temp < 10) {
        response += `Cold weather activities: ❄️\n• Indoor activities recommended\n• Hot drinks at cafes\n• Museums or libraries\n• Indoor sports\n• Cooking at home`;
      } else {
        response += `Good for moderate outdoor activities: 🌤️\n• Light walking\n• Indoor/outdoor mix\n• Shopping\n• Casual outdoor dining`;
      }

    // Umbrella recommendations
    } else if (msgLower.includes('umbrella') || msgLower.includes('rain')) {
      if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
        response = `☔ **Yes, bring an umbrella!** It's ${desc} in ${location}. Better to be prepared!`;
      } else if (humidity > 85) {
        response = `🌫️ **Maybe bring an umbrella.** High humidity (${humidity}%) suggests possible rain later.`;
      } else {
        response = `☀️ **No umbrella needed!** Clear weather in ${location} with ${desc}.`;
      }

    // Air quality and health
    } else if (msgLower.includes('air') || msgLower.includes('quality') || msgLower.includes('health')) {
      response = `🌬️ **Air Quality Info for ${location}:**\n\n`;
      if (weatherData.aqi) {
        response += `Air Quality Index: ${weatherData.aqi}\n`;
      }
      response += `Current conditions: ${desc} with ${humidity}% humidity.\n`;
      if (humidity > 80) {
        response += `High humidity may affect those with respiratory conditions.`;
      } else {
        response += `Generally good conditions for outdoor activities.`;
      }

    // Driving conditions
    } else if (msgLower.includes('drive') || msgLower.includes('driving') || msgLower.includes('car')) {
      response = `🚗 **Driving Conditions in ${location}:**\n\n`;
      
      if (desc.includes('rain') || desc.includes('drizzle')) {
        response += `⚠️ **Caution**: Wet roads due to ${desc}. Drive slowly and increase following distance.`;
      } else if (desc.includes('fog') || desc.includes('mist')) {
        response += `⚠️ **Low Visibility**: Foggy conditions. Use headlights and drive carefully.`;
      } else if (desc.includes('snow') || desc.includes('ice')) {
        response += `❄️ **Dangerous**: Icy/snowy conditions. Consider avoiding travel or use winter tires.`;
      } else if (windSpeed > 25) {
        response += `💨 **Windy**: Strong winds (${windSpeed} m/s). Be careful with high-profile vehicles.`;
      } else {
        response += `✅ **Good**: Clear driving conditions with ${desc}.`;
      }

    // Temperature-specific queries
    } else if (msgLower.includes('temperature') || msgLower.includes('temp') || msgLower.includes('hot') || msgLower.includes('cold')) {
      response = `🌡️ **Temperature in ${location}**: ${temp}°C (feels like ${feelsLike}°C)\n\n`;
      if (temp !== feelsLike) {
        response += `The "feels like" temperature is different due to humidity and wind conditions.`;
      }

    // Wind information
    } else if (msgLower.includes('wind')) {
      response = `💨 **Wind Conditions**: ${windSpeed} m/s in ${location}\n\n`;
      if (windSpeed < 5) response += `Light breeze - very pleasant!`;
      else if (windSpeed < 15) response += `Moderate wind - comfortable for most activities.`;
      else if (windSpeed < 25) response += `Strong wind - secure loose items and dress appropriately.`;
      else response += `Very strong wind - be cautious outdoors!`;

    // Humidity information
    } else if (msgLower.includes('humidity')) {
      response = `💧 **Humidity**: ${humidity}% in ${location}\n\n`;
      if (humidity < 30) response += `Low humidity - you might feel dry. Stay hydrated!`;
      else if (humidity < 60) response += `Comfortable humidity levels.`;
      else if (humidity < 80) response += `Moderate humidity - might feel a bit muggy.`;
      else response += `High humidity - expect it to feel quite muggy and sticky.`;

    // General weather query
    } else if (msgLower.includes('weather')) {
      response = `🌤️ **Current Weather in ${location}:**\n\n`;
      response += `• Temperature: ${temp}°C (feels like ${feelsLike}°C)\n`;
      response += `• Conditions: ${weatherData.description}\n`;
      response += `• Humidity: ${humidity}%\n`;
      response += `• Wind: ${windSpeed} m/s\n`;
      response += `• Pressure: ${weatherData.pressure} hPa`;

    // Default response
    } else {
      response = `🤖 **Weather Assistant**: I can help you with:\n\n`;
      response += `• **Clothing advice** - "What should I wear?"\n`;
      response += `• **Activity suggestions** - "What can I do outside?"\n`;
      response += `• **Rain/umbrella advice** - "Should I bring an umbrella?"\n`;
      response += `• **Driving conditions** - "Is it safe to drive?"\n`;
      response += `• **Current weather** - Ask about temperature, humidity, wind\n\n`;
      response += `Current conditions: ${desc}, ${temp}°C in ${location}. What would you like to know?`;
    }
    
    res.json({ response });
  } catch (error) {
    console.error('Weather assistant error:', error);
    res.status(500).json({ error: 'Failed to process weather assistant request' });
  }
});

// AUTH ROUTES USING MONGODB

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password and full name are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      email,
      password, // TODO: hash
      full_name,
      phone: phone || null,
    });

    return res.status(201).json({
      message: 'User created',
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        created_at: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      // TODO: use password hash compare
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Very simple "token" for now
    const token = `dev-token-${user._id}`;

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        created_at: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});