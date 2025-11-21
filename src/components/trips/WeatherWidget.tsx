/**
 * Weather Widget Component
 *
 * Displays weather forecast for trip duration using OpenWeatherMap API.
 * Shows daily forecasts with temperature, conditions, and icons.
 *
 * @component
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

interface WeatherForecast {
  date: string;
  temp: {
    min: number;
    max: number;
    day: number;
  };
  weather: {
    main: string;
    description: string;
  };
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

interface WeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  tripDates: {
    start: Date;
    end: Date;
  };
  forecasts: WeatherForecast[];
}

interface WeatherWidgetProps {
  tripId: string;
}

/**
 * Fetch weather forecast for trip
 */
async function fetchWeatherForecast(tripId: string): Promise<WeatherData> {
  const response = await fetch(`/api/trips/${tripId}/weather`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to fetch weather forecast');
  }

  return response.json();
}

/**
 * Get weather icon based on weather condition
 */
function getWeatherIcon(condition: string): React.ReactNode {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    return <CloudRain className="h-8 w-8 text-blue-500" />;
  }
  if (lowerCondition.includes('snow')) {
    return <CloudSnow className="h-8 w-8 text-blue-300" />;
  }
  if (lowerCondition.includes('cloud')) {
    return <Cloud className="h-8 w-8 text-gray-400" />;
  }
  if (lowerCondition.includes('clear') || lowerCondition.includes('sun')) {
    return <Sun className="h-8 w-8 text-yellow-500" />;
  }

  return <Cloud className="h-8 w-8 text-gray-400" />;
}

/**
 * Format temperature with degree symbol
 */
function formatTemp(temp: number): string {
  return `${Math.round(temp)}°C`;
}

/**
 * Weather Widget Component
 */
export function WeatherWidget({ tripId }: WeatherWidgetProps) {
  const {
    data: weatherData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['weather', tripId],
    queryFn: () => fetchWeatherForecast(tripId),
    staleTime: 3600000, // 1 hour
    retry: 1,
  });

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Loading weather data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !weatherData) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to load weather forecast';
    const isConfigError = errorMessage.includes('not configured') || errorMessage.includes('not available');

    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>Weather data unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={isConfigError ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isConfigError ? (
                <>
                  Weather service requires OpenWeatherMap API key configuration.
                  <br />
                  <span className="text-xs text-gray-500 mt-1 block">
                    Set OPENWEATHER_API_KEY in your environment variables.
                  </span>
                </>
              ) : (
                errorMessage
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { location, forecasts } = weatherData;

  // No forecasts available
  if (!forecasts || forecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
          <CardDescription>{location.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No weather forecast available for this trip.
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                Add events with location data to see weather forecasts.
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Success state with forecasts
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Forecast</CardTitle>
        <CardDescription>{location.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forecasts.map((forecast) => {
            const date = new Date(forecast.date);
            const dayName = format(date, 'EEE, MMM d');

            return (
              <div
                key={forecast.date}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Date and Weather Icon */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {getWeatherIcon(forecast.weather.main)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{dayName}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {forecast.weather.description}
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatTemp(forecast.temp.max)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTemp(forecast.temp.min)}
                    </div>
                  </div>

                  {/* Additional Weather Details */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 ml-4 border-l pl-4">
                    {/* Precipitation */}
                    {forecast.precipitation > 0 && (
                      <div className="flex items-center gap-1" title="Precipitation">
                        <Droplets className="h-3 w-3" />
                        <span>{Math.round(forecast.precipitation)}mm</span>
                      </div>
                    )}

                    {/* Wind Speed */}
                    {forecast.windSpeed > 0 && (
                      <div className="flex items-center gap-1" title="Wind Speed">
                        <Wind className="h-3 w-3" />
                        <span>{Math.round(forecast.windSpeed)}m/s</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Attribution */}
        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          Weather data provided by{' '}
          <a
            href="https://openweathermap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            OpenWeatherMap
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
