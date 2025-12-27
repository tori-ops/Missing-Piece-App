import { getTimes, getMoonIllumination } from 'suncalc';

interface WeatherDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  conditions: string;
}

interface WeatherWeek {
  week: number;
  startDate: string;
  endDate: string;
  days: WeatherDay[];
}

interface VenueLocation {
  lat: number;
  lng: number;
  address: string;
}

interface GoldenHourData {
  sunriseTime: string;
  goldenHourStart: string;
  goldenHourEnd: string;
  solarNoon: string;
  sunsetTime: string;
  bestPhotoDirection: string;
  bestPhotoTimeWindow: string;
  photoRecommendations: string;
}

/**
 * Fetch 8-week weather data (4 weeks before, 4 weeks after event date)
 * from Open-Meteo API
 */
export async function fetchWeatherData(
  location: VenueLocation,
  eventDate: Date
): Promise<WeatherWeek[]> {
  const lat = location.lat;
  const lng = location.lng;

  // Calculate date range: 4 weeks before to 4 weeks after
  const startDate = new Date(eventDate);
  startDate.setDate(startDate.getDate() - 28);

  const endDate = new Date(eventDate);
  endDate.setDate(endDate.getDate() + 28);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  try {
    // Open-Meteo API call
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?` +
        `latitude=${lat}&longitude=${lng}` +
        `&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
        `&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    const weatherWeeks: WeatherWeek[] = [];

    // Group data into weeks
    const dailyData = data.daily;
    let weekNum = 1;
    let currentWeekDays: WeatherDay[] = [];
    let weekStartDate = new Date(startDate);

    for (let i = 0; i < dailyData.time.length; i++) {
      const date = new Date(dailyData.time[i]);
      const dayOfWeek = date.getDay();

      // Start a new week on Monday (or first day if needed)
      if (currentWeekDays.length > 0 && (dayOfWeek === 1 || currentWeekDays.length >= 7)) {
        weatherWeeks.push({
          week: weekNum,
          startDate: formatDate(weekStartDate),
          endDate: formatDate(new Date(date.getTime() - 86400000)), // Previous day
          days: currentWeekDays,
        });
        weekNum++;
        currentWeekDays = [];
        weekStartDate = date;
      }

      currentWeekDays.push({
        date: formatDate(date),
        tempHigh: dailyData.temperature_2m_max[i],
        tempLow: dailyData.temperature_2m_min[i],
        precipitation: dailyData.precipitation_sum[i] || 0,
        conditions: getWeatherCondition(dailyData.weather_code[i]),
      });
    }

    // Add final week if exists
    if (currentWeekDays.length > 0) {
      weatherWeeks.push({
        week: weekNum,
        startDate: formatDate(weekStartDate),
        endDate: formatDate(endDate),
        days: currentWeekDays,
      });
    }

    return weatherWeeks;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Calculate golden hour times based on location and event date
 * using suncalc library
 */
export function calculateGoldenHour(
  location: VenueLocation,
  eventDate: Date
): GoldenHourData {
  const times = getTimes(eventDate, location.lat, location.lng);

  // Format times as HH:mm
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const sunriseTime = formatTime(times.sunrise);
  const sunsetTime = formatTime(times.sunset);
  const solarNoon = formatTime(times.solarNoon);

  // Golden hour is typically 1 hour before sunset to sunset
  // and 1 hour after sunrise to sunrise
  // We'll use the evening golden hour as primary suggestion
  const goldenHourEnd = sunsetTime;
  const goldenHourStart = new Date(times.sunset.getTime() - 60 * 60 * 1000); // 1 hour before
  const goldenHourStartTime = formatTime(goldenHourStart);

  // Determine best photo direction based on sun position at golden hour
  // Simplified: assume photographer faces generally south/southwest at sunset
  const eventDateObj = new Date(eventDate);
  const month = eventDateObj.getMonth();

  let bestDirection = 'Southwest';
  let recommendations = 'Best outdoor photography time. Face towards the sunset for stunning backlighting.';

  // Adjust direction based on latitude and month for more accuracy
  if (location.lat > 35) {
    // Northern hemisphere
    bestDirection = month >= 2 && month <= 8 ? 'Northwest' : 'Southwest';
    recommendations = `Golden hour faces ${bestDirection}. Ideal for backlighting and warm tones. Protect lens from direct sun.`;
  } else if (location.lat < -35) {
    // Southern hemisphere
    bestDirection = month >= 2 && month <= 8 ? 'Southwest' : 'Northwest';
    recommendations = `Golden hour faces ${bestDirection}. Excellent for warm, diffused light. Position couple accordingly.`;
  }

  return {
    sunriseTime,
    goldenHourStart: goldenHourStartTime,
    goldenHourEnd,
    solarNoon,
    sunsetTime,
    bestPhotoDirection: bestDirection,
    bestPhotoTimeWindow: `${goldenHourStartTime} - ${goldenHourEnd}`,
    photoRecommendations: recommendations,
  };
}

/**
 * Convert WMO weather codes to human-readable conditions
 */
function getWeatherCondition(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    85: 'Light Snow Showers',
    86: 'Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Hail',
  };

  return weatherCodes[code] || 'Unknown';
}

/**
 * Generate complete weather and golden hour data for a client
 */
export async function generateClientWeatherAndGoldenHour(
  location: VenueLocation,
  eventDate: Date
) {
  const [weatherData, goldenHourData] = await Promise.all([
    fetchWeatherData(location, eventDate),
    Promise.resolve(calculateGoldenHour(location, eventDate)),
  ]);

  return {
    weatherData,
    goldenHourData,
  };
}

// ============================================================================
// ASTROLOGY CALCULATIONS
// ============================================================================

interface AstrologyData {
  moonPhase: string;
  moonIllumination: number;
  nextFullMoon: Date | null;
  nextNewMoon: Date | null;
  zodiacSign: string;
  zodiacDates: string;
  venusRetrograde: boolean;
  mercuryRetrograde: boolean;
  lunarNodeSign: string;
  southNodeSign: string;
  astrologyInsights: string;
}

/**
 * Get zodiac sign for a given date
 */
function getZodiacSign(date: Date): { sign: string; dates: string } {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const zodiacs = [
    { sign: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { sign: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { sign: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { sign: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { sign: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { sign: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { sign: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { sign: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { sign: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { sign: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { sign: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { sign: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  ];

  let foundZodiac = zodiacs[0]; // Default to Capricorn

  for (const zodiac of zodiacs) {
    if (zodiac.startMonth === zodiac.endMonth) {
      if (month === zodiac.startMonth && day >= zodiac.startDay && day <= zodiac.endDay) {
        foundZodiac = zodiac;
        break;
      }
    } else {
      // Spans two months
      if (
        (month === zodiac.startMonth && day >= zodiac.startDay) ||
        (month === zodiac.endMonth && day <= zodiac.endDay)
      ) {
        foundZodiac = zodiac;
        break;
      }
    }
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const startMonth = monthNames[foundZodiac.startMonth - 1];
  const endMonth = monthNames[foundZodiac.endMonth - 1];

  return {
    sign: foundZodiac.sign,
    dates: `${startMonth} ${foundZodiac.startDay} - ${endMonth} ${foundZodiac.endDay}`,
  };
}

/**
 * Get moon phase name from illumination percentage
 */
function getMoonPhaseName(illumination: number): string {
  if (illumination < 1.25) return 'New Moon 🌑';
  if (illumination < 25) return 'Waxing Crescent 🌒';
  if (illumination < 26.25) return 'First Quarter 🌓';
  if (illumination < 50) return 'Waxing Gibbous 🌔';
  if (illumination < 51.25) return 'Full Moon 🌕';
  if (illumination < 75) return 'Waning Gibbous 🌖';
  if (illumination < 76.25) return 'Last Quarter 🌗';
  return 'Waning Crescent 🌘';
}

/**
 * Find next full or new moon from a given date
 */
function findNextMoonPhase(
  startDate: Date,
  targetIllumination: 'full' | 'new'
): Date | null {
  const target = targetIllumination === 'full' ? 0.5 : 0;
  let currentDate = new Date(startDate);
  const maxDaysToCheck = 30; // Check up to 30 days ahead

  for (let i = 0; i < maxDaysToCheck; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    const moonData = getMoonIllumination(currentDate);

    // Check if we've crossed the target
    if (targetIllumination === 'full' && moonData.fraction > target) {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const moonDataYesterday = getMoonIllumination(yesterday);
      if (moonDataYesterday.fraction < target) {
        return currentDate;
      }
    } else if (targetIllumination === 'new' && moonData.fraction < target) {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const moonDataYesterday = getMoonIllumination(yesterday);
      if (moonDataYesterday.fraction > target) {
        return currentDate;
      }
    }
  }

  return null;
}

/**
 * Check if a date is during Mercury retrograde
 * Simplified: uses typical 2025 Mercury retrograde periods
 */
function isMercuryRetrograde(date: Date): boolean {
  // Known Mercury retrograde periods in 2025 (simplified)
  const mercuryRetroPeriods = [
    { start: new Date(2025, 0, 14), end: new Date(2025, 1, 4) }, // Jan 14 - Feb 4
    { start: new Date(2025, 4, 14), end: new Date(2025, 5, 7) }, // May 14 - Jun 7
    { start: new Date(2025, 8, 9), end: new Date(2025, 8, 29) }, // Sep 9 - Sep 29
  ];

  return mercuryRetroPeriods.some((period) => date >= period.start && date <= period.end);
}

/**
 * Check if a date is during Venus retrograde
 * Simplified: uses typical 2025 Venus retrograde periods
 */
function isVenusRetrograde(date: Date): boolean {
  // Known Venus retrograde periods in 2025 (simplified)
  // Venus retrograde is rare - only happens once every ~18 months
  // In 2025, Venus retrograde is from Jan 10 - Feb 20, 2025
  const venusRetroPeriods = [
    { start: new Date(2025, 0, 10), end: new Date(2025, 1, 20) }, // Jan 10 - Feb 20
  ];

  return venusRetroPeriods.some((period) => date >= period.start && date <= period.end);
}

/**
 * Get lunar node signs (simplified)
 */
function getLunarNodeSigns(date: Date): { north: string; south: string } {
  // Lunar nodes move slowly, ~one sign every 1.5 years
  // As of Dec 2024, nodes are in Pisces/Virgo
  const year = date.getFullYear();

  // Simplified: nodes were in Pisces/Virgo as of late 2024
  // This is a rough calculation
  if (year === 2025) {
    return { north: 'Pisces', south: 'Virgo' };
  }

  return { north: 'Aries', south: 'Libra' }; // Default
}

/**
 * Generate astrological insights for the event date
 */
function generateAstrologyInsights(
  zodiac: string,
  moonPhase: string,
  venusRetro: boolean,
  mercuryRetro: boolean
): string {
  let insights = `A ${zodiac} wedding day with ${moonPhase.toLowerCase()}! `;

  if (moonPhase.includes('Full Moon')) {
    insights += 'The full moon brings heightened emotions and amplified energy - perfect for celebrating love. ';
  } else if (moonPhase.includes('New Moon')) {
    insights += 'The new moon represents new beginnings and fresh starts - ideal for a marriage! ';
  } else if (moonPhase.includes('Waxing')) {
    insights +=
      'The waxing moon symbolizes growth and increase - a powerful time for building your life together. ';
  } else if (moonPhase.includes('Waning')) {
    insights +=
      'The waning moon brings release and reflection - a thoughtful energy for your special day. ';
  }

  if (venusRetro) {
    insights +=
      '⚠️ Note: Venus is retrograde, which astrologers say can bring past lovers back or complicate romance - but many couples have thrived! Your love transcends the stars. ';
  }

  if (mercuryRetro) {
    insights +=
      '📡 Mercury is retrograde on your date - communication may feel chaotic, but it makes for great stories later! ';
  }

  insights += 'Embrace the cosmic energy of your day! 🌟';

  return insights;
}

/**
 * Calculate complete astrology data for a client
 */
export function calculateAstrology(eventDate: Date): AstrologyData {
  const moonData = getMoonIllumination(eventDate);
  const zodiac = getZodiacSign(eventDate);
  const lunarNodes = getLunarNodeSigns(eventDate);

  const moonPhase = getMoonPhaseName(moonData.fraction * 100);
  const nextFullMoon = findNextMoonPhase(eventDate, 'full');
  const nextNewMoon = findNextMoonPhase(eventDate, 'new');

  const venusRetro = isVenusRetrograde(eventDate);
  const mercuryRetro = isMercuryRetrograde(eventDate);

  const insights = generateAstrologyInsights(zodiac.sign, moonPhase, venusRetro, mercuryRetro);

  return {
    moonPhase,
    moonIllumination: Math.round(moonData.fraction * 10000) / 100,
    nextFullMoon,
    nextNewMoon,
    zodiacSign: zodiac.sign,
    zodiacDates: zodiac.dates,
    venusRetrograde: venusRetro,
    mercuryRetrograde: mercuryRetro,
    lunarNodeSign: lunarNodes.north,
    southNodeSign: lunarNodes.south,
    astrologyInsights: insights,
  };
}
