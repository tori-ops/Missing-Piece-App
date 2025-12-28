// Get detailed venue information from Google Places (NEW API)
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
    // Use NEW Google Places API v1 to get place details
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,formattedAddress,location,internationalPhoneNumber,nationalPhoneNumber,websiteUri`,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Places API error:', data);
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: 500 });
    }

    // Parse address into components
    const formattedAddress = data.formattedAddress || '';
    const addressParts = formattedAddress.split(',').map((s: string) => s.trim());
    const [address1, ...restAddress] = addressParts;
    const city = restAddress[restAddress.length - 2]?.trim() || '';
    const stateZip = restAddress[restAddress.length - 1]?.trim() || '';
    const [state, zip] = stateZip.split(/\s+/);

    const result = {
      name: data.displayName?.text || '',
      address: formattedAddress,
      addressLine1: address1 || '',
      city: city,
      state: state || '',
      zip: zip || '',
      lat: data.location?.latitude || 0,
      lng: data.location?.longitude || 0,
      phone: data.internationalPhoneNumber || data.nationalPhoneNumber || '',
      website: data.websiteUri || ''
    };

    console.log('Place details result:', result);

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Places details error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: `Failed to fetch venue details: ${errorMessage}` }, { status: 500 });
  }
}
