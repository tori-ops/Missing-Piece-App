import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    const time = request.nextUrl.searchParams.get('time');

    if (!date) {
      return NextResponse.json(
        { error: 'Missing required parameter: date (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const weddingDate = new Date(date);
    
    // Calculate all planetary positions
    const sunData = calculateSunPosition(weddingDate);
    const moonData = calculateMoonPosition(weddingDate, time || undefined);
    const mercuryData = calculateMercuryPosition(weddingDate);
    const venusData = calculateVenusPosition(weddingDate);
    const marsData = calculateMarsPosition(weddingDate);
    const jupiterData = calculateJupiterPosition(weddingDate);
    const saturnData = calculateSaturnPosition(weddingDate);
    const chironData = calculateChiron(weddingDate);
    const lilithData = calculateBlackMoonLilith(weddingDate);
    
    let risingData = null;
    let houses = null;
    let rulingHourData = null;
    let skyMapData = null;
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      risingData = calculateRisingSign(hours, minutes);
      houses = calculateHouses(hours, minutes, sunData, moonData, venusData, marsData);
      rulingHourData = calculatePlanetaryRulingHour(hours, minutes);
      skyMapData = calculateSkyMapData(hours, minutes);
    }
    
    const aspects = calculateAspects(sunData, moonData, venusData);
    const moonPhase = calculateMoonPhase(weddingDate);
    
    // Get all retrograde planets
    const retrogradeStatus = getRetrogradePlanets(weddingDate);

    return NextResponse.json({
      date,
      sun: sunData,
      moon: moonData,
      mercury: mercuryData,
      venus: venusData,
      mars: marsData,
      jupiter: jupiterData,
      saturn: saturnData,
      chiron: chironData,
      lilith: lilithData,
      rising: risingData,
      houses,
      aspects,
      moonPhase,
      retrogradeStatus,
      rulingHour: rulingHourData,
      skyMap: skyMapData,
      houseSystem: 'Whole Sign',
      disclaimer: 'Astronomical data only. No prediction. No outcome interpretation.',
    });
  } catch (error) {
    console.error('Error calculating astrology:', error);
    return NextResponse.json(
      { error: 'Failed to calculate astrology data' },
      { status: 500 }
    );
  }
}

function calculateSunPosition(date: Date) {
  const dayOfYear = getDayOfYear(date);
  const sunLongitude = (dayOfYear - 79.27) * 0.9856 + 282.04;
  const normalizedLongitude = ((sunLongitude + 360) % 360);
  
  const { sign, degree } = getLongitudeSign(normalizedLongitude);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: normalizedLongitude.toFixed(2),
  };
}

function calculateMoonPosition(date: Date, time?: string) {
  let days = getDaysSinceEpoch(date);
  
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    days += (hours + minutes / 60) / 24;
  }

  const moonLongitude = (218.316733 + 13.176396 * days) % 360;
  const { sign, degree } = getLongitudeSign(moonLongitude);
  
  // Calculate next sign entry (approx 2.5 days per sign)
  const moonSpeedPerDay = 13.176396;
  const degreesUntilNextSign = 30 - degree;
  const daysUntilNextSign = (degreesUntilNextSign / moonSpeedPerDay).toFixed(1);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: moonLongitude.toFixed(2),
    daysUntilNextSign,
  };
}

function calculateVenusPosition(date: Date) {
  const days = getDaysSinceEpoch(date);
  const venusMeanMotion = 1.6023;
  const venusEpoch = 265.53;
  
  const venusLongitude = (venusEpoch + venusMeanMotion * days) % 360;
  const { sign, degree } = getLongitudeSign(venusLongitude);
  
  const retrograde = checkVenusRetrograde(date);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: venusLongitude.toFixed(2),
    retrograde,
  };
}

function calculateMarsPosition(date: Date) {
  const days = getDaysSinceEpoch(date);
  const marsMeanMotion = 0.5243;
  const marsEpoch = 355.45;
  
  const marsLongitude = (marsEpoch + marsMeanMotion * days) % 360;
  const { sign, degree } = getLongitudeSign(marsLongitude);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: marsLongitude.toFixed(2),
  };
}

function calculateRisingSign(hours: number, minutes: number): any {
  const totalMinutes = hours * 60 + minutes;
  const minuteOfDay = totalMinutes % (24 * 60);
  const signIndex = Math.floor((minuteOfDay / (24 * 60)) * 12);
  
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  return {
    sign: zodiacSigns[signIndex],
    note: 'Approximate - for precise calculation, consult an astrologer',
  };
}

