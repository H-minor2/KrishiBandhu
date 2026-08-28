"use client";

import React, { useState } from "react";
import { CROP_OPTIONS, filterCrops } from "../../lib/constants/crops";
import { getTranslation } from "../../lib/constants/languages";
import { Wheat, Bean, Carrot, MapPin, Sprout } from "lucide-react";

interface CropSelectorProps {
  language: string;
  cropName: string;
  customCropName: string;
  onChange: (
    fields: Partial<{ crop_name: string; custom_crop_name: string }>,
  ) => void;
}

export default function CropSelector({
  language,
  cropName,
  customCropName,
  onChange,
}: CropSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const t = (key: string) => getTranslation(language, key);

  const filteredCrops = filterCrops(searchQuery);

  const getCropDisplay = (crop: string) => {
    const iconClass = "w-5 h-5 text-gray-700";
    switch (crop) {
      case "Rice":
        return { icon: <Wheat className={iconClass} />, label: "Rice (चावल / நெல் / ధాన్యం)" };
      case "Wheat":
        return { icon: <Wheat className={iconClass} />, label: "Wheat (गेहूं / கோதுமை / గోధుమ)" };
      case "Maize":
        return { icon: <Sprout className={iconClass} />, label: "Maize (मक्का / சோளம் / మొక్కజొన్న)" };
      case "Cotton":
        return { icon: <Sprout className={iconClass} />, label: "Cotton (कपास / பருத்தி / పత్తి)" };
      case "Pulses":
        return {
          icon: <Bean className={iconClass} />,
          label: "Pulses (दालें / பருப்பு / పప్పుధాన్యాలు)",
        };
      case "Vegetables":
        return { icon: <Carrot className={iconClass} />, label: "Vegetables (सब्जियां / காய்கறிகள்)" };
      default:
        return { icon: <MapPin className={iconClass} />, label: "Other (অন্যান্য / अन्य / ఇతర)" };
    }
  };

  return (
    <div className="bg-white border border-black p-5 rounded-none space-y-4">
      <h3 className="text-lg font-bold text-[#003366] border-b border-black pb-2 flex items-center gap-2">
        <Wheat className="w-5 h-5 text-[#003366]" />
        {t("cropLabel")} Information
      </h3>

      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="crop-search-input"
          className="font-bold text-black text-sm"
        >
          {t("cropLabel")} *
        </label>

        {/* Real-time Search Filter Bar */}
        <input
          id="crop-search-input"
          type="text"
          placeholder="🔍 Type to search crops (e.g. Rice, Wheat, Cotton)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-black p-3 rounded-none text-black bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366] text-sm"
        />

        {/* Interactive Clickable Crop Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 border border-black bg-slate-50">
          {filteredCrops.map((crop) => {
            const isSelected = cropName === crop;
            const display = getCropDisplay(crop);
            return (
              <button
                key={crop}
                type="button"
                onClick={() => onChange({ crop_name: crop })}
                className={`p-3 border text-sm font-bold text-left flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#058b2d] text-white border-black ring-2 ring-yellow-300 shadow-md"
                    : "bg-white text-black border-black hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{display.icon}</span>
                  <span className="text-xs md:text-sm">{display.label}</span>
                </div>
                {isSelected && (
                  <span className="text-yellow-300 text-base">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Standard Select Dropdown Sync for Full Accessibility */}
        <select
          id="crop-select-dropdown"
          value={cropName}
          onChange={(e) => onChange({ crop_name: e.target.value })}
          required
          className="w-full border border-black p-2.5 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] cursor-pointer text-sm font-semibold"
        >
          <option value="">-- Select Crop from List --</option>
          {CROP_OPTIONS.map((crop) => (
            <option key={crop} value={crop}>
              {getCropDisplay(crop).icon} {crop}
            </option>
          ))}
        </select>
      </div>

      {cropName === "Other" && (
        <div className="flex flex-col gap-1.5 bg-yellow-50 p-4 border border-yellow-400">
          <label
            htmlFor="custom-crop-input"
            className="font-bold text-black text-sm"
          >
            {t("customCropLabel")} *
          </label>
          <input
            id="custom-crop-input"
            type="text"
            placeholder="e.g. Sugarcane, Mustard, Jute, Turmeric, Spices..."
            value={customCropName}
            onChange={(e) => onChange({ custom_crop_name: e.target.value })}
            required
            className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>
      )}
    </div>
  );
}
