'use client'

import React, { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [locationText, setLocationText] = useState('');
  
  const fetchLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    
    setLocationText('Locating...');
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          
          if (data && data.display_name) {
            setLocationText(data.display_name);
          } else {
             setLocationText(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
          }
        } catch (err) {
             setLocationText(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        }
      },
      (err) => {
        setLocationText('');
        alert('Unable to retrieve location. Please type it manually.');
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate signup and redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <main className="min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-white text-black flex flex-col items-center">
      
      <nav className="w-full bg-[#003366] text-white p-4 border-b border-black flex justify-between items-center rounded-none shadow-none">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline">SEAL</Link>
          <h1 className="m-0 text-xl font-bold tracking-tight">Krishi Bandhu</h1>
        </div>
      </nav>

      <div className="w-full max-w-md p-6 mt-10">
        <h2 className="text-2xl font-bold mb-6 border-b border-black pb-2">Sign Up</h2>
        
        <section className="bg-white border border-black p-6 rounded-none w-full">
          <form onSubmit={handleSubmit}>
            
            {/* Name Field */}
            <div className="mb-4 flex flex-col gap-1.5">
              <label htmlFor="name" className="font-bold text-black">Full Name</label>
              <input 
                id="name"
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] shadow-none"
              />
            </div>

            {/* Mobile Number Field */}
            <div className="mb-4 flex flex-col gap-1.5">
              <label htmlFor="mobile" className="font-bold text-black">Mobile Number</label>
              <input 
                id="mobile"
                type="text" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] shadow-none"
              />
            </div>

            {/* Location Field with Auto-Fetch */}
            <div className="mb-6 flex flex-col gap-1.5">
              <label htmlFor="location" className="font-bold text-black">Location (Manual or Auto-detect)</label>
              <input 
                id="location"
                type="text" 
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                required
                className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] shadow-none"
              />
              <button 
                type="button" 
                onClick={fetchLocation}
                className="mt-2 w-fit bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none hover:bg-gray-100 flex items-center gap-2 text-sm"
              >
                📍 Fetch via Location Data
              </button>
            </div>
            
            <button type="submit" className="w-full bg-[#003366] text-white font-bold border border-black p-4 cursor-pointer hover:bg-blue-800 rounded-none outline-none focus:ring-2 focus:ring-yellow-300">
              Create Account
            </button>
            
            <p className="mt-4 text-sm text-center">
              Already have an account? <Link href="/signin" className="text-[#003366] font-bold underline">Sign In</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
