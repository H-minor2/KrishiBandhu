'use client'

import React, { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [mobile, setMobile] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect to dashboard
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
        <h2 className="text-2xl font-bold mb-6 border-b border-black pb-2">Sign In</h2>
        
        <section className="bg-white border border-black p-6 rounded-none w-full">
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex flex-col gap-1.5">
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
            
            <button type="submit" className="w-full bg-[#003366] text-white font-bold border border-black p-4 cursor-pointer hover:bg-blue-800 rounded-none outline-none focus:ring-2 focus:ring-yellow-300">
              Sign In
            </button>
            
            <p className="mt-4 text-sm text-center">
              Don't have an account? <Link href="/signup" className="text-[#003366] font-bold underline">Sign Up</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
