"use client";

import React from "react";
import { SUPPORTED_LANGUAGES } from "../../lib/constants/languages";
import { useLanguage } from "../../lib/context/LanguageContext";

interface LanguageSelectorProps {
  showCardLayout?: boolean;
  onLanguageChange?: (lang: string) => void;
}

export default function LanguageSelector({
  showCardLayout = true,
  onLanguageChange,
}: LanguageSelectorProps = {}) {
  const {
    lang: selectedLanguage,
    setLang: onSelectLanguage,
    t,
  } = useLanguage();
  if (!showCardLayout) {
    return (
      <select
        value={selectedLanguage}
        onChange={(e) => {
          onSelectLanguage(e.target.value);
          if (onLanguageChange) onLanguageChange(e.target.value);
        }}
        className="bg-white text-black border border-black px-3 py-1.5 rounded-none font-bold text-sm cursor-pointer hover:bg-gray-100 shadow-none outline-none focus:ring-2 focus:ring-yellow-300"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="w-full bg-white border border-black p-6 rounded-none mb-6">
      <h3 className="text-xl font-bold text-[#003366] mb-2 border-b border-black pb-2">
        भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும் / Select Language
      </h3>
      <p className="text-sm text-gray-700 mb-4">
        Choose your preferred language to proceed with registration and crop
        data submission.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onSelectLanguage(lang.code);
                if (onLanguageChange) onLanguageChange(lang.code);
              }}
              className={`p-3 border font-bold text-left cursor-pointer transition-colors ${
                isSelected
                  ? "bg-[#058b2d] text-white border-black ring-2 ring-yellow-300"
                  : "bg-white text-black border-black hover:bg-slate-100"
              }`}
            >
              <div className="text-base">{lang.nativeName}</div>
              <div
                className={`text-xs ${isSelected ? "text-gray-200" : "text-gray-500"}`}
              >
                {lang.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