function calculateHouses(hours: number, minutes: number, sun: any, moon: any, venus: any, mars: any) {
  // Simplified house calculation based on time of day
  // In a full ephemeris system, this would use sidereal time and exact location
  
  const totalMinutes = hours * 60 + minutes;
  const hourOfDay = (totalMinutes / 60) % 24;
  
  // Approximate house cusp positions (simplified - each house ~30 degrees)
  // House 1 (Ascendant) starts at hourOfDay * 15 degrees
  const ascendantDegree = (hourOfDay * 15) % 360;
  
  // Helper to assign planet to house
  const assignHouse = (planetLongitude: number): number => {
    const normalizedLong = planetLongitude;
    const ascLong = ascendantDegree;
    
    // Calculate distance from ascendant
    let distance = (normalizedLong - ascLong + 360) % 360;
    
    // Assign house (1-12)
    const houseNum = Math.floor(distance / 30) + 1;
    return houseNum > 12 ? houseNum - 12 : houseNum;
  };
  
  return {
    sun: assignHouse(sun.longitude),
    moon: assignHouse(moon.longitude),
    venus: assignHouse(venus.longitude),
    mars: assignHouse(mars.longitude),
    ascending: assignHouse(ascendantDegree),
  };
}

function calculateAspects(sun: any, moon: any, venus: any) {
  const aspects = [];
  
  const sunMoonDiff = Math.abs(parseFloat(sun.longitude) - parseFloat(moon.longitude));
  const sunMoonAspect = getAspect(sunMoonDiff);
  if (sunMoonAspect) {
    aspects.push({
      type: `Sun ${sunMoonAspect.name} Moon`,
      angle: sunMoonAspect.angle,
      orb: (Math.abs(sunMoonDiff - sunMoonAspect.angle)).toFixed(2),
    });
  }
  
  const sunVenusDiff = Math.abs(parseFloat(sun.longitude) - parseFloat(venus.longitude));
  const sunVenusAspect = getAspect(sunVenusDiff);
  if (sunVenusAspect) {
    aspects.push({
      type: `Sun ${sunVenusAspect.name} Venus`,
      angle: sunVenusAspect.angle,
      orb: (Math.abs(sunVenusDiff - sunVenusAspect.angle)).toFixed(2),
    });
  }
  
  const moonVenusDiff = Math.abs(parseFloat(moon.longitude) - parseFloat(venus.longitude));
  const moonVenusAspect = getAspect(moonVenusDiff);
  if (moonVenusAspect) {
    aspects.push({
      type: `Moon ${moonVenusAspect.name} Venus`,
      angle: moonVenusAspect.angle,
      orb: (Math.abs(moonVenusDiff - moonVenusAspect.angle)).toFixed(2),
    });
  }

  return aspects;
}

function getAspect(angleDiff: number): any {
  const diff = angleDiff > 180 ? 360 - angleDiff : angleDiff;
  
  if (Math.abs(diff - 0) < 8) {
    return { name: 'Conjunction', angle: 0 };
  }
  if (Math.abs(diff - 60) < 8) {
    return { name: 'Sextile', angle: 60 };
  }
  if (Math.abs(diff - 90) < 8) {
    return { name: 'Square', angle: 90 };
  }
  if (Math.abs(diff - 120) < 8) {
    return { name: 'Trine', angle: 120 };
  }
  if (Math.abs(diff - 180) < 8) {
    return { name: 'Opposition', angle: 180 };
  }
  
  return null;
}

function calculateMoonPhase(date: Date) {
  const days = getDaysSinceEpoch(date);
  const lunarAge = (days % 29.53);
  const phase = lunarAge / 29.53;
  
  let phaseName = '';
  if (phase < 0.125) phaseName = 'New Moon';
  else if (phase < 0.25) phaseName = 'Waxing Crescent';
  else if (phase < 0.375) phaseName = 'First Quarter';
  else if (phase < 0.5) phaseName = 'Waxing Gibbous';
  else if (phase < 0.625) phaseName = 'Full Moon';
  else if (phase < 0.75) phaseName = 'Waning Gibbous';
  else if (phase < 0.875) phaseName = 'Last Quarter';
  else phaseName = 'Waning Crescent';
  
  return {
    name: phaseName,
    percentage: (phase * 100).toFixed(1),
    lunarAge: lunarAge.toFixed(1),
  };
}

function checkVenusRetrograde(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  if (year === 2024 && month >= 11 && month <= 12) return true;
  if (year === 2025 && month <= 1) return true;
  
  return false;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

function getDaysSinceEpoch(date: Date): number {
  const epoch = new Date('2000-01-01T12:00:00Z');
  return Math.floor((date.getTime() - epoch.getTime()) / (24 * 60 * 60 * 1000));
}

function getLongitudeSign(longitude: number): { sign: string; degree: number } {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30) % 12;
  const degree = longitude % 30;
  
  return {
    sign: signs[signIndex],
    degree,
  };
}

function calculateMercuryPosition(date: Date) {
  const days = getDaysSinceEpoch(date);
  const mercuryMeanMotion = 4.0923;
  const mercuryEpoch = 120.77;
  
  const mercuryLongitude = (mercuryEpoch + mercuryMeanMotion * days) % 360;
  const { sign, degree } = getLongitudeSign(mercuryLongitude);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: mercuryLongitude.toFixed(2),
  };
}

