// Get weather forecast for wedding date and location
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const date = searchParams.get('date');

  if (!lat || !lng || !date) {
    return NextResponse.json({ error: 'lat, lng, and date are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('OpenWeather API key not configured');
    return NextResponse.json({ error: 'Weather service not available' }, { status: 500 });
  }

  try {
    const weddingDate = new Date(date);
    
    // OpenWeather API: Free tier provides 5-day forecast
    // For historical or future dates beyond 5 days, we'll use forecast when possible
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok || data.cod !== '200') {
      console.error('OpenWeather API error:', data);
      return NextResponse.json({ error: 'Weather service error' }, { status: 500 });
    }

    // Find forecast for the wedding date
    const forecastList = data.list || [];
    const weddingDateStr = weddingDate.toDateString();
    
    // Get the forecast closest to the wedding date
    const relevantForecasts = forecastList.filter((item: any) => {
      const itemDate = new Date(item.dt * 1000).toDateString();
      return itemDate === weddingDateStr;
    });

    if (relevantForecasts.length === 0) {
      // If exact date not in forecast, get the last available day
      const forecast = forecastList[forecastList.length - 1] || forecastList[0];
      return NextResponse.json({
        temp: Math.round(forecast.main.temp),
        feelsLike: Math.round(forecast.main.feels_like),
        description: forecast.weather[0]?.main || 'Unknown',
        condition: forecast.weather[0]?.description || 'Unknown',
        humidity: forecast.main.humidity,
        windSpeed: Math.round(forecast.wind.speed),
        icon: forecast.weather[0]?.icon || '01d',
        forecastDate: new Date(forecast.dt * 1000).toDateString(),
        message: 'Showing closest available forecast'
      });
    }

    // Average the day's forecasts
    const avgTemp = Math.round(forecastList
      .filter((item: any) => new Date(item.dt * 1000).toDateString() === weddingDateStr)
      .reduce((sum: number, item: any) => sum + item.main.temp, 0) / relevantForecasts.length);
    
    const dayForecast = relevantForecasts[Math.floor(relevantForecasts.length / 2)];

    return NextResponse.json({
      temp: avgTemp,
      feelsLike: Math.round(dayForecast.main.feels_like),
      description: dayForecast.weather[0]?.main || 'Unknown',
      condition: dayForecast.weather[0]?.description || 'Unknown',
      humidity: dayForecast.main.humidity,
      windSpeed: Math.round(dayForecast.wind.speed),
      icon: dayForecast.weather[0]?.icon || '01d',
      forecastDate: weddingDateStr
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Weather API error:', { error: errorMessage });
    return NextResponse.json({ error: `Failed to fetch weather: ${errorMessage}` }, { status: 500 });
  }
}
