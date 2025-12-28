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
    
    const sunData = calculateSunPosition(weddingDate);
    const moonData = calculateMoonPosition(weddingDate, time || undefined);
    const venusData = calculateVenusPosition(weddingDate);
    const marsData = calculateMarsPosition(weddingDate);
    
    let risingData = null;
    let houses = null;
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      risingData = calculateRisingSign(hours, minutes);
      houses = calculateHouses(hours, minutes, sunData, moonData, venusData, marsData);
    }
    
    const aspects = calculateAspects(sunData, moonData, venusData);
    const moonPhase = calculateMoonPhase(weddingDate);

    return NextResponse.json({
      date,
      sun: sunData,
      moon: moonData,
      venus: venusData,
      mars: marsData,
      rising: risingData,
      houses,
      aspects,
      moonPhase,
      disclaimer: 'Astrology reflects meaning, not destiny. The true power lies in your commitment',
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
  
  return {
    sign,
    degree: degree.toFixed(1),
    longitude: moonLongitude.toFixed(2),
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
      meaning: sunMoonAspect.meaning,
    });
  }
  
  const sunVenusDiff = Math.abs(parseFloat(sun.longitude) - parseFloat(venus.longitude));
  const sunVenusAspect = getAspect(sunVenusDiff);
  if (sunVenusAspect) {
    aspects.push({
      type: `Sun ${sunVenusAspect.name} Venus`,
      angle: sunVenusAspect.angle,
      meaning: sunVenusAspect.meaning,
    });
  }
  
  const moonVenusDiff = Math.abs(parseFloat(moon.longitude) - parseFloat(venus.longitude));
  const moonVenusAspect = getAspect(moonVenusDiff);
  if (moonVenusAspect) {
    aspects.push({
      type: `Moon ${moonVenusAspect.name} Venus`,
      angle: moonVenusAspect.angle,
      meaning: moonVenusAspect.meaning,
    });
  }

  return aspects;
}

function getAspect(angleDiff: number): any {
  const diff = angleDiff > 180 ? 360 - angleDiff : angleDiff;
  
  if (Math.abs(diff - 0) < 8) {
    return { name: 'Conjunction', angle: 0, meaning: 'Union at 0°' };
  }
  if (Math.abs(diff - 60) < 8) {
    return { name: 'Sextile', angle: 60, meaning: 'Support at 60°' };
  }
  if (Math.abs(diff - 90) < 8) {
    return { name: 'Square', angle: 90, meaning: 'Challenge at 90°' };
  }
  if (Math.abs(diff - 120) < 8) {
    return { name: 'Trine', angle: 120, meaning: 'Harmony at 120°' };
  }
  if (Math.abs(diff - 180) < 8) {
    return { name: 'Opposition', angle: 180, meaning: 'Opposition at 180°' };
  }
  
  return null;
}

function calculateMoonPhase(date: Date) {
  const days = getDaysSinceEpoch(date);
  const phase = (days % 29.53) / 29.53;
  
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
