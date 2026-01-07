import { NextRequest, NextResponse } from 'next/server';

interface SunriseSunsetData {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!lat || !lng || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lng, date' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sunrise-sunset data' },
        { status: response.status }
      );
    }

    const data: SunriseSunsetData = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Sunrise-sunset API returned error status' },
        { status: 400 }
      );
    }

    // Convert UTC times to local times based on provided offset
    const results = data.results;
    
    return NextResponse.json({
      sunrise: results.sunrise,
      sunset: results.sunset,
      solarNoon: results.solar_noon,
      dayLength: results.day_length,
      civilTwilightBegin: results.civil_twilight_begin,
      civilTwilightEnd: results.civil_twilight_end,
    });
  } catch (error) {
    console.error('Sunrise-sunset API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate sunrise-sunset times' },
      { status: 500 }
    );
  }
}
