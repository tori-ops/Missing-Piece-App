import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const lat = request.nextUrl.searchParams.get('lat');
    const lng = request.nextUrl.searchParams.get('lng');
    const date = request.nextUrl.searchParams.get('date'); // YYYY-MM-DD format

    if (!lat || !lng || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lng, date' },
        { status: 400 }
      );
    }

    // Parse the wedding date
    const weddingDate = new Date(date);
    
    // Get the same date from the previous year
    const priorYearDate = new Date(weddingDate);
    priorYearDate.setFullYear(priorYearDate.getFullYear() - 1);

    // Calculate 30 days before and after
    const startDate = new Date(priorYearDate);
    startDate.setDate(startDate.getDate() - 30);
    
    const endDate = new Date(priorYearDate);
    endDate.setDate(endDate.getDate() + 30);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Fetch historical weather data
    const weatherUrl = new URL('https://archive-api.open-meteo.com/v1/archive');
    weatherUrl.searchParams.append('latitude', lat);
    weatherUrl.searchParams.append('longitude', lng);
    weatherUrl.searchParams.append('start_date', startDateStr);
    weatherUrl.searchParams.append('end_date', endDateStr);
    weatherUrl.searchParams.append('daily', [
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean',
      'precipitation_sum',
      'sunrise',
      'sunset',
    ].join(','));
    weatherUrl.searchParams.append('temperature_unit', 'fahrenheit');
    weatherUrl.searchParams.append('timezone', 'auto');

    // Fetch pollen forecast data for the wedding date (current year pollen forecast)
    const pollenUrl = new URL('https://api.open-meteo.com/v1/air-quality');
    pollenUrl.searchParams.append('latitude', lat);
    pollenUrl.searchParams.append('longitude', lng);
    pollenUrl.searchParams.append('daily', [
      'pollen_count_tree',
      'pollen_count_grass',
      'pollen_count_weed',
      'pollen_count_ragweed',
    ].join(','));
    pollenUrl.searchParams.append('timezone', 'auto');
    pollenUrl.searchParams.append('start_date', formatDate(priorYearDate));
    pollenUrl.searchParams.append('end_date', formatDate(endDate));

    const [weatherResponse, pollenResponse] = await Promise.all([
      fetch(weatherUrl.toString()),
      fetch(pollenUrl.toString()),
    ]);

    if (!weatherResponse.ok) {
      return NextResponse.json(
        { error: `Open-Meteo weather API error: ${weatherResponse.statusText}` },
        { status: weatherResponse.status }
      );
    }

    const weatherData = await weatherResponse.json();
    let pollenData = null;
    
    if (pollenResponse.ok) {
      pollenData = await pollenResponse.json();
    }

    // Parse the response
    if (!weatherData.daily) {
      return NextResponse.json(
        { error: 'Unexpected API response format' },
        { status: 500 }
      );
    }

    // Create a map of pollen data by date for quick lookup
    const pollenDataMap = new Map();
    if (pollenData?.daily) {
      pollenData.daily.time.forEach((dateStr: string, index: number) => {
        pollenDataMap.set(dateStr, {
          tree: pollenData.daily.pollen_count_tree?.[index] || 0,
          grass: pollenData.daily.pollen_count_grass?.[index] || 0,
          weed: pollenData.daily.pollen_count_weed?.[index] || 0,
          ragweed: pollenData.daily.pollen_count_ragweed?.[index] || 0,
        });
      });
    }

    // Format the data
    const dailyData = weatherData.daily.time.map((dateStr: string, index: number) => {
      const date = new Date(dateStr);
      const isWeddingWeek = Math.abs(date.getTime() - priorYearDate.getTime()) <= 3 * 24 * 60 * 60 * 1000; // within 3 days of the year-prior date
      const pollen = pollenDataMap.get(dateStr) || { tree: 0, grass: 0, weed: 0, ragweed: 0 };

      return {
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        tempMax: weatherData.daily.temperature_2m_max[index],
        tempMin: weatherData.daily.temperature_2m_min[index],
        tempMean: weatherData.daily.temperature_2m_mean[index],
        precipitation: weatherData.daily.precipitation_sum[index] || 0,
        sunrise: weatherData.daily.sunrise[index],
        sunset: weatherData.daily.sunset[index],
        isWeddingWeek,
        pollen,
      };
    });

    // Calculate golden hours (approximately 1 hour before/after sunrise/sunset)
    const dataWithGoldenHours = dailyData.map((day: any) => {
      if (day.sunrise && day.sunset) {
        const sunriseTime = new Date(day.sunrise);
        const sunsetTime = new Date(day.sunset);

        const morningGoldenStart = new Date(sunriseTime.getTime() - 60 * 60 * 1000);
        const morningGoldenEnd = new Date(sunriseTime.getTime() + 60 * 60 * 1000);
        const eveningGoldenStart = new Date(sunsetTime.getTime() - 60 * 60 * 1000);
        const eveningGoldenEnd = new Date(sunsetTime.getTime() + 60 * 60 * 1000);

        return {
          ...day,
          morningGoldenStart: morningGoldenStart.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          morningGoldenEnd: morningGoldenEnd.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          eveningGoldenStart: eveningGoldenStart.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          eveningGoldenEnd: eveningGoldenEnd.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          sunriseTime: sunriseTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          sunsetTime: sunsetTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        };
      }
      return day;
    });

    return NextResponse.json({
      location: {
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        timezone: weatherData.timezone,
      },
      weddingDate: date,
      priorYearDate: formatDate(priorYearDate),
      dataRange: {
        start: startDateStr,
        end: endDateStr,
      },
      daily: dataWithGoldenHours,
      summary: {
        avgHighTemp: (dailyData.reduce((sum: number, d: any) => sum + d.tempMax, 0) / dailyData.length).toFixed(1),
        avgLowTemp: (dailyData.reduce((sum: number, d: any) => sum + d.tempMin, 0) / dailyData.length).toFixed(1),
        totalPrecipitation: (dailyData.reduce((sum: number, d: any) => sum + d.precipitation, 0)).toFixed(2),
        rainDays: dailyData.filter((d: any) => d.precipitation > 0).length,
      },
    });
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical weather data' },
      { status: 500 }
    );
  }
}
