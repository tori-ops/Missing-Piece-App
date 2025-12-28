// Get detailed venue information from Google Places
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Get place details
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,phone_number,website,name&key=${apiKey}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (data.error_message) {
      console.error('Google Places API error:', data.error_message);
      return NextResponse.json({ error: data.error_message }, { status: 500 });
    }

    const result = data.result || {};

    // Parse address into components
    const addressParts = (result.formatted_address || '').split(',').map((s: string) => s.trim());
    const [address1, ...restAddress] = addressParts;
    const city = restAddress[restAddress.length - 2]?.trim() || '';
    const stateZip = restAddress[restAddress.length - 1]?.trim() || '';
    const [state, zip] = stateZip.split(/\s+/);

    return NextResponse.json({
      name: result.name || '',
      address: result.formatted_address || '',
      addressLine1: address1 || '',
      city: city,
      state: state || '',
      zip: zip || '',
      lat: result.geometry?.location?.lat,
      lng: result.geometry?.location?.lng,
      phone: result.phone_number || '',
      website: result.website || ''
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Places details error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: `Failed to fetch venue details: ${errorMessage}` }, { status: 500 });
  }
}
