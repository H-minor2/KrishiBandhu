'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchFarmerDashboardData, logoutFarmer, addNewCropToSupabase } from '../../lib/supabase/client';
import { FarmerProfile, FarmerCropData } from '../../lib/supabase/types';
import WeatherCard from '../../components/farmer/WeatherCard';
import CropSelector from '../../components/farmer/CropSelector';
import LandDetailsInput from '../../components/farmer/LandDetailsInput';
import AgriDetailsInput from '../../components/farmer/AgriDetailsInput';
import FinancialDetailsInput from '../../components/farmer/FinancialDetailsInput';
import '../globals.css';

export default function DashboardPage() {
  const [fontSize, setFontSize] = useState('text-base');
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [crops, setCrops] = useState<FarmerCropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Crop Entry Form State
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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFarmerDashboardData();

      if (!res.authenticated) {
        window.location.href = '/login';
        return;
      }

      if (res.error) {
        console.error('Failed to load farmer dashboard data:', res.error);
        setError(res.error);
      } else {
        setProfile(res.profile);
        setCrops(res.crops);
      }
    } catch (err: any) {
      console.error('Unexpected error loading farmer dashboard:', err);
      setError("We couldn't load your farm information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const primaryCrop = crops.length > 0 ? crops[0] : null;

  return (
    <main className={`min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black ${fontSize}`}>

      {/* Navbar */}
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline">
            SEAL
          </Link>
          <h1 className="m-0 text-xl font-bold tracking-tight">Krishi Bandhu Dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex">
            <button type="button" onClick={() => setFontSize('text-lg')} className="bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200">A+</button>
            <button type="button" onClick={() => setFontSize('text-sm')} className="bg-white text-black border border-black border-l-0 px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200">A-</button>
          </div>

          <Link href="/signup" className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200 no-underline text-sm">
            ➕ Register New Farmer Profile
          </Link>

          <button onClick={() => logoutFarmer()} className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200 text-sm">
            🚪 Log Out
          </button>
        </div>
      </nav>

      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6">

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="w-full border-2 border-black p-8 bg-white text-center space-y-4 animate-pulse">
            <div className="h-8 bg-slate-200 w-1/3 mx-auto"></div>
            <p className="text-gray-600 font-bold">Loading your farm information...</p>
            <div className="h-24 bg-slate-100 w-full"></div>
          </div>
        ) : error ? (
          /* Error State UI */
          <div className="w-full border-2 border-red-600 bg-red-50 p-8 text-center space-y-4">
            <h3 className="text-xl font-bold text-red-800">We couldn't load your farm information.</h3>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadData}
              className="bg-[#003366] text-white font-bold border border-black px-6 py-2.5 rounded-none hover:bg-blue-800 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* Main Dashboard UI */
          <>
            {/* Greeting Header */}
            <div className="bg-white border-2 border-black p-6 rounded-none flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold text-black">
                  Good morning, {profile?.full_name || 'Farmer'} 👋
                </h2>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <p>📱 <strong>Phone:</strong> {profile?.mobile_number || 'N/A'}</p>
                  <p>📍 <strong>Location:</strong> {profile?.district ? `${profile.district}, ${profile.state}` : (profile?.location_address || 'N/A')}</p>
                  <p>🌐 <strong>Language:</strong> {profile?.preferred_language?.toUpperCase() || 'EN'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#003366] text-[#ffffff] font-bold border border-black px-4 py-2.5 rounded-none hover:bg-blue-800 flex items-center gap-2 cursor-pointer text-sm"
              >
                ➕ Add Crop Entry
              </button>
            </div>

            {/* Live Weather Card */}
            <WeatherCard profile={profile} />

            {/* Farm Summary Card */}
            {primaryCrop ? (
              <div className="bg-white border-2 border-black p-6 rounded-none space-y-6">
                <div className="border-b-2 border-black pb-3">
                  <h3 className="text-2xl font-bold text-[#003366]">Your Farm</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 border border-black">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</span>
                    <p className="text-lg font-bold text-black mt-1">📍 {profile?.district || profile?.state || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Crop</span>
                    <p className="text-lg font-bold text-black mt-1">🌾 {primaryCrop.crop_name === 'Other' ? primaryCrop.custom_crop_name : primaryCrop.crop_name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Land Size</span>
                    <p className="text-lg font-bold text-black mt-1">🌱 {primaryCrop.land_size} {primaryCrop.land_unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="border border-gray-300 p-3 bg-white">
                    <span className="text-gray-500 font-bold block text-xs">Sowing Date</span>
                    <p className="font-bold text-base mt-1">{primaryCrop.sowing_date || 'N/A'}</p>
                  </div>

                  <div className="border border-gray-300 p-3 bg-white">
                    <span className="text-gray-500 font-bold block text-xs">Expected Harvest</span>
                    <p className="font-bold text-base mt-1">{primaryCrop.expected_harvest_date || 'N/A'}</p>
                  </div>

                  <div className="border border-gray-300 p-3 bg-white">
                    <span className="text-gray-500 font-bold block text-xs">Irrigation</span>
                    <p className="font-bold text-base mt-1">{primaryCrop.irrigation_type || 'N/A'}</p>
                  </div>

                  <div className="border border-gray-300 p-3 bg-white">
                    <span className="text-gray-500 font-bold block text-xs">Soil</span>
                    <p className="font-bold text-base mt-1">{primaryCrop.soil_type || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-black p-4 bg-emerald-50">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Loan Amount</span>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">₹{primaryCrop.loan_amount?.toLocaleString('en-IN') || 0}</p>
                  </div>

                  <div className="border border-black p-4 bg-amber-50">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Loan Due Date</span>
                    <p className="text-xl font-bold text-amber-900 mt-1">{primaryCrop.loan_due_date || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-400 p-8 text-center space-y-3">
                <p className="text-lg font-bold text-gray-700">No crop details recorded yet for this profile.</p>
                <p className="text-sm text-gray-500">Click "Add Crop Entry" to record your crop and land details.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#003366] text-white font-bold border border-black px-5 py-2.5 rounded-none hover:bg-blue-800 cursor-pointer"
                >
                  + Add Crop Record
                </button>
              </div>
            )}

            {/* List All Saved Crop Entries if Multiple */}
            {crops.length > 1 && (
              <div className="space-y-4 pt-4">
                <h4 className="text-lg font-bold text-[#003366] border-b border-black pb-2">
                  All Saved Crop Records ({crops.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crops.map((c, idx) => (
                    <div key={c.id || idx} className="bg-white border border-black p-4 text-sm space-y-2">
                      <div className="flex justify-between items-center font-bold border-b pb-1">
                        <span>🌾 {c.crop_name === 'Other' ? c.custom_crop_name : c.crop_name}</span>
                        <span className="text-xs bg-slate-200 px-2 py-0.5">{c.land_size} {c.land_unit}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
                        <p><strong>Sowing:</strong> {c.sowing_date}</p>
                        <p><strong>Harvest:</strong> {c.expected_harvest_date}</p>
                        <p><strong>Irrigation:</strong> {c.irrigation_type}</p>
                        <p><strong>Soil:</strong> {c.soil_type}</p>
                        <p><strong>Loan:</strong> ₹{c.loan_amount || 0}</p>
                        <p><strong>Due:</strong> {c.loan_due_date || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for adding a new crop entry */}
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

            <form onSubmit={handleAddCropEntry} className="space-y-6">
              <CropSelector
                language="en"
                cropName={newCropName}
                customCropName={customCropName}
                onChange={(fields) => {
                  if (fields.crop_name !== undefined) setNewCropName(fields.crop_name);
                  if (fields.custom_crop_name !== undefined) setCustomCropName(fields.custom_crop_name);
                }}
              />

              <LandDetailsInput
                language="en"
                landSize={landSize}
                landUnit={landUnit}
                onChange={(fields) => {
                  if (fields.land_size !== undefined) setLandSize(fields.land_size);
                  if (fields.land_unit !== undefined) setLandUnit(fields.land_unit);
                }}
              />

              <AgriDetailsInput
                language="en"
                sowingDate={sowingDate}
                irrigationType={irrigationType}
                soilType={soilType}
                expectedHarvestDate={harvestDate}
                onChange={(fields) => {
                  if (fields.sowing_date !== undefined) setSowingDate(fields.sowing_date);
                  if (fields.irrigation_type !== undefined) setIrrigationType(fields.irrigation_type);
                  if (fields.soil_type !== undefined) setSoilType(fields.soil_type);
                  if (fields.expected_harvest_date !== undefined) setHarvestDate(fields.expected_harvest_date);
                }}
              />

              <FinancialDetailsInput
                language="en"
                loanAmount={loanAmount}
                loanDueDate={loanDueDate}
                onChange={(fields) => {
                  if (fields.loan_amount !== undefined) setLoanAmount(fields.loan_amount);
                  if (fields.loan_due_date !== undefined) setLoanDueDate(fields.loan_due_date);
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

