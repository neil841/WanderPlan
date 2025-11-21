/**
 * OpenWeatherMap API integration for weather forecasts
 *
 * Provides weather forecast data for trip destinations.
 * Requires OpenWeatherMap API key (free tier: 1000 calls/day).
 *
 * API Documentation: https://openweathermap.org/api/one-call-3
 */

export interface WeatherForecast {
  date: string; // ISO date string
  temp: {
    min: number;
    max: number;
    day: number;
  };
  weather: {
    main: string; // e.g., "Clear", "Rain", "Clouds"
    description: string; // e.g., "clear sky", "light rain"
    icon: string; // Icon code (e.g., "01d")
  };
  precipitation: number; // mm
  humidity: number; // %
  windSpeed: number; // m/s
  clouds: number; // %
}

export interface WeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  forecasts: WeatherForecast[];
  timezone: string;
}

/**
 * OpenWeatherMap API base URL
 */
const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Weather icon URL helper
 *
 * @param iconCode - Icon code from API (e.g., "01d")
 * @returns Full icon URL
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Fetch weather forecast for a location
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @param days - Number of days to forecast (max: 16)
 * @param apiKey - OpenWeatherMap API key
 * @returns Weather forecast data
 */
export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  days: number = 7,
  apiKey?: string
): Promise<WeatherForecast[]> {
  // Get API key
  const key = apiKey || process.env.OPENWEATHER_API_KEY;

  if (!key) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  // Validate coordinates
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error(`Invalid coordinates: ${lat}, ${lon}`);
  }

  // Limit days
  const limitedDays = Math.min(Math.max(days, 1), 16);

  try {
    // Use 5-day forecast endpoint (free tier)
    const response = await fetch(
      `${OPENWEATHER_API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&cnt=${limitedDays * 8}`,
      {
        headers: {
          'User-Agent': 'WanderPlan/1.0 (Travel Planning App)',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid OpenWeatherMap API key');
      }
      if (response.status === 429) {
        throw new Error('OpenWeatherMap rate limit exceeded');
      }
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.list || !Array.isArray(data.list)) {
      throw new Error('Invalid weather data format');
    }

    // Group by day and aggregate
    const dailyForecasts: Record<string, any[]> = {};

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = [];
      }

      dailyForecasts[dateKey].push(item);
    });

    // Convert to WeatherForecast format
    const forecasts: WeatherForecast[] = Object.entries(dailyForecasts)
      .slice(0, limitedDays)
      .map(([date, items]) => {
        const temps = items.map((i) => i.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

        // Use the most common weather condition
        const weatherCounts: Record<string, number> = {};
        items.forEach((i) => {
          const main = i.weather[0].main;
          weatherCounts[main] = (weatherCounts[main] || 0) + 1;
        });

        const mostCommon = Object.entries(weatherCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        const weatherItem = items.find((i) => i.weather[0].main === mostCommon);

        // Calculate precipitation
        const precipitation = items.reduce(
          (sum, i) => sum + (i.rain?.['3h'] || 0) + (i.snow?.['3h'] || 0),
          0
        );

        return {
          date,
          temp: {
            min: Math.round(minTemp),
            max: Math.round(maxTemp),
            day: Math.round(avgTemp),
          },
          weather: {
            main: weatherItem.weather[0].main,
            description: weatherItem.weather[0].description,
            icon: weatherItem.weather[0].icon,
          },
          precipitation: Math.round(precipitation * 10) / 10,
          humidity: Math.round(
            items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length
          ),
          windSpeed: Math.round(
            items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length * 10
          ) / 10,
          clouds: Math.round(
            items.reduce((sum, i) => sum + i.clouds.all, 0) / items.length
          ),
        };
      });

    return forecasts;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch weather forecast: ${error.message}`);
    }
    throw new Error('Failed to fetch weather forecast: Unknown error');
  }
}

/**
 * Check if OpenWeatherMap API is available
 *
 * @returns True if API key is configured
 */
export function isWeatherApiAvailable(): boolean {
  return !!process.env.OPENWEATHER_API_KEY;
}

/**
 * Get weather condition emoji
 *
 * @param condition - Weather condition (e.g., "Clear", "Rain")
 * @returns Emoji representation
 */
export function getWeatherEmoji(condition: string): string {
  const emojis: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️',
  };

  return emojis[condition] || '🌤️';
}
