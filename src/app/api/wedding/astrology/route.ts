// Get moon phase and zodiac sign for a date
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
  }

  try {
    const weddingDate = new Date(date);
    
    // Calculate moon phase
    // Using Meeus/Jones/Butcher algorithm for moon age
    const d = new Date(1999, 11, 31); // Reference new moon date
    const knownNewMoonDate = d.getTime();
    const lunarCycle = 29.53058867; // days
    const daysSinceReference = (weddingDate.getTime() - knownNewMoonDate) / (1000 * 60 * 60 * 24);
    const moonAge = (daysSinceReference % lunarCycle) / lunarCycle;

    const getMoonPhase = (age: number) => {
      if (age < 0.125) return { phase: 'New Moon', emoji: '🌑', description: 'New beginnings' };
      if (age < 0.25) return { phase: 'Waxing Crescent', emoji: '🌒', description: 'Growing towards goals' };
      if (age < 0.375) return { phase: 'First Quarter', emoji: '🌓', description: 'Taking action' };
      if (age < 0.5) return { phase: 'Waxing Gibbous', emoji: '🌔', description: 'Building momentum' };
      if (age < 0.625) return { phase: 'Full Moon', emoji: '🌕', description: 'Culmination & clarity' };
      if (age < 0.75) return { phase: 'Waning Gibbous', emoji: '🌖', description: 'Gratitude & sharing' };
      if (age < 0.875) return { phase: 'Last Quarter', emoji: '🌗', description: 'Reflection & release' };
      return { phase: 'Waning Crescent', emoji: '🌘', description: 'Rest & renewal' };
    };

    // Calculate zodiac sign
    const month = weddingDate.getMonth() + 1;
    const day = weddingDate.getDate();

    const getZodiacSign = (month: number, day: number) => {
      const zodiacDates: Array<{
        sign: string;
        emoji: string;
        startMonth: number;
        startDay: number;
        endMonth: number;
        endDay: number;
      }> = [
        { sign: 'Capricorn', emoji: '♑', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
        { sign: 'Aquarius', emoji: '♒', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
        { sign: 'Pisces', emoji: '♓', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
        { sign: 'Aries', emoji: '♈', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
        { sign: 'Taurus', emoji: '♉', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
        { sign: 'Gemini', emoji: '♊', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
        { sign: 'Cancer', emoji: '♋', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
        { sign: 'Leo', emoji: '♌', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
        { sign: 'Virgo', emoji: '♍', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
        { sign: 'Libra', emoji: '♎', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
        { sign: 'Scorpio', emoji: '♏', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
        { sign: 'Sagittarius', emoji: '♐', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
      ];

      const zodiac = zodiacDates.find((z) => {
        if (z.startMonth === z.endMonth) {
          return month === z.startMonth && day >= z.startDay && day <= z.endDay;
        } else if (z.startMonth > z.endMonth) {
          // Wraps around year (e.g., Capricorn)
          return (month === z.startMonth && day >= z.startDay) || (month === z.endMonth && day <= z.endDay);
        } else {
          return month === z.startMonth ? day >= z.startDay : month === z.endMonth ? day <= z.endDay : false;
        }
      });

      return zodiac || { sign: 'Unknown', emoji: '?', startMonth: 0, startDay: 0, endMonth: 0, endDay: 0 };
    };

    const moonPhase = getMoonPhase(moonAge);
    const zodiacSign = getZodiacSign(month, day);

    return NextResponse.json({
      moonPhase: moonPhase.phase,
      moonEmoji: moonPhase.emoji,
      moonMeaning: moonPhase.description,
      moonIllumination: Math.round(moonAge * 100) + '%',
      zodiacSign: zodiacSign.sign,
      zodiacEmoji: zodiacSign.emoji,
      daysUntilFullMoon: Math.round(((0.5 - moonAge) % 1) * lunarCycle)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Astrology API error:', { error: errorMessage });
    return NextResponse.json({ error: `Failed to calculate astrology: ${errorMessage}` }, { status: 500 });
  }
}
