import React from 'react';
import { getTranslationsServer } from '../lib/i18n/server';
import LandingClientWrapper from '../components/LandingClientWrapper';

export default function LandingPage() {
  const { lang, t } = getTranslationsServer();

  return (
    <LandingClientWrapper initialLang={lang}>
      <div className="w-full max-w-4xl p-6 md:p-10">
        <h2 className="text-3xl font-bold mb-4 border-b border-black pb-2 w-fit">Welcome to {t('appTitle')}</h2>
        <p className="max-w-2xl text-lg leading-relaxed mb-6">
          {t('portalSubtitle')}
        </p>
        <p className="max-w-2xl text-lg leading-relaxed mb-8">
          Please <strong>{t('signInButton')}</strong> or <strong>{t('signupTitle')}</strong> using the buttons in the top right corner to access the data submission dashboard.
        </p>

        <div className="w-full max-w-md h-48 bg-slate-200 border border-black flex items-center justify-center text-slate-500 rounded-none relative overflow-hidden">
          <span className="z-10 font-bold bg-white px-2.5 py-1.5 border border-black">[ Krishi Bandhu Portal ]</span>
        </div>
      </div>
    </LandingClientWrapper>
  );
}
