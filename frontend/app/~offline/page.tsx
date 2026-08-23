import React from 'react';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import '../globals.css';

export default function OfflinePage() {
  return (
    <main className="min-h-screen m-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black flex flex-col items-center justify-center text-center p-6">
      <div className="bg-white border-2 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
        <WifiOff className="w-16 h-16 mx-auto text-red-600 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-[#003366] mb-2">No Internet Connection</h1>
        <p className="text-gray-700 font-medium mb-8">
          You are currently offline. Please reconnect to the internet to access live features and sync your crop data.
        </p>
        <Link href="/" className="inline-block bg-[#003366] text-white font-bold border-2 border-black px-8 py-3 uppercase tracking-wider hover:bg-blue-800 transition-colors no-underline">
          Try Again
        </Link>
      </div>
    </main>
  );
}