function calculateJupiterPosition(date: Date) {
  const days = getDaysSinceEpoch(date);
  const jupiterMeanMotion = 0.0830;
  const jupiterEpoch = 64.29;
  
  const jupiterLongitude = (jupiterEpoch + jupiterMeanMotion * days) % 360;
  const { sign, degree } = getLongitudeSign(jupiterLongitude);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: jupiterLongitude.toFixed(2),
  };
}

function calculateSaturnPosition(date: Date) {
  const days = getDaysSinceEpoch(date);
  const saturnMeanMotion = 0.0334;
  const saturnEpoch = 99.46;
  
  const saturnLongitude = (saturnEpoch + saturnMeanMotion * days) % 360;
  const { sign, degree } = getLongitudeSign(saturnLongitude);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: saturnLongitude.toFixed(2),
  };
}

function calculateChiron(date: Date) {
  const days = getDaysSinceEpoch(date);
  const chironMeanMotion = 0.0134;
  const chironEpoch = 337.37;
  
  const chironLongitude = (chironEpoch + chironMeanMotion * days) % 360;
  const { sign, degree } = getLongitudeSign(chironLongitude);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: chironLongitude.toFixed(2),
  };
}

function calculateBlackMoonLilith(date: Date) {
  const days = getDaysSinceEpoch(date);
  // Black Moon Lilith (mean node) - more stable than true node
  const lilithMeanMotion = -0.0529;
  const lilithEpoch = 233.67;
  
  const lilithLongitude = (lilithEpoch + lilithMeanMotion * days) % 360;
  const { sign, degree } = getLongitudeSign(lilithLongitude);
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: lilithLongitude.toFixed(2),
  };
}

function calculatePlanetaryRulingHour(hours: number, minutes: number): any {
  // Planetary hours follow a 7-planet cycle: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
  const planetsInOrder = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
  const totalMinutes = hours * 60 + minutes;
  const hourOfDay = Math.floor(totalMinutes / 60);
  
  // Each planet rules approximately 24/7 = 3.43 hours
  const planetIndex = hourOfDay % 7;
  const rulingPlanet = planetsInOrder[planetIndex];
  
  return {
    hour: hourOfDay.toString().padStart(2, '0') + ':00',
    planet: rulingPlanet,
    note: `${rulingPlanet} rules this hour`,
  };
}

function calculateSkyMapData(hours: number, minutes: number): any {
  // Create SVG-friendly data for sky map
  // Map planets to approximate azimuth (0-360 degrees, where 0=North, 90=East, 180=South, 270=West)
  // Using simplified calculation based on hour of day
  
  const totalMinutes = hours * 60 + minutes;
  const hourProgress = (totalMinutes % 1440) / 1440; // Progress through 24-hour day
  const baseSouth = hourProgress * 360; // Simple hourly rotation
  
  // Assign planets to approximate positions
  const planetPositions = [
    { name: 'Sun', azimuth: (baseSouth + 0) % 360, altitude: 45 },
    { name: 'Moon', azimuth: (baseSouth + 45) % 360, altitude: 35 },
    { name: 'Mercury', azimuth: (baseSouth + 90) % 360, altitude: 40 },
    { name: 'Venus', azimuth: (baseSouth + 135) % 360, altitude: 50 },
    { name: 'Mars', azimuth: (baseSouth + 180) % 360, altitude: 30 },
    { name: 'Jupiter', azimuth: (baseSouth + 225) % 360, altitude: 25 },
    { name: 'Saturn', azimuth: (baseSouth + 270) % 360, altitude: 20 },
  ];
  
  return {
    hour: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    planets: planetPositions,
    horizon: 'Simplified celestial positions',
  };
}

function getRetrogradePlanets(date: Date): any {
  // Simplified retrograde detection based on date ranges for 2024-2025
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const retrograde: string[] = [];
  
  // Mercury retrograde periods (simplified)
  if ((year === 2024 && month >= 11) || (year === 2025 && month <= 1 && day <= 15)) {
    retrograde.push('Mercury');
  }
  
  // Venus retrograde periods (simplified)
  if (year === 2024 && month >= 11 && month <= 12) {
    retrograde.push('Venus');
  }
  
  // Mars retrograde (rare, none expected in 2024-2025)
  // Jupiter retrograde periods (simplified)
  if (year === 2024 && month >= 9 && month <= 12) {
    retrograde.push('Jupiter');
  }
  if (year === 2025 && month <= 1) {
    retrograde.push('Jupiter');
  }
  
  // Saturn retrograde periods (simplified)
  if (year === 2024 && month >= 9 && month <= 11) {
    retrograde.push('Saturn');
  }
  
  return {
    retrograduatePlanets: retrograde.length > 0 ? retrograde : ['None'],
    count: retrograde.length,
  };
}
