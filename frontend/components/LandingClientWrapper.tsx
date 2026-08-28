"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SUPPORTED_LANGUAGES } from "../lib/constants/languages";
import { useLanguage } from "../lib/context/LanguageContext";

export default function LandingClientWrapper({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: string;
}) {
  const { lang, setLang, t } = useLanguage();
  const fontSizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];
  const [fontSizeIndex, setFontSizeIndex] = useState(2);
  const [isHighContrast, setIsHighContrast] = useState(false);

  const wrapperClasses = isHighContrast
    ? "bg-black text-yellow-300"
    : "bg-white text-black";

  return (
    <main
      className={`min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] ${wrapperClasses} ${fontSizes[fontSizeIndex]}`}
    >
      <nav className="w-full bg-[#058b2d] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold">
            SEAL
          </div>
          <h1 className="m-0 text-xl font-bold tracking-tight">
            {t("appTitle")}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-white text-black border border-black px-2 py-1.5 rounded-none cursor-pointer text-sm font-bold shadow-none outline-none focus:ring-2 focus:ring-yellow-300"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
          <div className="flex">
            <button
              type="button"
              onClick={() => setFontSizeIndex(prev => Math.min(prev + 1, fontSizes.length - 1))}
              className="bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none focus:ring-2 focus:ring-yellow-300"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSizeIndex(prev => Math.max(prev - 1, 0))}
              className="bg-white text-black border border-black border-l-0 px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none focus:ring-2 focus:ring-yellow-300"
            >
              A-
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsHighContrast(!isHighContrast)}
            className="bg-yellow-300 text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none focus:ring-2 focus:ring-white hover:bg-yellow-400"
          >
            HC
          </button>

          <Link
            href="/signin"
            className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-100 no-underline"
          >
            {t("signInButton")}
          </Link>
          <Link
            href="/signup"
            className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-100 no-underline"
          >
            {t("signupTitle")}
          </Link>
        </div>
      </nav>
      {children}
    </main>
  );
}
