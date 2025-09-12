import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, weatherData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create context from weather data
    const weatherContext = weatherData ? `
Current weather conditions:
- Location: ${weatherData.location}
- Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)
- Conditions: ${weatherData.description}
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} km/h
- Pressure: ${weatherData.pressure} hPa
- UV Index: ${weatherData.uvIndex}
- Air Quality: ${weatherData.aqiDescription || 'Unknown'}
- Sunrise: ${weatherData.sunrise}
- Sunset: ${weatherData.sunset}
- Visibility: ${weatherData.visibility} km
` : '';

    const systemPrompt = `You are a helpful weather assistant. You provide weather insights, advice, and answer weather-related questions. You're knowledgeable about meteorology, climate patterns, and can give practical advice about outdoor activities, clothing recommendations, and safety precautions based on weather conditions.

${weatherContext}

Keep your responses helpful, accurate, and conversational. If specific weather data is provided, use it to give personalized advice. If asked about current conditions and weather data is available, reference the specific data points.`;

    // Check if OpenAI API is available or provide fallback
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 800,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', response.status, errorData);
        
        // If quota exceeded or other API issues, provide fallback response
        if (response.status === 429 || response.status === 403) {
          return new Response(JSON.stringify({ 
            response: generateFallbackResponse(message, weatherData)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      return new Response(JSON.stringify({ response: assistantResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Provide fallback response when API is unavailable
      return new Response(JSON.stringify({ 
        response: generateFallbackResponse(message, weatherData)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in weather-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get response from weather assistant',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackResponse(message: string, weatherData: any): string {
  const msg = message.toLowerCase();
  
  if (!weatherData) {
    return "I'd be happy to help with weather advice! Could you share your current location so I can provide more specific guidance?";
  }

  const { temperature, description, humidity, windSpeed, precipitation } = weatherData;
  
  // Generate contextual responses based on common questions
  if (msg.includes('umbrella') || msg.includes('rain')) {
    if (precipitation > 0 || description.includes('rain')) {
      return `Yes, I'd recommend bringing an umbrella! There's ${precipitation}mm of precipitation expected and the conditions are showing "${description}".`;
    }
    return `Based on current conditions (${description}) with ${precipitation}mm precipitation expected, you probably won't need an umbrella today.`;
  }
  
  if (msg.includes('jacket') || msg.includes('coat') || msg.includes('wear') || msg.includes('clothes')) {
    if (temperature < 15) {
      return `It's quite cool at ${temperature}°C with ${description}. I'd recommend wearing a jacket or coat to stay comfortable.`;
    } else if (temperature > 25) {
      return `It's warm at ${temperature}°C with ${description}. Light, breathable clothing would be most comfortable.`;
    }
    return `At ${temperature}°C with ${description}, a light layer should be comfortable. You can always adjust based on how you feel!`;
  }
  
  if (msg.includes('outside') || msg.includes('outdoor') || msg.includes('activity')) {
    return `Current conditions: ${temperature}°C, ${description}, humidity ${humidity}%, wind ${windSpeed} km/h. Great for most outdoor activities! Stay hydrated and dress appropriately for the temperature.`;
  }
  
  // Default response with current conditions
  return `Current weather in ${weatherData.location}: ${temperature}°C, ${description}. Humidity is ${humidity}% with ${windSpeed} km/h winds. Feel free to ask me specific questions about clothing, activities, or safety!`;
}