// Google Places API autocomplete endpoint for venue search (NEW API)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API;
  if (!apiKey) {
    console.error('API key not found. Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('PLACES')));
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Use NEW Google Places API v1 autocomplete
    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify({
          input: input,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Places API error:', { status: response.status, data });
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: 500 });
    }

    // Transform new API format to match our frontend expectations
    const predictions = (data.suggestions || []).map((suggestion: any) => {
      const pred = suggestion.placePrediction || {};
      const structured = pred.structuredFormat || {};
      
      // Extract from structuredFormat
      const mainText = structured.mainText?.text || pred.text?.text || '';
      const secondaryText = structured.secondaryText?.text || '';
      
      return {
        place_id: pred.placeId || '',
        main_text: mainText,
        description: secondaryText,
      };
    });
    
    return NextResponse.json({
      predictions: predictions,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Places autocomplete error:', { error: errorMessage, input });
    return NextResponse.json({ error: `Failed to fetch venues: ${errorMessage}` }, { status: 500 });
  }
}
