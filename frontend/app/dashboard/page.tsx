'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchFarmerDashboardData, addNewCropToSupabase } from '../../lib/supabase/client';
import { FarmerProfile, FarmerCropData } from '../../lib/supabase/types';
import CropSelector from '../../components/farmer/CropSelector';
import LandDetailsInput from '../../components/farmer/LandDetailsInput';
import AgriDetailsInput from '../../components/farmer/AgriDetailsInput';
import FinancialDetailsInput from '../../components/farmer/FinancialDetailsInput';
import '../globals.css';

interface WeatherDay {
  date: string;
  current_temp_c: number | null;
  feels_like_c: number | null;
  updated_at: string | null;
  avg_temp_c: number;
  min_temp_c: number;
  max_temp_c: number;
  max_wind_kph: number;
  humidity: number;
  chance_of_rain: number;
  condition: string;
  sunrise: string;
  sunset: string;
}

export default function DashboardPage() {
  const [fontSize, setFontSize] = useState('text-base');
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [crops, setCrops] = useState<FarmerCropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherDay | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  // New Crop Entry State
  const [newCropName, setNewCropName] = useState('Wheat');
  const [customCropName, setCustomCropName] = useState('');
  const [landSize, setLandSize] = useState<number | ''>(2);
  const [landUnit, setLandUnit] = useState<'Acre' | 'Hectare' | 'Bigha'>('Acre');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [irrigationType, setIrrigationType] = useState<any>('Canal');
  const [soilType, setSoilType] = useState<any>('Black');
  const [harvestDate, setHarvestDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [loanAmount, setLoanAmount] = useState<number | ''>(25000);
  const [loanDueDate, setLoanDueDate] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const data = await fetchFarmerDashboardData();
      if (data.profile) setProfile(data.profile);
      if (data.crops) setCrops(data.crops);
      setLoading(false);

      if (data.profile?.latitude != null && data.profile.longitude != null) {
        setWeatherLoading(true);
        setWeatherError('');
        try {
          const weatherApiUrl = process.env.NEXT_PUBLIC_WEATHER_API_URL || 'http://localhost:8000';
          const response = await fetch(
            `${weatherApiUrl}/weather?latitude=${encodeURIComponent(data.profile.latitude)}&longitude=${encodeURIComponent(data.profile.longitude)}`
          );
          if (!response.ok) throw new Error('Weather service returned an error.');

          const weatherData: { forecast?: WeatherDay[] } = await response.json();
          setWeather(weatherData.forecast?.[0] || null);
          if (!weatherData.forecast?.length) setWeatherError('No weather data available for this location.');
        } catch (error) {
          console.error('Weather fetch error:', error);
          setWeatherError('Weather details are currently unavailable.');
        } finally {
          setWeatherLoading(false);
        }
      } else {
        setWeatherError('GPS coordinates are not available for this farmer.');
      }
    }
    loadDashboardData();
  }, []);

  const handleAddCropEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await addNewCropToSupabase({
      crop_name: newCropName,
      custom_crop_name: customCropName,
      land_size: Number(landSize) || 0,
      land_unit: landUnit,
      sowing_date: sowingDate,
      irrigation_type: irrigationType,
      soil_type: soilType,
      expected_harvest_date: harvestDate,
      loan_amount: Number(loanAmount) || 0,
      loan_due_date: loanDueDate
    });

    if (res.crop) {
      const updatedCrops = [res.crop, ...crops];
      setCrops(updatedCrops);
      if (typeof window !== 'undefined') {
        localStorage.setItem('krishibandhu_farmer_crops', JSON.stringify(updatedCrops));
      }
    }

    setIsModalOpen(false);
  };

  return (
    <main className={`min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black ${fontSize}`}>

      {/* Navbar */}
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline"
          >
            SEAL
          </Link>

          <h1 className="m-0 text-xl font-bold tracking-tight">
            Krishi Bandhu Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex">
            <button
              type="button"
              onClick={() => setFontSize('text-lg')}
              className="bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200"
            >
              A+
            </button>

            <button
              type="button"
              onClick={() => setFontSize('text-sm')}
              className="bg-white text-black border border-black border-l-0 px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200"
            >
              A-
            </button>
          </div>

          <Link
            href="/signup"
            className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200 no-underline text-sm"
          >
            ➕ Register New Farmer Profile
          </Link>

          <button
            onClick={() => window.location.href = '/'}
            className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200 text-sm"
          >
            🚪 Log Out
          </button>
        </div>
      </nav>


      {/* =========================================================
          MAIN DASHBOARD LAYOUT
          LEFT  -> Farmer Profile
          RIGHT -> Weather + Crop Information
          ========================================================= */}

      <div className="w-full max-w-7xl mx-auto p-4 md:p-8">

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">


          {/* =====================================================
              LEFT SIDEBAR - FARMER PROFILE
              ===================================================== */}

          <aside className="bg-white border-2 border-black p-6 rounded-none">

            {/* Farmer Label */}
            <span className="inline-block bg-[#003366] text-white text-xs font-bold px-3 py-1.5">
              SUPABASE REGISTERED FARMER
            </span>


            {/* Farmer Icon */}
            <div className="mt-6 text-5xl">
              👤
            </div>


            {/* Farmer Name */}
            <h2 className="text-3xl font-bold text-black mt-2 mb-6">
              {profile?.full_name ||
                (loading ? 'Loading Profile...' : 'Registered Farmer')}
            </h2>


            {/* Mobile */}
            <div className="border-t border-gray-300 py-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">📱</span>

                <div>
                  <p className="text-sm font-bold text-gray-700">
                    Mobile:
                  </p>

                  <p className="text-sm mt-1">
                    {profile?.mobile_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>


            {/* Location */}
            <div className="border-t border-gray-300 py-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>

                <div>
                  <p className="text-sm font-bold text-gray-700">
                    Location:
                  </p>

                  <p className="text-sm mt-1 leading-6">
                    {profile?.location_address ||
                      (profile?.district
                        ? `${profile.district}, ${profile.state}`
                        : 'N/A')}
                  </p>
                </div>
              </div>
            </div>


            {/* District */}
            <div className="border-t border-gray-300 py-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">🏢</span>

                <div>
                  <p className="text-sm font-bold text-gray-700">
                    District:
                  </p>

                  <p className="text-sm mt-1">
                    {profile?.district || 'N/A'}
                  </p>
                </div>
              </div>
            </div>


            {/* State */}
            <div className="border-t border-gray-300 py-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">🗺️</span>

                <div>
                  <p className="text-sm font-bold text-gray-700">
                    State:
                  </p>

                  <p className="text-sm mt-1">
                    {profile?.state || 'N/A'}
                  </p>
                </div>
              </div>
            </div>


            {/* Pincode */}
            <div className="border-t border-gray-300 py-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>

                <div>
                  <p className="text-sm font-bold text-gray-700">
                    Pincode:
                  </p>

                  <p className="text-sm mt-1">
                    {profile?.pincode || 'N/A'}
                  </p>
                </div>
              </div>
            </div>


            {/* Register Crop Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-6 bg-[#003366] text-white font-bold border border-black px-5 py-3 rounded-none hover:bg-blue-800 flex items-center justify-center gap-2 cursor-pointer"
            >
              ➕ Register New Crop Entry
            </button>

          </aside>



          {/* =====================================================
              RIGHT MAIN CONTENT
              WEATHER + CROPS
              ===================================================== */}

          <section className="min-w-0">


            {/* =================================================
                WEATHER INFORMATION CARD
                ================================================= */}

            <div className="bg-white border border-blue-300 p-6 rounded-none mb-8">

              <div className="grid grid-cols-1 md:grid-cols-[1.4fr_repeat(5,1fr)] items-center">


                {/* ---------------------------------------------
                    WEATHER MAIN CONDITION

                    TODO:
                    Connect these values to your FastAPI
                    weather Python service later.
                    --------------------------------------------- */}

                <div className="flex items-center gap-5 pb-5 md:pb-0 md:pr-6">

                  {/* TODO: Replace emoji with weather icon
                      from your FastAPI weather response */}
                  <div className="text-6xl">
                    {weatherLoading ? '⌛' : '🌤️'}
                  </div>

                  <div>

                    {/* TODO: FASTAPI - Current Temperature */}
                    <div className="text-4xl font-bold">
                      {weather?.current_temp_c != null ? `${Math.round(weather.current_temp_c)}°C` : '--'}
                    </div>

                    {/* TODO: FASTAPI - Weather Condition */}
                    <div className="text-lg font-medium mt-1">
                      {weather?.condition || (weatherLoading ? 'Loading weather...' : 'Weather unavailable')}
                    </div>

                    {/* TODO: FASTAPI - Weather Location */}
                    <div className="text-sm text-gray-600 mt-3">
                      {profile?.location_address || `${profile?.district || ''}, ${profile?.state || ''}`}
                    </div>

                  </div>

                </div>



                {/* ---------------------------------------------
                    FEELS LIKE
                    TODO: Connect to FastAPI
                    --------------------------------------------- */}

                <div className="border-t md:border-t-0 md:border-l border-gray-300 px-5 py-4 text-center">

                  <div className="text-2xl">
                    🌡️
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Feels Like
                  </p>

                  {/* TODO: FASTAPI - Feels Like Temperature */}
                  <p className="font-bold text-lg">
                    {weather?.feels_like_c != null ? `${Math.round(weather.feels_like_c)}°C` : '--'}
                  </p>

                </div>



                {/* ---------------------------------------------
                    HUMIDITY
                    TODO: Connect to FastAPI
                    --------------------------------------------- */}

                <div className="border-t md:border-t-0 md:border-l border-gray-300 px-5 py-4 text-center">

                  <div className="text-2xl">
                    💧
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Humidity
                  </p>

                  {/* TODO: FASTAPI - Humidity */}
                  <p className="font-bold text-lg">
                    {weather ? `${Math.round(weather.humidity)}%` : '--'}
                  </p>

                </div>



                {/* ---------------------------------------------
                    WIND
                    TODO: Connect to FastAPI
                    --------------------------------------------- */}

                <div className="border-t md:border-t-0 md:border-l border-gray-300 px-5 py-4 text-center">

                  <div className="text-2xl">
                    💨
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Wind
                  </p>

                  {/* TODO: FASTAPI - Wind Speed */}
                  <p className="font-bold text-lg">
                    {weather ? `${Math.round(weather.max_wind_kph)} km/h` : '--'}
                  </p>

                </div>



                {/* ---------------------------------------------
                    CHANCE OF RAIN
                    TODO: Connect to FastAPI
                    --------------------------------------------- */}

                <div className="border-t md:border-t-0 md:border-l border-gray-300 px-5 py-4 text-center">

                  <div className="text-2xl">
                    🌧️
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Chance of Rain
                  </p>

                  {/* TODO: FASTAPI - Rain Probability */}
                  <p className="font-bold text-lg">
                    {weather ? `${Math.round(weather.chance_of_rain)}%` : '--'}
                  </p>

                </div>



                {/* ---------------------------------------------
                    LAST UPDATED
                    TODO: Connect to FastAPI
                    --------------------------------------------- */}

                <div className="border-t md:border-t-0 md:border-l border-gray-300 px-5 py-4 text-center">

                  <div className="text-2xl">
                    🔄
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Updated
                  </p>

                  {/* TODO: FASTAPI - Last Updated Time */}
                  <p className="font-bold text-lg">
                    {weather?.updated_at
                      ? new Date(weather.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--'}
                  </p>

                </div>

              </div>

              {weatherError && (
                <p className="mt-4 border-t border-blue-200 pt-3 text-sm font-medium text-red-700">
                  {weatherError}
                </p>
              )}

            </div>



            {/* =================================================
                CROP RECORDS SECTION
                ================================================= */}

            <h3 className="text-xl font-bold text-[#003366] border-b-2 border-black pb-2 flex justify-between items-center mb-6">

              <span>
                🌾 Recorded Farmer & Crop Information
              </span>

              <span className="text-xs bg-[#003366] text-white px-2.5 py-1 font-bold">
                {crops.length} Records Saved in Postgres
              </span>

            </h3>



            {loading ? (

              <div className="w-full border border-black p-8 text-center bg-white font-bold text-gray-600">
                ⌛ Syncing records with Supabase Postgres...
              </div>

            ) : crops.length === 0 ? (

              <div className="w-full border-2 border-dashed border-gray-400 p-10 text-center bg-white">

                <p className="text-gray-600 text-lg font-bold">
                  No crop entries recorded yet.
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Click "Register New Crop Entry" to submit crop & loan details.
                </p>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-[#003366] text-white font-bold border border-black px-5 py-2.5 rounded-none hover:bg-blue-800"
                >
                  + Add Crop Record
                </button>

              </div>

            ) : (

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {crops.map((crop, idx) => (

                  <div
                    key={crop.id || idx}
                    className="bg-white border-2 border-black p-6 rounded-none space-y-3 relative"
                  >

                    <div className="flex justify-between items-start border-b border-black pb-2">

                      <div>

                        <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                          CROP RECORD #{idx + 1}
                        </span>

                        <h4 className="text-xl font-bold text-black">
                          🌾 {crop.crop_name === 'Other'
                            ? crop.custom_crop_name
                            : crop.crop_name}
                        </h4>

                      </div>

                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-600 px-2.5 py-1 text-xs font-bold">
                        ✓ Saved to Supabase
                      </span>

                    </div>



                    <div className="grid grid-cols-2 gap-2 text-sm">

                      <div>
                        <span className="text-gray-500 font-medium">
                          Land Size:
                        </span>

                        <p className="font-bold">
                          {crop.land_size} {crop.land_unit}
                        </p>
                      </div>


                      <div>
                        <span className="text-gray-500 font-medium">
                          Soil Type:
                        </span>

                        <p className="font-bold">
                          {crop.soil_type} Soil
                        </p>
                      </div>


                      <div>
                        <span className="text-gray-500 font-medium">
                          Irrigation:
                        </span>

                        <p className="font-bold">
                          {crop.irrigation_type}
                        </p>
                      </div>


                      <div>
                        <span className="text-gray-500 font-medium">
                          Sowing Date:
                        </span>

                        <p className="font-bold">
                          {crop.sowing_date}
                        </p>
                      </div>


                      <div>
                        <span className="text-gray-500 font-medium">
                          Expected Harvest:
                        </span>

                        <p className="font-bold">
                          {crop.expected_harvest_date}
                        </p>
                      </div>


                      <div>
                        <span className="text-gray-500 font-medium">
                          Loan Due Date:
                        </span>

                        <p className="font-bold">
                          {crop.loan_due_date || 'N/A'}
                        </p>
                      </div>

                    </div>



                    <div className="bg-slate-100 border border-black p-3 font-bold text-[#003366] flex justify-between items-center text-sm">

                      <span>
                        Approximate Loan Amount:
                      </span>

                      <span className="text-base text-emerald-800">
                        ₹{crop.loan_amount?.toLocaleString('en-IN') || 0}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </div>



      {/* =========================================================
          MODAL FOR ADDING A NEW CROP ENTRY
          ========================================================= */}

      {isModalOpen && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">

          <div className="bg-white border-2 border-black p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">

            <div className="flex justify-between items-center border-b border-black pb-3 mb-4">

              <h3 className="text-xl font-bold text-[#003366]">
                ➕ Add Farmer / Crop Entry
              </h3>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-white text-black font-bold border border-black px-3 py-1 hover:bg-gray-200"
              >
                ✕ Close
              </button>

            </div>



            <form
              onSubmit={handleAddCropEntry}
              className="space-y-6"
            >

              <CropSelector
                language="en"
                cropName={newCropName}
                customCropName={customCropName}
                onChange={(fields) => {
                  if (fields.crop_name !== undefined)
                    setNewCropName(fields.crop_name);

                  if (fields.custom_crop_name !== undefined)
                    setCustomCropName(fields.custom_crop_name);
                }}
              />



              <LandDetailsInput
                language="en"
                landSize={landSize}
                landUnit={landUnit}
                onChange={(fields) => {

                  if (fields.land_size !== undefined)
                    setLandSize(fields.land_size);

                  if (fields.land_unit !== undefined)
                    setLandUnit(fields.land_unit);

                }}
              />



              <AgriDetailsInput
                language="en"
                sowingDate={sowingDate}
                irrigationType={irrigationType}
                soilType={soilType}
                expectedHarvestDate={harvestDate}
                onChange={(fields) => {

                  if (fields.sowing_date !== undefined)
                    setSowingDate(fields.sowing_date);

                  if (fields.irrigation_type !== undefined)
                    setIrrigationType(fields.irrigation_type);

                  if (fields.soil_type !== undefined)
                    setSoilType(fields.soil_type);

                  if (fields.expected_harvest_date !== undefined)
                    setHarvestDate(fields.expected_harvest_date);

                }}
              />



              <FinancialDetailsInput
                language="en"
                loanAmount={loanAmount}
                loanDueDate={loanDueDate}
                onChange={(fields) => {

                  if (fields.loan_amount !== undefined)
                    setLoanAmount(fields.loan_amount);

                  if (fields.loan_due_date !== undefined)
                    setLoanDueDate(fields.loan_due_date);

                }}
              />



              <div className="flex gap-4 pt-4 border-t border-black">

                <button
                  type="submit"
                  className="flex-1 bg-[#003366] text-white font-bold border border-black p-3 rounded-none hover:bg-blue-800 cursor-pointer"
                >
                  Save Crop Entry to Supabase
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white text-black font-bold border border-black p-3 rounded-none hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}