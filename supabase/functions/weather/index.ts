import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchParams } = new URL(req.url)
    let city = searchParams.get('city')
    let lat = searchParams.get('lat')
    let lon = searchParams.get('lon')
    
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')
    
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured')
    }

    // Support JSON body (POST) in addition to query params
    if ((!city && !lat && !lon) && req.method !== 'GET') {
      try {
        const contentType = req.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const body = await req.json()
          city = body?.city?.toString() || city
          lat = body?.lat !== undefined ? String(body.lat) : lat
          lon = body?.lon !== undefined ? String(body.lon) : lon
        }
      } catch (_err) {
        // ignore body parse errors
      }
    }

    let weatherUrl = ''
    let forecastUrl = ''
    
    if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    } else if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    } else {
      throw new Error('Either city name or coordinates (lat, lon) are required')
    }

    // Build additional API URLs for enhanced data
    let airQualityUrl = ''
    if (lat && lon) {
      airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    } else if (weatherUrl.includes('q=')) {
      // For city searches, we'll get coordinates first then fetch air quality
      airQualityUrl = 'FETCH_AFTER_WEATHER'
    }

    // Fetch current weather and 5-day forecast in parallel
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl)
    ])

    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data')
    }

    const weatherData = await weatherResponse.json()
    const forecastData = await forecastResponse.json()

    // Fetch air quality data if needed
    let airQualityData = null
    if (airQualityUrl === 'FETCH_AFTER_WEATHER') {
      const airQualityResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${OPENWEATHER_API_KEY}`
      )
      if (airQualityResponse.ok) {
        airQualityData = await airQualityResponse.json()
      }
    } else if (airQualityUrl && airQualityUrl !== '') {
      const airQualityResponse = await fetch(airQualityUrl)
      if (airQualityResponse.ok) {
        airQualityData = await airQualityResponse.json()
      }
    }

    // Process forecast data to get daily and hourly forecasts
    const dailyForecasts = []
    const hourlyForecasts = []
    const processedDates = new Set()
    
    // Get next 24 hours for hourly forecast
    const now = Date.now()
    for (let i = 0; i < Math.min(8, forecastData.list.length); i++) {
      const item = forecastData.list[i]
      const itemTime = item.dt * 1000
      if (itemTime > now) {
        hourlyForecasts.push({
          time: new Date(itemTime).toLocaleTimeString('en', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          temperature: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: mapWeatherIcon(item.weather[0].icon),
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
          precipitation: Math.round((item.rain?.['3h'] || 0) * 100) / 100
        })
      }
    }
    
    // Get daily forecasts
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toDateString()
      if (!processedDates.has(date) && dailyForecasts.length < 7) {
        processedDates.add(date)
        const dayName = dailyForecasts.length === 0 ? 'Today' : 
                       dailyForecasts.length === 1 ? 'Tomorrow' :
                       new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'long' })
        
        dailyForecasts.push({
          date: dayName,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min), 
          description: item.weather[0].description,
          icon: mapWeatherIcon(item.weather[0].icon),
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
          precipitation: Math.round((item.rain?.['3h'] || 0) * 100) / 100
        })
      }
    }

    // Calculate UV Index (simplified estimation based on weather and time)
    const currentHour = new Date().getHours()
    const isDay = currentHour >= 6 && currentHour <= 18
    let uvIndex = 0
    if (isDay) {
      // Simplified UV calculation based on cloud cover and time
      const cloudiness = weatherData.clouds?.all || 0
      const baseUV = Math.max(0, 10 - (cloudiness / 10))
      const timeMultiplier = currentHour >= 10 && currentHour <= 14 ? 1 : 0.7
      uvIndex = Math.round(baseUV * timeMultiplier)
    }

    // Get air quality info
    const airQuality = airQualityData?.list?.[0] || null
    const aqi = airQuality?.main?.aqi || null
    const aqiDescription = getAQIDescription(aqi)

    // Weather suggestions based on conditions
    const suggestions = generateWeatherSuggestions(weatherData, airQuality)

    // Map OpenWeather data to our format
    const result = {
      current: {
        location: `${weatherData.name}, ${weatherData.sys.country}`,
        cityName: weatherData.name,
        countryCode: weatherData.sys.country,
        lat: weatherData.coord?.lat,
        lon: weatherData.coord?.lon,
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        pressure: weatherData.main.pressure,
        visibility: Math.round(weatherData.visibility / 1000), // Convert m to km
        uvIndex: uvIndex,
        aqi: aqi,
        aqiDescription: aqiDescription,
        cloudiness: weatherData.clouds?.all || 0,
        precipitation: Math.round((weatherData.rain?.['1h'] || 0) * 100) / 100,
        sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        icon: mapWeatherIcon(weatherData.weather[0].icon),
        suggestions: suggestions
      },
      forecast: dailyForecasts,
      hourly: hourlyForecasts
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in weather function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Map OpenWeather icons to our icon system
function mapWeatherIcon(openWeatherIcon: string): string {
  const iconMap: Record<string, string> = {
    '01d': 'sunny',
    '01n': 'clear-night',
    '02d': 'partly-cloudy',
    '02n': 'partly-cloudy',
    '03d': 'cloudy',
    '03n': 'cloudy', 
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rain',
    '09n': 'rain',
    '10d': 'rain',
    '10n': 'rain',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snow',
    '13n': 'snow',
    '50d': 'fog',
    '50n': 'fog'
  }
  
  return iconMap[openWeatherIcon] || 'partly-cloudy'
}

// Get AQI description
function getAQIDescription(aqi: number | null): string {
  if (!aqi) return 'No data'
  switch (aqi) {
    case 1: return 'Good'
    case 2: return 'Fair'
    case 3: return 'Moderate'
    case 4: return 'Poor'
    case 5: return 'Very Poor'
    default: return 'Unknown'
  }
}

// Generate weather-based suggestions
function generateWeatherSuggestions(weatherData: any, airQuality: any): string[] {
  const suggestions: string[] = []
  const temp = weatherData.main.temp
  const humidity = weatherData.main.humidity
  const windSpeed = weatherData.wind.speed * 3.6 // km/h
  const weatherMain = weatherData.weather[0].main.toLowerCase()
  const isRaining = weatherMain.includes('rain')
  const isSnowing = weatherMain.includes('snow')
  const aqi = airQuality?.main?.aqi

  // Temperature-based suggestions
  if (temp < 0) {
    suggestions.push('🧥 Bundle up! It\'s freezing outside')
    suggestions.push('❄️ Watch out for icy conditions')
  } else if (temp < 10) {
    suggestions.push('🧥 Wear a warm jacket')
  } else if (temp < 20) {
    suggestions.push('👕 Light jacket recommended')
  } else if (temp > 30) {
    suggestions.push('☀️ Stay hydrated and seek shade')
    suggestions.push('👒 Wear sunscreen and a hat')
  }

  // Weather condition suggestions
  if (isRaining) {
    suggestions.push('☂️ Don\'t forget your umbrella!')
    suggestions.push('👟 Wear waterproof shoes')
  }
  
  if (isSnowing) {
    suggestions.push('❄️ Drive carefully - roads may be slippery')
    suggestions.push('🧤 Wear gloves and warm boots')
  }

  if (windSpeed > 20) {
    suggestions.push('💨 It\'s quite windy - secure loose items')
  }

  if (humidity > 80) {
    suggestions.push('💧 High humidity - expect it to feel warmer')
  }

  // Air quality suggestions
  if (aqi && aqi >= 4) {
    suggestions.push('😷 Poor air quality - consider wearing a mask')
    suggestions.push('🏠 Limit outdoor activities')
  }

  // Activity suggestions
  if (!isRaining && !isSnowing && temp >= 15 && temp <= 25 && windSpeed < 15) {
    suggestions.push('🚶‍♂️ Great weather for a walk!')
  }

  if (temp >= 20 && !isRaining) {
    suggestions.push('☀️ Perfect weather for outdoor activities')
  }

  return suggestions.slice(0, 3) // Limit to 3 suggestions
}