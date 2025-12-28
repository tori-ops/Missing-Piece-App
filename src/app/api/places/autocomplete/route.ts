// Google Places API autocomplete endpoint for venue search
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Use Google Places Autocomplete API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${apiKey}&components=country:us&type=establishment`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (data.error_message) {
      console.error('Google Places API error:', data.error_message);
      return NextResponse.json({ error: data.error_message }, { status: 500 });
    }

    // Return predictions
    return NextResponse.json({
      predictions: data.predictions || []
    });
  } catch (error) {
    console.error('Places autocomplete error:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}
