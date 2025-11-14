export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city, lat, lon } = req.body;
    
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
}