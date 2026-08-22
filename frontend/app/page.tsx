'use client'

import React, { useState } from 'react';
import Link from 'next/link';

const translations = {
  en: { title: 'Krishi Bandhu', signin: 'Sign In', signup: 'Sign Up' },
  hi: { title: 'कृषि बंधु', signin: 'साइन इन करें', signup: 'साइन अप करें' },
  ta: { title: 'கிருஷி பந்து', signin: 'உள்நுழைக', signup: 'பதிவு செய்க' }
};

export default function LandingPage() {
  const [lang, setLang] = useState<keyof typeof translations>('en');
  const [fontSize, setFontSize] = useState('text-base');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const t = translations[lang];
  const wrapperClasses = isHighContrast ? 'bg-black text-yellow-300' : 'bg-white text-black';

  return (
    <main className={`min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] ${wrapperClasses} ${fontSize}`}>
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold">SEAL</div>
          <h1 className="m-0 text-xl font-bold tracking-tight">{t.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value as keyof typeof translations)}
            className="bg-white text-black border border-black px-2 py-1.5 rounded-none cursor-pointer text-sm font-bold shadow-none outline-none focus:ring-2 focus:ring-yellow-300"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
          <div className="flex">
            <button type="button" onClick={() => setFontSize('text-lg')} className="bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none focus:ring-2 focus:ring-yellow-300">A+</button>
            <button type="button" onClick={() => setFontSize('text-sm')} className="bg-white text-black border border-black border-l-0 px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none focus:ring-2 focus:ring-yellow-300">A-</button>
          </div>
          <button type="button" onClick={() => setIsHighContrast(!isHighContrast)} className="bg-yellow-300 text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none focus:ring-2 focus:ring-white hover:bg-yellow-400">HC</button>
          
          <Link href="/signin" className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-100 no-underline">
            {t.signin}
          </Link>
          <Link href="/signup" className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-100 no-underline">
            {t.signup}
          </Link>
        </div>
      </nav>

      <div className="w-full max-w-4xl p-6 md:p-10">
        <h2 className="text-3xl font-bold mb-4 border-b border-black pb-2 w-fit">Welcome to {t.title}</h2>
        <p className="max-w-2xl text-lg leading-relaxed mb-6">
          The official government portal providing direct support, resources, and geographic data collection for local agriculture.
        </p>
        <p className="max-w-2xl text-lg leading-relaxed mb-8">
          Please <strong>Sign In</strong> or <strong>Sign Up</strong> using the buttons in the top right corner to access the data submission dashboard.
        </p>

        <div className="w-full max-w-md h-48 bg-slate-200 border border-black flex items-center justify-center text-slate-500 rounded-none relative overflow-hidden">
          <span className="z-10 font-bold bg-white px-2 py-1 border border-black">[ Local Farmer Image Placeholder ]</span>
        </div>
      </div>
    </main>
  );
}
