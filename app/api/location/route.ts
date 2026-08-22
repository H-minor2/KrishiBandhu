import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import axios from 'axios';

// Initialize PostgreSQL connection pool
// Note: You must provide a valid DATABASE_URL in your .env.local file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/krishi_bandhu',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobileNumber, latitude, longitude, rawLocationString } = body;

    let geocodedAddress = null;

    // Optional: Resolve Lat/Long using Google Maps API if provided
    if (latitude && longitude && process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const geoRes = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            latlng: `${latitude},${longitude}`,
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        });

        if (geoRes.data.status === 'OK' && geoRes.data.results.length > 0) {
          geocodedAddress = geoRes.data.results[0].formatted_address;
        }
      } catch (geocodeError) {
        console.error('Error contacting Geocoding API:', geocodeError);
      }
    }

    // Insert user if they don't exist, and return their ID
    // Note: We use ON CONFLICT to handle returning users gracefully
    const userQuery = `
      INSERT INTO users (mobile_number) 
      VALUES ($1) 
      ON CONFLICT (mobile_number) DO UPDATE SET mobile_number=EXCLUDED.mobile_number
      RETURNING id;
    `;
    const userResult = await pool.query(userQuery, [mobileNumber]);
    const userId = userResult.rows[0].id;

    // Insert the location record for this user
    const locationQuery = `
      INSERT INTO locations (user_id, latitude, longitude, raw_location_string, geocoded_address) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    
    // Fallback coordinates if only raw string provided
    const safeLat = latitude || 0;
    const safeLng = longitude || 0;

    await pool.query(locationQuery, [userId, safeLat, safeLng, rawLocationString, geocodedAddress]);

    return NextResponse.json({ 
      success: true, 
      message: 'Data secured successfully.',
      resolvedAddress: geocodedAddress 
    }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error during submission.' 
    }, { status: 500 });
  }
}
