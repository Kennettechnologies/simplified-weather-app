export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, weatherData } = req.body;
    
    if (!weatherData) {
      return res.json({ 
        response: 'I need weather data to help you properly. Please load weather information for your location first!' 
      });
    }

    // Your enhanced weather assistant logic here...
    // (Copy the entire enhanced logic from your server/index.js)
    
  } catch (error) {
    console.error('Weather assistant error:', error);
    res.status(500).json({ error: 'Failed to process weather assistant request' });
  }
}