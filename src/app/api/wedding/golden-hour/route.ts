// Calculate sunrise, sunset, and golden hour times
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const date = searchParams.get('date');

  if (!lat || !lng || !date) {
    return NextResponse.json({ error: 'lat, lng, and date are required' }, { status: 400 });
  }

  try {
    // Use Open-Meteo API (free, no key required) for sunrise/sunset
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunrise,sunset&timezone=auto&start_date=${date}&end_date=${date}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Open-Meteo API error:', data);
      return NextResponse.json({ error: 'Golden hour service error' }, { status: 500 });
    }

    const sunrise = data.daily?.sunrise?.[0];
    const sunset = data.daily?.sunset?.[0];

    if (!sunrise || !sunset) {
      return NextResponse.json({ error: 'Could not calculate sunrise/sunset' }, { status: 400 });
    }

    // Parse times
    const sunriseTime = new Date(`${date}T${sunrise.split('T')[1]}`);
    const sunsetTime = new Date(`${date}T${sunset.split('T')[1]}`);

    // Golden hour is typically 1 hour before sunset to sunset (evening golden hour)
    const goldenHourStartTime = new Date(sunsetTime.getTime() - 60 * 60 * 1000);
    
    // Morning golden hour: sunrise to 1 hour after sunrise
    const morningGoldenHourEndTime = new Date(sunriseTime.getTime() + 60 * 60 * 1000);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return NextResponse.json({
      sunrise: formatTime(sunriseTime),
      sunset: formatTime(sunsetTime),
      morningGoldenHourStart: formatTime(sunriseTime),
      morningGoldenHourEnd: formatTime(morningGoldenHourEndTime),
      eveningGoldenHourStart: formatTime(goldenHourStartTime),
      eveningGoldenHourEnd: formatTime(sunsetTime),
      dayLength: Math.round((sunsetTime.getTime() - sunriseTime.getTime()) / (1000 * 60)) + ' min'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Golden hour calculation error:', { error: errorMessage });
    return NextResponse.json({ error: `Failed to calculate golden hour: ${errorMessage}` }, { status: 500 });
  }
}
