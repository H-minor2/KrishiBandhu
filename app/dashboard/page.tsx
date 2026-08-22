'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import '../globals.css';

export default function SIHDashboardPage() {
  const [fontSize, setFontSize] = useState('text-base');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [farmArea, setFarmArea] = useState('');
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [rainfallLevel, setRainfallLevel] = useState('');

  // Dummy Speech API Handler (for the microphone icons)
  const startDictation = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser.');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.onresult = (e: any) => setter(e.results[0][0].transcript);
    recognition.start();
  };

  const handleFetchLocationData = () => {
    // Dummy logic to fetch rainfall data via location
    alert("Fetching rainfall data based on current GPS location...");
    setRainfallLevel("120mm (Estimated)");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Entry Submitted successfully!");
    setIsModalOpen(false);
  };

  return (
    <main className={`min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-white text-black ${fontSize}`}>
      
      {/* 1. Navbar */}
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline">
            SEAL
          </Link>
          <h1 className="m-0 text-xl font-bold tracking-tight">SIH Project Homepage</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Accessibility Toggles */}
          <div className="flex">
            <button type="button" onClick={() => setFontSize('text-lg')} className="bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200">A+</button>
            <button type="button" onClick={() => setFontSize('text-sm')} className="bg-white text-black border border-black border-l-0 px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200">A-</button>
          </div>
          
          {/* User Profile */}
          <button className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200">
            👤 User Profile
          </button>
          
          {/* Log Out */}
          <button onClick={() => window.location.href='/'} className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200">
            🚪 Log Out
          </button>
        </div>
      </nav>

      {/* 2. Main Body (Empty State) */}
      <div className="w-full p-6 md:p-10 h-[calc(100vh-80px)] relative">
        <div className="w-full h-full border border-black flex items-center justify-center bg-white relative">
          
          <p className="text-xl font-bold text-gray-500">
            No entries recorded. Data will appear here once submitted.
          </p>

          {/* Floating Action Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-6 right-6 w-16 h-16 bg-[#003366] text-white border border-black flex items-center justify-center text-4xl font-bold cursor-pointer rounded-none hover:bg-blue-800 shadow-none outline-none"
            aria-label="Create New Entry"
          >
            +
          </button>
        </div>
      </div>

      {/* 3. Data Entry Modal (Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <section className="bg-white border-2 border-black p-6 w-full max-w-lg rounded-none shadow-none">
            <h2 className="text-2xl font-bold mb-6 border-b border-black pb-2 text-[#003366]">New Entry Form</h2>
            
            <form onSubmit={handleSubmit}>
              
              {/* Farm Area */}
              <div className="mb-4 flex flex-col gap-1">
                <label className="font-bold text-black">Farm Area (Acres/Hectares)</label>
                <div className="flex items-stretch">
                  <input type="number" value={farmArea} onChange={e => setFarmArea(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setFarmArea)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
              </div>

              {/* Crop Type */}
              <div className="mb-4 flex flex-col gap-1">
                <label className="font-bold text-black">Crop Type</label>
                <div className="flex items-stretch">
                  <input type="text" value={cropType} onChange={e => setCropType(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setCropType)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
              </div>

              {/* Soil Type */}
              <div className="mb-4 flex flex-col gap-1">
                <label className="font-bold text-black">Soil Type</label>
                <div className="flex items-stretch">
                  <input type="text" value={soilType} onChange={e => setSoilType(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setSoilType)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
              </div>

              {/* Rainfall Level */}
              <div className="mb-8 flex flex-col gap-1">
                <label className="font-bold text-black">Rainfall Level</label>
                <div className="flex items-stretch mb-2">
                  <input type="text" value={rainfallLevel} onChange={e => setRainfallLevel(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setRainfallLevel)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
                <button type="button" onClick={handleFetchLocationData} className="w-fit bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none hover:bg-gray-100 flex items-center gap-2">
                  📍 Fetch via Location Data
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#003366] text-white font-bold border border-black p-3 cursor-pointer rounded-none hover:bg-blue-800">
                  Submit Entry
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white text-black font-bold border border-black p-3 cursor-pointer rounded-none hover:bg-gray-100">
                  Cancel
                </button>
              </div>

            </form>
          </section>
        </div>
      )}
    </main>
  );
}
