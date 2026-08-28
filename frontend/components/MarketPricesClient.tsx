"use client";

import React, { useState, useEffect } from "react";
import { LineChart, AlertTriangle, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import { FarmerProfile, FarmerCropData } from "../lib/supabase/types";
import { useLanguage } from "../lib/context/LanguageContext";

interface MarketRecord {
  arrival_date: string;
  state: string;
  market: string;
  commodity: string;
  variety: string;
  arrivals_mt: number;
  minimum_price: number;
  maximum_price: number;
  modal_price: number;
}

export default function MarketPricesClient() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [crops, setCrops] = useState<FarmerCropData[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [records, setRecords] = useState<MarketRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedProfile = localStorage.getItem("krishi_bandhu_cached_profile");
    const cachedCrops = localStorage.getItem("krishi_bandhu_cached_crops");

    if (cachedProfile) setProfile(JSON.parse(cachedProfile));
    
    if (cachedCrops) {
      const parsedCrops = JSON.parse(cachedCrops);
      setCrops(parsedCrops);
      if (parsedCrops.length > 0) {
        setSelectedCropId(parsedCrops[0].id || parsedCrops[0].crop_name);
      }
    }
    
    setLoading(false);
  }, []);

  const handleFetchPrices = async () => {
    if (!profile || !selectedCropId) return;
    
    const selectedCrop = crops.find(c => c.id === selectedCropId || c.crop_name === selectedCropId);
    if (!selectedCrop) return;

    setFetching(true);
    setError(null);

    try {
      const res = await fetch(`/api/market?state=${encodeURIComponent(profile.state)}&commodity=${encodeURIComponent(selectedCrop.crop_name)}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch market prices.");
      }

      const data = await res.json();
      setRecords(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-12 h-12 animate-spin text-[#003366]" />
      </div>
    );
  }

  if (!profile || crops.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white border-2 border-black text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-2">{t("marketNoProfile") || "No Profile Found"}</h2>
        <p className="text-gray-600 font-medium">{t("marketReturnDash") || "Please return to the Dashboard to add your crop and profile details first."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      {/* Header */}
      <div className="bg-[#e6f4ea] border-2 border-[#058b2d] p-6 mb-6 shadow-[4px_4px_0px_0px_rgba(5,139,45,1)]">
        <h2 className="text-2xl font-black text-[#058b2d] uppercase tracking-wider flex items-center gap-3">
          <LineChart className="w-8 h-8" />
          {t("marketPageTitle") || "Live Mandi Prices"}
        </h2>
        <p className="text-[#058b2d] font-bold mt-2">
          {t("marketPageDesc") || "Compare live agricultural market prices across your state to find the most profitable Mandi for your crop."}
        </p>
      </div>

      <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
        <div className="mb-6">
          <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
            {t("marketSelectCrop") || "Select Crop to Check Prices"}
          </label>
          <select
            value={selectedCropId}
            onChange={(e) => setSelectedCropId(e.target.value)}
            className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#058b2d] rounded-none appearance-none"
          >
            {crops.map((c, i) => (
              <option key={c.id || i} value={c.id || c.crop_name}>
                {c.custom_crop_name || t(c.crop_name) || c.crop_name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 border-2 border-red-700 font-bold p-4 mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleFetchPrices}
          disabled={fetching}
          className="w-full bg-black text-white font-black text-lg py-4 border-2 border-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
        >
          {fetching ? <Loader2 className="w-6 h-6 animate-spin" /> : <TrendingUp className="w-6 h-6" />}
          {fetching ? (t("marketChecking") || "Fetching Live Mandi Prices...") : (t("marketCheckBtn") || "Check Mandi Prices")}
        </button>
      </div>

      {records && (
        <div className="bg-white border-2 border-black p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-[#058b2d] text-white p-4 border-b-2 border-black">
            <h3 className="text-xl font-black uppercase tracking-widest">
              {t("marketBestPrice") || "Highest Paying Mandis in"} {profile.state}
            </h3>
          </div>
          
          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-4 border-b-2 border-black font-black uppercase tracking-wider text-sm">{t("marketMandiName") || "Mandi Name"}</th>
                    <th className="p-4 border-b-2 border-black font-black uppercase tracking-wider text-sm">{t("marketArrivalDate") || "Date"}</th>
                    <th className="p-4 border-b-2 border-black font-black uppercase tracking-wider text-sm text-right">{t("marketModalPrice") || "Price (₹/Quintal)"}</th>
                    <th className="p-4 border-b-2 border-black font-black uppercase tracking-wider text-sm text-right hidden sm:table-cell">{t("marketMinMax") || "Min - Max (₹)"}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className={`hover:bg-green-50 transition-colors ${i === 0 ? 'bg-green-100' : 'border-b border-gray-200'}`}>
                      <td className="p-4 font-bold text-[#003366] flex items-center gap-2">
                        {i === 0 && <TrendingUp className="w-5 h-5 text-green-600" />}
                        {r.market}
                      </td>
                      <td className="p-4 text-gray-600 font-medium whitespace-nowrap">{r.arrival_date}</td>
                      <td className="p-4 font-black text-lg text-right text-[#058b2d]">₹{r.modal_price}</td>
                      <td className="p-4 text-sm font-bold text-gray-500 text-right hidden sm:table-cell">
                        {r.minimum_price} - {r.maximum_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 font-bold">
              No recent Mandi data found for this crop in {profile.state}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
