import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateClientWeatherAndGoldenHour } from '@/lib/weather-service';
import { calculateAstrology } from '@/lib/weather-service';

/**
 * GET /api/client/weather
 * Fetch weather and golden hour data for authenticated client
 */
export async function GET(req: NextRequest) {
  try {
    const clientId = req.headers.get('x-client-id');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing x-client-id header' },
        { status: 401 }
      );
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      include: {
        weather: true,
        goldenHour: true,
        astrology: true,
      },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!clientProfile.weather || !clientProfile.goldenHour) {
      return NextResponse.json(
        { error: 'Weather data not yet generated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      weather: clientProfile.weather,
      goldenHour: clientProfile.goldenHour,
      astrology: clientProfile.astrology,
      showAstrology: clientProfile.showAstrology,
      eventDate: clientProfile.weddingDate,
      venue: clientProfile.weddingLocation,
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/weather
 * Generate and save weather/golden hour data for a client
 */
export async function POST(req: NextRequest) {
  try {
    const clientId = req.headers.get('x-client-id');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing x-client-id header' },
        { status: 401 }
      );
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: clientId },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!clientProfile.weddingDate || !clientProfile.weddingLocation) {
      return NextResponse.json(
        { error: 'Client missing wedding date or location' },
        { status: 400 }
      );
    }

    // Parse location - handle both string and object formats
    let locationData: { lat: number; lng: number; address: string };

    if (typeof clientProfile.weddingLocation === 'string') {
      // If it's just a string, we need to geocode it or ask for coordinates
      // For now, return error asking for proper location format
      return NextResponse.json(
        { error: 'Venue location must include coordinates (lat/lng)' },
        { status: 400 }
      );
    }

    locationData = clientProfile.weddingLocation as any;

    if (!locationData.lat || !locationData.lng) {
      return NextResponse.json(
        { error: 'Venue location must include latitude and longitude' },
        { status: 400 }
      );
    }

    locationData.address = locationData.address || clientProfile.weddingLocation;

    // Generate weather and golden hour data
    const { weatherData, goldenHourData } = await generateClientWeatherAndGoldenHour(
      locationData,
      new Date(clientProfile.weddingDate)
    );

    // Generate astrology data
    const astrologyData = calculateAstrology(new Date(clientProfile.weddingDate));

    // Save to database
    const [weather, goldenHour, astrology] = await Promise.all([
      prisma.clientWeather.upsert({
        where: { clientId },
        update: {
          weatherData: JSON.stringify(weatherData),
          venueLocation: locationData,
          lastUpdatedAt: new Date(),
        },
        create: {
          clientId,
          eventDate: clientProfile.weddingDate,
          venueLocation: locationData,
          weatherData: JSON.stringify(weatherData),
        },
      }),
      prisma.clientGoldenHour.upsert({
        where: { clientId },
        update: {
          sunriseTime: goldenHourData.sunriseTime,
          goldenHourStart: goldenHourData.goldenHourStart,
          goldenHourEnd: goldenHourData.goldenHourEnd,
          solarNoon: goldenHourData.solarNoon,
          sunsetTime: goldenHourData.sunsetTime,
          bestPhotoDirection: goldenHourData.bestPhotoDirection,
          bestPhotoTimeWindow: goldenHourData.bestPhotoTimeWindow,
          photoRecommendations: goldenHourData.photoRecommendations,
          lastUpdatedAt: new Date(),
        },
        create: {
          clientId,
          eventDate: clientProfile.weddingDate,
          venueLocation: locationData,
          sunriseTime: goldenHourData.sunriseTime,
          goldenHourStart: goldenHourData.goldenHourStart,
          goldenHourEnd: goldenHourData.goldenHourEnd,
          solarNoon: goldenHourData.solarNoon,
          sunsetTime: goldenHourData.sunsetTime,
          bestPhotoDirection: goldenHourData.bestPhotoDirection,
          bestPhotoTimeWindow: goldenHourData.bestPhotoTimeWindow,
          photoRecommendations: goldenHourData.photoRecommendations,
        },
      }),
      prisma.clientAstrology.upsert({
        where: { clientId },
        update: {
          moonPhase: astrologyData.moonPhase,
          moonIllumination: astrologyData.moonIllumination,
          nextFullMoon: astrologyData.nextFullMoon,
          nextNewMoon: astrologyData.nextNewMoon,
          zodiacSign: astrologyData.zodiacSign,
          zodiacDates: astrologyData.zodiacDates,
          venusRetrograde: astrologyData.venusRetrograde,
          mercuryRetrograde: astrologyData.mercuryRetrograde,
          lunarNodeSign: astrologyData.lunarNodeSign,
          southNodeSign: astrologyData.southNodeSign,
          astrologyInsights: astrologyData.astrologyInsights,
          lastUpdatedAt: new Date(),
        },
        create: {
          clientId,
          eventDate: clientProfile.weddingDate,
          moonPhase: astrologyData.moonPhase,
          moonIllumination: astrologyData.moonIllumination,
          nextFullMoon: astrologyData.nextFullMoon,
          nextNewMoon: astrologyData.nextNewMoon,
          zodiacSign: astrologyData.zodiacSign,
          zodiacDates: astrologyData.zodiacDates,
          venusRetrograde: astrologyData.venusRetrograde,
          mercuryRetrograde: astrologyData.mercuryRetrograde,
          lunarNodeSign: astrologyData.lunarNodeSign,
          southNodeSign: astrologyData.southNodeSign,
          astrologyInsights: astrologyData.astrologyInsights,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      weather,
      goldenHour,
      astrology,
      message: 'Weather and astrology data generated successfully',
    });
  } catch (error) {
    console.error('Error generating weather data:', error);
    return NextResponse.json(
      { error: 'Failed to generate weather data' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/client/weather
 * Toggle astrology preference for client
 */
export async function PATCH(req: NextRequest) {
  try {
    const clientId = req.headers.get('x-client-id');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing x-client-id header' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { showAstrology } = body;

    if (typeof showAstrology !== 'boolean') {
      return NextResponse.json(
        { error: 'showAstrology must be a boolean' },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.clientProfile.update({
      where: { id: clientId },
      data: { showAstrology },
    });

    return NextResponse.json({
      success: true,
      showAstrology: updatedClient.showAstrology,
      message: 'Astrology preference updated',
    });
  } catch (error) {
    console.error('Error updating astrology preference:', error);
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    );
  }
}
