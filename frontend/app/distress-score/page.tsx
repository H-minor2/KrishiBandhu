import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LanguageSelector from '../../components/auth/LanguageSelector';
import { getTranslationsServer } from '../../lib/i18n/server';
import DistressCalculator from '../../components/DistressCalculator';
import '../globals.css';

export default function DistressScorePage() {
  const { t } = getTranslationsServer();

  return (
    <main className="min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black">
      
      {/* Navbar */}
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline">
            SEAL
          </Link>
          <div>
            <h1 className="m-0 text-xl font-bold tracking-tight">{t('appTitle') || 'Krishi Bandhu'}</h1>
            <p className="m-0 text-xs text-gray-300 font-bold uppercase tracking-widest mt-1">{t('govOfIndia') || 'Government of India'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSelector showCardLayout={false} />
          <Link 
            href="/dashboard" 
            className="bg-white text-[#003366] border border-black px-4 py-2 font-bold flex items-center gap-2 cursor-pointer outline-none hover:bg-gray-200 no-underline text-sm rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToDashboard') || 'Back to Dashboard'}
          </Link>
        </div>
      </nav>

      <DistressCalculator />
    </main>
  );
}

