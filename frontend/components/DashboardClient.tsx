"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchFarmerDashboardData,
  addNewCropToSupabase,
} from "../lib/supabase/client";
import { FarmerProfile, FarmerCropData } from "../lib/supabase/types";
import CropSelector from "./farmer/CropSelector";
import LandDetailsInput from "./farmer/LandDetailsInput";
import AgriDetailsInput from "./farmer/AgriDetailsInput";
import FinancialDetailsInput from "./farmer/FinancialDetailsInput";
import "../app/globals.css";
import {
  User,
  Plus,
  AlertTriangle,
  ChevronRight,
  Phone,
  Pin,
  Hourglass,
  CheckCheck,
  TrendingUp,
  CircleUserRound,
  Wheat
} from "lucide-react";
import LanguageSelector from "./auth/LanguageSelector";
import { useLanguage } from "../lib/context/LanguageContext";

export default function DashboardPage() {
  const { lang, setLang, t } = useLanguage();
  const fontSizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];
  const [fontSizeIndex, setFontSizeIndex] = useState(2);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [crops, setCrops] = useState<FarmerCropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Crop Entry State
  const [newCropName, setNewCropName] = useState("Wheat");
  const [customCropName, setCustomCropName] = useState("");
  const [landSize, setLandSize] = useState<number | "">(2);
  const [landUnit, setLandUnit] = useState<"Acre" | "Hectare" | "Bigha">(
    "Acre",
  );
  const [sowingDate, setSowingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [irrigationType, setIrrigationType] = useState<any>("Canal");
  const [soilType, setSoilType] = useState<any>("Black");
  const [harvestDate, setHarvestDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [loanAmount, setLoanAmount] = useState<number | "">(25000);
  const [outstandingLoanAmount, setOutstandingLoanAmount] = useState<number | "">(0);
  const [loanDueDate, setLoanDueDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  );

  useEffect(() => {
    async function loadDashboardData() {
      // Step 1 & 2: Load cached data if it exists
      const cachedProfile = localStorage.getItem(
        "krishi_bandhu_cached_profile",
      );
      const cachedCrops = localStorage.getItem("krishi_bandhu_cached_crops");

      let hasCache = false;
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        hasCache = true;
      }
      if (cachedCrops) {
        setCrops(JSON.parse(cachedCrops));
        hasCache = true;
      }

      // If we don't have cache, show loading spinner
      if (!hasCache) setLoading(true);

      // Step 3: Fetch fresh data in the background
      const data = await fetchFarmerDashboardData();

      // Step 4: Update state and save to cache
      if (data.profile) {
        setProfile(data.profile);
        localStorage.setItem(
          "krishi_bandhu_cached_profile",
          JSON.stringify(data.profile),
        );
      }
      if (data.crops) {
        setCrops(data.crops);
        localStorage.setItem(
          "krishi_bandhu_cached_crops",
          JSON.stringify(data.crops),
        );
      }

      setLoading(false);
    }
    loadDashboardData();
  }, []);

  const handleAddCropEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Step 1: Create a temporary pending crop object
    const tempId = `temp_${Date.now()}`;
    const pendingCrop: FarmerCropData = {
      id: tempId,
      crop_name: newCropName,
      custom_crop_name: customCropName,
      land_size: Number(landSize) || 0,
      land_unit: landUnit,
      sowing_date: sowingDate,
      irrigation_type: irrigationType,
      soil_type: soilType,
      expected_harvest_date: harvestDate,
      loan_amount: Number(loanAmount) || 0,
      outstanding_loan_amount: Number(outstandingLoanAmount) || 0,
      loan_due_date: loanDueDate,
      sync_status: "pending",
    };

    // Step 2 & 3: Optimistic UI Update
    const optimisticCrops = [pendingCrop, ...crops];
    setCrops(optimisticCrops);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "krishi_bandhu_cached_crops",
        JSON.stringify(optimisticCrops),
      );
    }

    // Close modal immediately so user doesn't wait
    setIsModalOpen(false);
    setSubmitting(false);

    // Step 4: Try to sync with Supabase in the background
    try {
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
        outstanding_loan_amount: Number(outstandingLoanAmount) || 0,
        loan_due_date: loanDueDate,
      });

      // Step 5: On success, replace the temp crop with the real one
      if (res.crop) {
        setCrops((currentCrops) => {
          const syncedCrops = currentCrops.map((c) =>
            c.id === tempId
              ? { ...(res.crop as any), sync_status: "synced" as const }
              : c,
          );
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "krishi_bandhu_cached_crops",
              JSON.stringify(syncedCrops),
            );
          }
          return syncedCrops;
        });
      }
    } catch (error) {
      // Step 6: On failure (e.g. offline), it simply stays as 'pending' in state/cache
      console.error(
        "Offline or sync failed, crop remains pending in cache",
        error,
      );
    }
  };

  return (
    <main
      className={`min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black ${fontSizes[fontSizeIndex]}`}
    >
      {/* Navbar */}
      <nav className="w-full bg-[#058b2d] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline"
          >
            SEAL
          </Link>
          <h1 className="m-0 text-xl font-bold tracking-tight">
            {t("dashboardTitle")}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSelector
            showCardLayout={false}
          />
          <div className="flex">
            <button
              type="button"
              onClick={() => setFontSizeIndex(prev => Math.min(prev + 1, fontSizes.length - 1))}
              className="bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSizeIndex(prev => Math.max(prev - 1, 0))}
              className="bg-white text-black border border-black border-l-0 px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200"
            >
              A-
            </button>
          </div>

          <Link
            href="/signup"
            className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer outline-none hover:bg-gray-200 no-underline text-sm rounded-sm"
          >
            <u>{t("addEntryHeader")}</u>
          </Link>

          <button
            onClick={() => (window.location.href = "/")}
            className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-sm outline-none hover:bg-gray-200 text-sm"
          >
            <u>{t("logOutBtn")}</u>
          </button>
        </div>
      </nav>

      <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Farmer Header Card */}
        <div className="bg-white border-2 border-black p-6 rounded-none flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="bg-[#058b2d] text-white text-xs font-bold px-2.5 py-1 flex items-center w-max">
              <CheckCheck className="w-5 h-5 text-white mr-2" />
              {t("registeredFarmerLabel")}
            </span>
            <h2 className="text-2xl font-bold text-black mt-2 flex items-center gap-2">
              <CircleUserRound className="w-5 h-5 text-gray-700" />
              {profile?.full_name ||
                (loading ? t("loadingProfile") : t("registeredFarmerLabel"))}
            </h2>
            <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
              <Phone className="w-4.5 h-4.5 mr-1.5" />
              <strong>{t("mobileLabel")}:</strong>{" "}
              {profile?.mobile_number || "N/A"}{" "}
              <strong className="flex items-center">
                {" "}
                <Pin className="w-4.5 h-4.5 mx-1.5" /> {t("locationLabel")}:
              </strong>{" "}
              {profile?.location_address ||
                (profile?.district
                  ? `${profile.district}, ${profile.state}`
                  : "N/A")}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#058b2d] text-white font-bold border border-black px-5 py-3 rounded-none hover:bg-[#026a21] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            {t("registerNewCrop")}
          </button>
        </div>

        {/* Distress Score Banner */}
        <div className="w-full bg-[#FFD700] border-2 border-black p-4 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-[#FACC15] transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-black shrink-0" />
            <div>
              <h3 className="font-bold text-black text-lg m-0 uppercase tracking-wide">
                {t("distressScoreTitle")}
              </h3>
              <p className="text-sm font-medium text-black/80 m-0">
                {t("distressScoreDesc")}
              </p>
            </div>
          </div>
          <Link
            href="/distress-score"
            className="bg-black text-white font-bold px-6 py-2 border border-black uppercase text-sm tracking-wider no-underline"
          >
            {t("calculateScoreBtn")}
          </Link>
        </div>

        {/* Market Prices Banner */}
        <div className="w-full bg-[#e6f4ea] border-2 border-[#058b2d] p-4 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-[#058b2d]" />
            <div>
              <h3 className="font-bold text-[#058b2d] text-lg m-0 uppercase tracking-wide">
                {t("liveMandiTitle")}
              </h3>
              <p className="text-sm font-medium text-black/80 m-0">
                {t("mandiDesc")}
              </p>
            </div>
          </div>
          <Link
            href="/market"
            className="bg-[#058b2d] text-white font-bold px-6 py-2 border border-[#058b2d] uppercase text-sm tracking-wider no-underline"
          >
            {t("checkPricesBtn")}
          </Link>
        </div>

        {/* Crop Records Section */}
        <h3 className="text-xl font-bold text-[#003366] border-b-2 border-black pb-2 flex justify-between items-center">
          <span>{t("recordedInfo")}</span>
          {/* <span className="text-xs bg-[#058b2d] text-white px-2.5 py-1 font-bold">
            {crops.length} {t("recordsSaved")}
          </span> */}
        </h3>

        {loading ? (
          <div className="w-full border border-black p-8 text-center bg-white font-bold text-gray-600 flex items-center justify-center gap-2">
            <Hourglass className="w-5 h-5" /> {t("syncing")}
          </div>
        ) : crops.length === 0 ? (
          <div className="w-full border-2 border-dashed border-gray-400 p-10 text-center bg-white">
            <p className="text-gray-600 text-lg font-bold">{t("noEntries")}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t("clickRegisterMsg")}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-[#058b2d] text-white font-bold border border-black px-5 py-2.5 rounded-xl hover:bg-blue-800"
            >
              {t("registerNewCrop")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crops.map((crop, idx) => (
              <div
                key={crop.id || idx}
                className="bg-white border-2 border-black p-6 rounded-xl space-y-3 relative"
              >
                <div className="flex justify-between items-start border-b border-black pb-2">
                  <div>
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                      {t("cropRecordNum")} #{idx + 1}
                    </span>
                    <h4 className="text-xl font-bold text-black flex items-center gap-2">
                      <Wheat className="w-5 h-5 text-amber-600" />
                      {crop.crop_name === "Other"
                        ? crop.custom_crop_name
                        : crop.crop_name}
                    </h4>
                  </div>
                  {crop.sync_status === "pending" ? (
                    <span className="bg-gray-200 text-gray-700 border border-gray-500 px-2.5 py-1 text-xs font-bold animate-pulse">
                      {t("syncingCropStatus")}
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-600 px-2.5 py-1 text-xs font-bold">
                      ✓ {t("savedToSupabase")}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">
                      {t("landSizeLabel")}:
                    </span>
                    <p className="font-bold">
                      {crop.land_size} {crop.land_unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">
                      {t("soilTypeDisp")}:
                    </span>
                    <p className="font-bold">{crop.soil_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">
                      {t("irrigationDisp")}:
                    </span>
                    <p className="font-bold">{crop.irrigation_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">
                      {t("sowingDateDisp")}:
                    </span>
                    <p className="font-bold">{crop.sowing_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">
                      {t("expectedHarvestDisp")}:
                    </span>
                    <p className="font-bold">{crop.expected_harvest_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">
                      {t("loanDueDateDisp")}:
                    </span>
                    <p className="font-bold">{crop.loan_due_date || "N/A"}</p>
                  </div>
                </div>

                <div className="bg-slate-100 border border-black p-3 font-bold text-[#003366] flex justify-between items-center text-sm">
                  <span>{t("approxLoanAmt")}:</span>
                  <span className="text-base text-emerald-800">
                    ₹{crop.loan_amount?.toLocaleString("en-IN") || 0}
                  </span>
                </div>

                <Link
                  href={`/chat/${crop.id || crop.crop_name || idx}`}
                  className="mt-4 block w-full bg-[#058b2d] text-white font-bold border border-black px-4 py-3 rounded-xl hover:bg-blue-800 text-center flex items-center justify-center gap-2"
                >
                  💬 {t("consultAI")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for adding a new crop entry */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border-2 border-black p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
            <div className="flex justify-between items-center border-b border-black pb-3 mb-4">
              <h3 className="text-xl flex items-center font-bold text-[#003366]">
                <Plus className="w-5 h-5 mr-2" />
                {t("addEntryHeader")}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black font-bold"
              >
                ✕ {t("cancel")}
              </button>
            </div>

            <form onSubmit={handleAddCropEntry} className="space-y-6">
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
                outstandingLoanAmount={outstandingLoanAmount}
                loanDueDate={loanDueDate}
                onChange={(fields) => {
                  if (fields.loan_amount !== undefined)
                    setLoanAmount(fields.loan_amount);
                  if (fields.outstanding_loan_amount !== undefined)
                    setOutstandingLoanAmount(fields.outstanding_loan_amount);
                  if (fields.loan_due_date !== undefined)
                    setLoanDueDate(fields.loan_due_date);
                }}
              />

              <div className="flex justify-end gap-3 mt-8 border-t border-black pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 font-bold border border-black bg-slate-200 hover:bg-slate-300 rounded-none cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 font-bold border border-black bg-[#058b2d] text-white hover:bg-blue-800 rounded-none cursor-pointer flex items-center gap-2"
                >
                  {submitting ? "..." : t("submitEntry")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
