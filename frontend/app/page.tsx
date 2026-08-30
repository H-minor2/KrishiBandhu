import React from 'react';
import Link from 'next/link';
import { getTranslationsServer } from '../lib/i18n/server';
import LandingClientWrapper from '../components/LandingClientWrapper';
import Carousel from '../components/Carousel';
import { Wheat, TrendingUp, Bot } from 'lucide-react';

export default function LandingPage() {
  const { lang, t } = getTranslationsServer();

  return (
    <LandingClientWrapper initialLang={lang}>
      <div className="w-full max-w-5xl mx-auto p-6 md:p-10 flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-4 border-b-4 border-[#058b2d] pb-2 w-fit text-center">
          Welcome to {t('appTitle')}
        </h2>
        
        <p className="max-w-3xl text-xl leading-relaxed mb-8 text-center text-gray-700">
          Empowering farmers through technology. Join our community to register your crops, access real-time market prices, track weather-based distress scores, and receive AI-driven agricultural advisory.
        </p>

        {/* Image Carousel */}
        <div className="w-full mb-10 shadow-lg">
          <Carousel />
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          <div className="bg-white p-6 border-2 border-black rounded-lg text-center hover:bg-green-50 transition-colors flex flex-col items-center">
            <Wheat className="w-12 h-12 mb-3 text-green-700" />
            <h3 className="text-xl font-bold mb-2">Crop Management</h3>
            <p className="text-gray-600">Securely register and manage all your crop details in one place.</p>
          </div>
          <div className="bg-white p-6 border-2 border-black rounded-lg text-center hover:bg-yellow-50 transition-colors flex flex-col items-center">
            <TrendingUp className="w-12 h-12 mb-3 text-amber-600" />
            <h3 className="text-xl font-bold mb-2">Live Mandi Prices</h3>
            <p className="text-gray-600">Compare live agricultural market prices across your state.</p>
          </div>
          <div className="bg-white p-6 border-2 border-black rounded-lg text-center hover:bg-blue-50 transition-colors flex flex-col items-center">
            <Bot className="w-12 h-12 mb-3 text-blue-600" />
            <h3 className="text-xl font-bold mb-2">Krishi AI Assistant</h3>
            <p className="text-gray-600">Get personalized advice on fertilizers, pest control, and weather.</p>
          </div>
        </div>

        <div className="bg-[#058b2d] text-white p-8 border-2 border-black rounded-lg text-center w-full max-w-3xl">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-lg leading-relaxed mb-6">
            Please{' '}
            <Link href="/signin" className="underline font-bold hover:text-yellow-300 transition-colors">
              {t('signInButton')}
            </Link>{' '}
            or{' '}
            <Link href="/signup" className="underline font-bold hover:text-yellow-300 transition-colors">
              {t('signupTitle')}
            </Link>{' '}
            to access the data submission dashboard.
          </p>
        </div>
      </div>
    </LandingClientWrapper>
  );
}
