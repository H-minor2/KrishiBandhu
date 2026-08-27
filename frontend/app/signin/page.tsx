import React from 'react';
import Link from 'next/link';
import LoginForm from '../../components/auth/LoginForm';
import LanguageSelector from '../../components/auth/LanguageSelector';
import { getTranslationsServer } from '../../lib/i18n/server';

export default function SignInPage() {
  const { t } = getTranslationsServer();

  return (
    <main className="min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black flex flex-col items-center pb-12">
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline">
            SEAL
          </Link>
          <h1 className="m-0 text-xl font-bold tracking-tight">{t('appTitle')}</h1>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector showCardLayout={false} />
          <Link href="/signup" className="bg-white text-[#003366] border border-black px-4 py-2 font-bold cursor-pointer rounded-none hover:bg-gray-100 no-underline text-sm">
            {t('signupTitle')}
          </Link>
        </div>
      </nav>

      <div className="w-full max-w-md mt-10">
        <LoginForm />
      </div>
    </main>
  );
}
