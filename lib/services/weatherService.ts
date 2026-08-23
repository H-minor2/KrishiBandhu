export interface DailyForecast {
  date: string;
  dayName: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
  rainProbability: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: string;
}

export interface WeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    rain: boolean;
    windSpeed: number;
    weatherCode: number;
    conditionText: string;
    conditionIcon: string;
    updatedAt: string;
  };
  forecast: DailyForecast[];
}

export function parseWmoWeatherCode(code: number): { conditionText: string; conditionIcon: string } {
  switch (code) {
    case 0:
      return { conditionText: 'Clear Sky', conditionIcon: '☀️' };
    case 1:
      return { conditionText: 'Mainly Clear', conditionIcon: '🌤️' };
    case 2:
      return { conditionText: 'Partly Cloudy', conditionIcon: '⛅' };
    case 3:
      return { conditionText: 'Overcast', conditionIcon: '☁️' };
    case 45:
    case 48:
      return { conditionText: 'Foggy', conditionIcon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { conditionText: 'Light Drizzle', conditionIcon: '🌧️' };
    case 56:
    case 57:
      return { conditionText: 'Freezing Drizzle', conditionIcon: '🌧️' };
    case 61:
      return { conditionText: 'Slight Rain', conditionIcon: '🌧️' };
    case 63:
      return { conditionText: 'Moderate Rain', conditionIcon: '🌧️' };
    case 65:
      return { conditionText: 'Heavy Rain', conditionIcon: '🌧️' };
    case 66:
    case 67:
      return { conditionText: 'Freezing Rain', conditionIcon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { conditionText: 'Snowfall', conditionIcon: '🌨️' };
    case 77:
      return { conditionText: 'Snow Grains', conditionIcon: '🌨️' };
    case 80:
    case 81:
    case 82:
      return { conditionText: 'Rain Showers', conditionIcon: '🌦️' };
    case 85:
    case 86:
      return { conditionText: 'Snow Showers', conditionIcon: '🌨️' };
    case 95:
      return { conditionText: 'Thunderstorm', conditionIcon: '⛈️' };
    case 96:
    case 99:
      return { conditionText: 'Heavy Thunderstorm', conditionIcon: '⛈️' };
    default:
      return { conditionText: 'Partly Cloudy', conditionIcon: '⛅' };
  }
}

export async function geocodeLocation(locationString: string): Promise<{ latitude: number; longitude: number; name: string } | null> {
  try {
    const cleanQuery = locationString.trim();
    if (!cleanQuery) return null;

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: Number(result.latitude),
        longitude: Number(result.longitude),
        name: `${result.name}${result.admin1 ? `, ${result.admin1}` : ''}`
      };
    }
    return null;
  } catch (err) {
    console.error('Error geocoding location via Open-Meteo:', err);
    return null;
  }
}

export async function fetchLiveWeather(
  latitude: number,
  longitude: number,
  locationName: string = 'Your Location'
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API returned status ${res.status}`);
  }

  const data = await res.json();

  const currentWmo = parseWmoWeatherCode(data.current?.weather_code ?? 0);

  const forecast: DailyForecast[] = (data.daily?.time || []).map((dateStr: string, idx: number) => {
    const d = new Date(dateStr);
    const dayName = idx === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const wmo = parseWmoWeatherCode(data.daily.weather_code[idx] ?? 0);

    return {
      date: dateStr,
      dayName,
      temperatureMax: Math.round(data.daily.temperature_2m_max[idx] ?? 0),
      temperatureMin: Math.round(data.daily.temperature_2m_min[idx] ?? 0),
      precipitation: Number(data.daily.precipitation_sum[idx] ?? 0),
      rainProbability: Math.round(data.daily.precipitation_probability_max[idx] ?? 0),
      weatherCode: data.daily.weather_code[idx] ?? 0,
      conditionText: wmo.conditionText,
      conditionIcon: wmo.conditionIcon
    };
  });

  return {
    location: {
      name: locationName,
      latitude,
      longitude
    },
    current: {
      temperature: Math.round(data.current?.temperature_2m ?? 0),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 0),
      precipitation: Number(data.current?.precipitation ?? 0),
      rain: (data.current?.rain ?? 0) > 0 || (data.current?.precipitation ?? 0) > 0,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
      weatherCode: data.current?.weather_code ?? 0,
      conditionText: currentWmo.conditionText,
      conditionIcon: currentWmo.conditionIcon,
      updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    },
    forecast
  };
}
