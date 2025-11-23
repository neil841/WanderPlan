/**
 * Airport Search API
 *
 * Searches the local airport database by IATA code, ICAO code, name, or city.
 * Returns up to 10 matching airports.
 */

import { NextRequest, NextResponse } from 'next/server';
import airportsData from '@/data/airports.json';

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const airports: Airport[] = airportsData as Airport[];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Search airports by IATA, ICAO, name, or city
    const results = airports
      .filter((airport) => {
        const iataMatch = airport.iata.toLowerCase().includes(query);
        const icaoMatch = airport.icao.toLowerCase().includes(query);
        const nameMatch = airport.name.toLowerCase().includes(query);
        const cityMatch = airport.city.toLowerCase().includes(query);

        return iataMatch || icaoMatch || nameMatch || cityMatch;
      })
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({ airports: results });
  } catch (error) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: 'Failed to search airports' },
      { status: 500 }
    );
  }
}
