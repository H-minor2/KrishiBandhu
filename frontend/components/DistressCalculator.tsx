"use client";

import React, { useState, useEffect } from "react";
import { Calculator, AlertTriangle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { FarmerProfile, FarmerCropData } from "../lib/supabase/types";
import { useLanguage } from "../lib/context/LanguageContext";

// Types matching the Python backend response
interface ComponentScore {
  score: number;
  weight: number;
  contribution: number;
  explanation: string;
  data_quality: string;
}

interface DistressResponse {
  farmer_id: string;
  distress_score: number;
  risk_level: string;
  components: Record<string, ComponentScore>;
  reasons: string[];
}

export default function DistressCalculator() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [crops, setCrops] = useState<FarmerCropData[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<DistressResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    // Load from cache since dashboard stores it there
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

  const handleCalculate = async () => {
    if (!profile || !selectedCropId) return;
    
    const selectedCrop = crops.find(c => c.id === selectedCropId || c.crop_name === selectedCropId);
    if (!selectedCrop) return;

    setCalculating(true);
    setError(null);

    // Build the payload mapping our frontend types to the backend DistressRequest schema
    const payload = {
      farmer_id: profile.id || "F001",
      annual_income: profile.annual_income || 60000,
      location: {
        state: profile.state,
        district: profile.district,
        latitude: profile.latitude || 20.2961, // default fallbacks if missing
        longitude: profile.longitude || 85.8245
      },
      crop: {
        name: selectedCrop.crop_name.toLowerCase(),
        area_acres: selectedCrop.land_size
      },
      market: {
        name: profile.district // Use district as market fallback
      },
      loans: [
        {
          loan_id: selectedCrop.id || "L001",
          amount: selectedCrop.loan_amount || 0,
          outstanding_amount: selectedCrop.outstanding_loan_amount ?? (selectedCrop.loan_amount || 0),
          due_date: selectedCrop.loan_due_date || new Date().toISOString().split('T')[0],
          status: "active"
        }
      ]
    };

    try {
      const res = await fetch("/api/distress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch distress score from backend.");
      }

      const data = await res.json();
      setResult(data);

      if (data.risk_level === "HIGH" || data.risk_level === "CRITICAL") {
        fetch("/api/alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ farmer: profile, distressData: data }),
        }).catch(err => console.error("Alert failed to send", err));
        setAlertSent(true);
      } else {
        setAlertSent(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setCalculating(false);
    }
  };

  const getScoreColor = (level: string) => {
    switch(level?.toUpperCase()) {
      case "LOW": return "text-emerald-700 bg-emerald-100 border-emerald-700";
      case "MEDIUM": return "text-amber-700 bg-amber-100 border-amber-700";
      case "HIGH": return "text-red-700 bg-red-100 border-red-700";
      default: return "text-gray-700 bg-gray-100 border-gray-700";
    }
  };

  const getTranslatedRisk = (level: string) => {
    switch(level?.toUpperCase()) {
      case "LOW": return t("riskLow") || "LOW";
      case "MEDIUM": return t("riskMedium") || "MEDIUM";
      case "HIGH": return t("riskHigh") || "HIGH";
      default: return level;
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
        <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-2">{t("distressNoProfile") || "No Profile Found"}</h2>
        <p className="text-gray-600 font-medium">{t("distressReturnDash") || "Please return to the Dashboard to add your crop and profile details first."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      {/* Header */}
      <div className="bg-[#FFD700] border-2 border-black p-6 mb-6">
        <h2 className="text-2xl font-black text-black uppercase tracking-wider flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          {t("distressEngineTitle") || "Farmer Distress Engine"}
        </h2>
        <p className="text-black font-medium mt-2">
          {t("distressEngineDesc") || "This tool analyzes real-time weather (Open-Meteo), market prices (AGMARKNET), and your financial history to predict agricultural distress risk."}
        </p>
      </div>

      {alertSent && (
        <div className="bg-red-100 border-2 border-red-700 text-red-800 p-4 mb-6 font-bold flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(185,28,28,1)]">
          <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
          <p>{t("alertDispatchedBanner") || "Critical Risk Detected. An emergency alert with your profile and location has been dispatched to the local agricultural officer."}</p>
        </div>
      )}

      {result ? (
        <div className="bg-white border-2 border-black p-6 md:p-8 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-600 uppercase tracking-widest mb-4">
            {t("distressResultTitle") || "Distress Assessment Result"}
          </h3>
          
          <div className={`text-6xl font-black p-8 border-4 inline-block mb-2 ${getScoreColor(result.risk_level)}`}>
            {Math.round(result.distress_score)}/100
          </div>
          <p className={`text-2xl font-black uppercase tracking-wider mb-8 ${getScoreColor(result.risk_level).split(" ")[0]}`}>
            {getTranslatedRisk(result.risk_level)} {t("distressRisk") || "RISK"}
          </p>

          <div className="w-full text-left bg-slate-50 border-2 border-black p-5">
            <h4 className="font-bold uppercase border-b-2 border-black pb-2 mb-4">{t("distressKeyFactors") || "Key Risk Factors Identified"}</h4>
            <ul className="space-y-3">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-3 font-semibold text-gray-800">
                  <ArrowRight className="w-5 h-5 shrink-0 mt-0.5 text-black" />
                  <span>{r}</span>
                </li>
              ))}
              {result.reasons.length === 0 && (
                <li className="flex items-center gap-2 font-bold text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" /> {t("distressNoRisk") || "No immediate risk factors detected."}
                </li>
              )}
            </ul>
          </div>

          <button
            onClick={() => setResult(null)}
            className="mt-8 bg-black text-white font-bold px-8 py-3 border-2 border-black uppercase hover:bg-gray-800 transition-colors w-full md:w-auto"
          >
            {t("distressCalcAnother") || "Calculate Another Crop"}
          </button>
        </div>
      ) : (
        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-6">
            <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
              {t("distressSelectCrop") || "Select Crop to Analyze"}
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366] rounded-none appearance-none"
            >
              {crops.map((c, i) => (
                <option key={c.id || i} value={c.id || c.crop_name}>
                  {c.custom_crop_name || t(c.crop_name) || c.crop_name} ({c.land_size} {t(c.land_unit.toLowerCase()) || c.land_unit})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border-2 border-[#003366] p-4 mb-8">
            <h4 className="font-bold text-[#003366] mb-2 uppercase text-sm">{t("distressDataSummary") || "Data Summary (Auto-Filled)"}</h4>
            <ul className="text-sm space-y-1 font-medium text-gray-700">
              <li>• {t("annualIncome") || "Estimated Annual Income (₹)"}: ₹{profile.annual_income || 60000}</li>
              <li>• {t("distressLocation") || "Location"}: {profile.district}, {profile.state}</li>
              <li>• {t("distressLoanAmt") || "Loan Amount"}: ₹{crops.find(c => c.id === selectedCropId || c.crop_name === selectedCropId)?.loan_amount || 0}</li>
              <li>• {t("outstandingLoanAmt") || "Outstanding Balance (₹)"}: ₹{crops.find(c => c.id === selectedCropId || c.crop_name === selectedCropId)?.outstanding_loan_amount ?? (crops.find(c => c.id === selectedCropId || c.crop_name === selectedCropId)?.loan_amount || 0)}</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 border-2 border-red-700 font-bold p-4 mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full bg-[#058b2d] text-white font-black text-lg py-4 border-2 border-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
          >
            {calculating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Calculator className="w-6 h-6" />}
            {calculating ? (t("distressAnalyzing") || "Analyzing Live Data...") : (t("distressCalcBtn") || "Calculate Distress Score")}
          </button>
        </div>
      )}
    </div>
  );
}
