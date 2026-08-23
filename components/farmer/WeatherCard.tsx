'use client'

import React, { useState, useEffect } from 'react';
import { FarmerProfile } from '../../lib/supabase/types';
import { WeatherData } from '../../lib/services/weatherService';

interface WeatherCardProps {
  profile: FarmerProfile | null;
}

export default function WeatherCard({ profile }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const locationQuery = profile?.district
        ? `${profile.district}${profile.state ? `, ${profile.state}` : ''}`
        : (profile?.location_address || profile?.state || '');

      let url = '/api/weather';
      const params = new URLSearchParams();

      if (profile?.latitude && profile?.longitude) {
        params.append('lat', profile.latitude.toString());
        params.append('lon', profile.longitude.toString());
      }
      if (locationQuery) {
        params.append('location', locationQuery);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        setWeather(json.data);
      } else {
        throw new Error(json.error || 'Weather data temporarily unavailable.');
      }
    } catch (err: any) {
      console.error('Error fetching live weather data:', err);
      setError('Weather data temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [profile?.id, profile?.district, profile?.latitude, profile?.longitude]);

  // Loading State UI
  if (loading) {
    return (
      <div className="bg-white border-2 border-black p-6 rounded-none space-y-4 animate-pulse">
        <div className="flex justify-between items-center border-b border-black pb-2">
          <div className="h-6 bg-slate-200 w-36"></div>
          <div className="h-4 bg-slate-200 w-24"></div>
        </div>
        <p className="text-gray-600 font-bold text-center py-4">⌛ Loading weather...</p>
      </div>
    );
  }

  // Error State UI
  if (error || !weather) {
    return (
      <div className="bg-white border-2 border-red-600 p-6 rounded-none space-y-3 text-center">
        <h3 className="text-lg font-bold text-red-800">🌦️ Weather</h3>
        <p className="text-sm text-red-600 font-semibold">{error || 'Weather data temporarily unavailable.'}</p>
        <button
          onClick={fetchWeather}
          className="mt-2 bg-[#003366] text-white font-bold border border-black px-5 py-2 rounded-none hover:bg-blue-800 cursor-pointer text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const { current, forecast, location } = weather;
  const locationDisplayName = profile?.district
    ? `${profile.district}${profile.state ? `, ${profile.state}` : ''}`
    : location.name;

  return (
    <div className="bg-white border-2 border-black p-6 rounded-none space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌦️</span>
          <div>
            <h3 className="text-xl font-bold text-[#003366] m-0">Live Weather</h3>
            <p className="text-xs text-gray-600 font-bold mt-0.5">
              📍 {locationDisplayName}
            </p>
          </div>
        </div>

        <span className="text-xs bg-slate-100 border border-black px-2.5 py-1 font-bold text-gray-700">
          Updated {current.updatedAt}
        </span>
      </div>

      {/* Current Weather Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-black p-4">
        {/* Main Temperature */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">{current.conditionIcon}</span>
          <div>
            <div className="text-3xl font-extrabold text-black">{current.temperature}°C</div>
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">{current.conditionText}</div>
          </div>
        </div>

        {/* Humidity */}
        <div className="border-t sm:border-t-0 sm:border-l border-gray-300 pt-2 sm:pt-0 sm:pl-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">💧 Humidity</span>
          <span className="text-xl font-bold text-black mt-1 block">{current.humidity}%</span>
        </div>

        {/* Rain Chance / Precipitation */}
        <div className="border-t md:border-t-0 md:border-l border-gray-300 pt-2 md:pt-0 md:pl-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">🌧️ Rain / Precip</span>
          <span className="text-xl font-bold text-black mt-1 block">
            {current.precipitation > 0 ? `${current.precipitation} mm` : `${forecast[0]?.rainProbability || 0}% Chance`}
          </span>
        </div>

        {/* Wind Speed */}
        <div className="border-t md:border-t-0 md:border-l border-gray-300 pt-2 md:pt-0 md:pl-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">💨 Wind Speed</span>
          <span className="text-xl font-bold text-black mt-1 block">{current.windSpeed} km/h</span>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#003366] uppercase tracking-wide border-b border-gray-300 pb-1">
          📅 7-Day Weather Forecast
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {forecast.map((day, idx) => (
            <div
              key={day.date || idx}
              className={`border p-2 text-center rounded-none text-xs space-y-1 ${
                idx === 0 ? 'bg-blue-50 border-black font-bold' : 'bg-white border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-800">{day.dayName}</div>
              <div className="text-2xl my-1">{day.conditionIcon}</div>
              <div className="font-bold text-black">{day.temperatureMax}° / {day.temperatureMin}°</div>
              <div className="text-[11px] text-blue-700 font-semibold">🌧️ {day.rainProbability}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
