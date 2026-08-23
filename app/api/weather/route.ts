import { NextResponse } from 'next/server';
import { fetchLiveWeather, geocodeLocation } from '../../../lib/services/weatherService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const locationParam = searchParams.get('location') || searchParams.get('district') || searchParams.get('state');

    let latitude = latParam ? parseFloat(latParam) : null;
    let longitude = lonParam ? parseFloat(lonParam) : null;
    let locationName = locationParam || 'Your Farm';

    // Geocode if coordinates are missing or invalid
    if ((latitude === null || isNaN(latitude) || longitude === null || isNaN(longitude)) && locationParam) {
      const geoResult = await geocodeLocation(locationParam);
      if (geoResult) {
        latitude = geoResult.latitude;
        longitude = geoResult.longitude;
        locationName = geoResult.name;
      }
    }

    // Default fallback coordinates (e.g. India center / Delhi) if location resolution fails
    if (latitude === null || isNaN(latitude) || longitude === null || isNaN(longitude)) {
      // Default to Delhi if no location provided at all
      const geoFallback = await geocodeLocation('Banka, Bihar') || { latitude: 24.88, longitude: 86.92, name: 'Banka, Bihar' };
      latitude = geoFallback.latitude;
      longitude = geoFallback.longitude;
      locationName = locationParam || geoFallback.name;
    }

    const weatherData = await fetchLiveWeather(latitude, longitude, locationName);

    return NextResponse.json({
      success: true,
      data: weatherData
    }, { status: 200 });

  } catch (error: any) {
    console.error('API /api/weather error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Weather data temporarily unavailable.'
    }, { status: 500 });
  }
}
