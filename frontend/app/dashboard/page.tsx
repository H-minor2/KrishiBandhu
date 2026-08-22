'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import '../globals.css';

const translations = {
  en: {
    title: 'Krishi Bandhu',
    noEntries: 'No entries recorded. Data will appear here once submitted.',
    newEntry: 'New Entry Form',
    farmArea: 'Farm Area (Acres/Hectares)',
    cropType: 'Crop Type',
    soilType: 'Soil Type',
    rainfallLevel: 'Rainfall Level',
    fetchLoc: 'Fetch via Location Data',
    submit: 'Submit Entry',
    cancel: 'Cancel',
    userProfile: 'Account',
    logOut: 'Log Out'
  },
  hi: {
    title: 'कृषि बंधु',
    noEntries: 'कोई प्रविष्टि दर्ज नहीं की गई। सबमिट होने के बाद डेटा यहां दिखाई देगा।',
    newEntry: 'नया फॉर्म',
    farmArea: 'खेत का क्षेत्र (एकड़/हेक्टेयर)',
    cropType: 'फसल का प्रकार',
    soilType: 'मिट्टी का प्रकार',
    rainfallLevel: 'वर्षा का स्तर',
    fetchLoc: 'स्थान के माध्यम से प्राप्त करें',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    userProfile: 'खाता',
    logOut: 'लॉग आउट'
  },
  ta: {
    title: 'கிருஷி பந்து',
    noEntries: 'எந்த உள்ளீடுகளும் பதிவு செய்யப்படவில்லை. சமர்ப்பிக்கப்பட்டதும் தரவு இங்கே தோன்றும்.',
    newEntry: 'புதிய படிவம்',
    farmArea: 'பண்ணை பகுதி (ஏக்கர்/ஹெக்டேர்)',
    cropType: 'பயிர் வகை',
    soilType: 'மண் வகை',
    rainfallLevel: 'மழையளவு',
    fetchLoc: 'இருப்பிடத்தின் மூலம் பெறவும்',
    submit: 'சமர்ப்பிக்கவும்',
    cancel: 'ரத்து செய்',
    userProfile: 'கணக்கு',
    logOut: 'வெளியேறு'
  },
  bn: {
    title: 'কৃষি বন্ধু',
    noEntries: 'কোনো এন্ট্রি রেকর্ড করা হয়নি। জমা দেওয়ার পর ডেটা এখানে প্রদর্শিত হবে।',
    newEntry: 'নতুন এন্ট্রি ফর্ম',
    farmArea: 'খামারের এলাকা (একর/হেক্টর)',
    cropType: 'ফসলের ধরন',
    soilType: 'মাটির ধরন',
    rainfallLevel: 'বৃষ্টিপাতের মাত্রা',
    fetchLoc: 'অবস্থানের মাধ্যমে ডেটা আনুন',
    submit: 'জমা দিন',
    cancel: 'বাতিল করুন',
    userProfile: 'অ্যাকাউন্ট',
    logOut: 'লগ আউট'
  },
  or: {
    title: 'କୃଷି ବନ୍ଧୁ',
    noEntries: 'କୌଣସି ଏଣ୍ଟ୍ରି ରେକର୍ଡ ହୋଇନାହିଁ। ଦାଖଲ ହେବା ପରେ ଡାଟା ଏଠାରେ ଦେଖାଯିବ।',
    newEntry: 'ନୂଆ ଫର୍ମ',
    farmArea: 'ଚାଷ ଜମି (ଏକର/ହେକ୍ଟର)',
    cropType: 'ଫସଲ ପ୍ରକାର',
    soilType: 'ମୃତ୍ତିକା ପ୍ରକାର',
    rainfallLevel: 'ବୃଷ୍ଟିପାତ ସ୍ତର',
    fetchLoc: 'ଲୋକେସନ୍ ମାଧ୍ୟମରେ ଆଣନ୍ତୁ',
    submit: 'ଦାଖଲ କରନ୍ତୁ',
    cancel: 'ବାତିଲ୍ କରନ୍ତୁ',
    userProfile: 'ଆକାଉଣ୍ଟ୍',
    logOut: 'ଲଗ୍ ଆଉଟ୍'
  },
  pa: {
    title: 'ਕ੍ਰਿਸ਼ੀ ਬੰਧੂ',
    noEntries: 'ਕੋਈ ਐਂਟਰੀ ਰਿਕਾਰਡ ਨਹੀਂ ਕੀਤੀ ਗਈ। ਜਮ੍ਹਾਂ ਹੋਣ ਤੋਂ ਬਾਅਦ ਡੇਟਾ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗਾ।',
    newEntry: 'ਨਵਾਂ ਫਾਰਮ',
    farmArea: 'ਖੇਤ ਦਾ ਰਕਬਾ (ਏਕੜ/ਹੈਕਟੇਅਰ)',
    cropType: 'ਫਸਲ ਦੀ ਕਿਸਮ',
    soilType: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ',
    rainfallLevel: 'ਮੀਂਹ ਦਾ ਪੱਧਰ',
    fetchLoc: 'ਸਥਾਨ ਦੁਆਰਾ ਪ੍ਰਾਪਤ ਕਰੋ',
    submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    userProfile: 'ਖਾਤਾ',
    logOut: 'ਲਾਗ ਆਉਟ'
  },
  mr: {
    title: 'कृषी बंधू',
    noEntries: 'कोणतीही नोंद केलेली नाही. सबमिट केल्यानंतर डेटा येथे दिसेल.',
    newEntry: 'नवीन फॉर्म',
    farmArea: 'शेताचे क्षेत्र (एकर/हेक्टर)',
    cropType: 'पिकाचा प्रकार',
    soilType: 'मातीचा प्रकार',
    rainfallLevel: 'पावसाची पातळी',
    fetchLoc: 'स्थानाद्वारे मिळवा',
    submit: 'सबमिट करा',
    cancel: 'रद्द करा',
    userProfile: 'खाते',
    logOut: 'लॉग आउट'
  },
  te: {
    title: 'కృషి బంధు',
    noEntries: 'ఎలాంటి ఎంట్రీలు నమోదు కాలేదు. సమర్పించిన తర్వాత డేటా ఇక్కడ కనిపిస్తుంది.',
    newEntry: 'కొత్త ఫారమ్',
    farmArea: 'వ్యవసాయ ప్రాంతం (ఎకరాలు/హెక్టార్లు)',
    cropType: 'పంట రకం',
    soilType: 'నేల రకం',
    rainfallLevel: 'వర్షపాతం స్థాయి',
    fetchLoc: 'లొకేషన్ ద్వారా పొందండి',
    submit: 'సమర్పించండి',
    cancel: 'రద్దు చేయండి',
    userProfile: 'ఖాతా',
    logOut: 'లాగ్ అవుట్'
  }
};

export default function SIHDashboardPage() {
  const [lang, setLang] = useState<keyof typeof translations>('en');
  const [fontSize, setFontSize] = useState('text-base');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [farmArea, setFarmArea] = useState('');
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [rainfallLevel, setRainfallLevel] = useState('');

  const t = translations[lang];

  // Dummy Speech API Handler (for the microphone icons)
  const startDictation = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser.');
    const recognition = new SpeechRecognition();
    // Dynamically switch dictation language
    recognition.lang = lang === 'en' ? 'en-US' : (lang === 'hi' ? 'hi-IN' : 'ta-IN'); 
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
    
    const entrySchema = z.object({
      farmArea: z.coerce.number().positive("Farm Area must be a positive number"),
      cropType: z.string().trim().min(2, "Crop Type must be at least 2 characters"),
      soilType: z.string().trim().min(2, "Soil Type must be at least 2 characters"),
      rainfallLevel: z.string().trim().min(2, "Rainfall Level must be specified")
    });

    const validation = entrySchema.safeParse({
      farmArea,
      cropType,
      soilType,
      rainfallLevel
    });

    if (!validation.success) {
      // Alert the first validation error encountered
      alert("Validation Error: " + validation.error.errors[0].message);
      return;
    }

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
          <h1 className="m-0 text-xl font-bold tracking-tight">{t.title}</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Language Dropdown */}
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value as keyof typeof translations)}
            className="bg-white text-black border border-black px-2 py-1.5 rounded-none cursor-pointer text-sm font-bold shadow-none outline-none hover:bg-gray-200"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="or">ଓଡ଼ିଆ (Odia)</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>

          {/* Accessibility Toggles */}
          <div className="flex">
            <button type="button" onClick={() => setFontSize('text-lg')} className="bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200">A+</button>
            <button type="button" onClick={() => setFontSize('text-sm')} className="bg-white text-black border border-black border-l-0 px-3 py-1.5 font-bold cursor-pointer rounded-none outline-none hover:bg-gray-200">A-</button>
          </div>
          
          {/* User Profile */}
          <button className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200">
            <u>{t.userProfile}</u>
          </button>
          
          {/* Log Out */}
          <button onClick={() => window.location.href='/'} className="bg-white text-[#003366] border border-black px-3 py-1.5 font-bold flex items-center gap-2 cursor-pointer rounded-none outline-none hover:bg-gray-200">
            <u>{t.logOut}</u>
          </button>
        </div>
      </nav>

      {/* 2. Main Body (Empty State) */}
      <div className="w-full p-6 md:p-10 h-[calc(100vh-80px)] relative">
        <div className="w-full h-full border border-black flex items-center justify-center bg-white relative">
          
          <p className="text-xl font-bold text-gray-500">
            {t.noEntries}
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
            <h2 className="text-2xl font-bold mb-6 border-b border-black pb-2 text-[#003366]">{t.newEntry}</h2>
            
            <form onSubmit={handleSubmit}>
              
              {/* Farm Area */}
              <div className="mb-4 flex flex-col gap-1">
                <label className="font-bold text-black">{t.farmArea}</label>
                <div className="flex items-stretch">
                  <input type="number" value={farmArea} onChange={e => setFarmArea(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setFarmArea)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
              </div>

              {/* Crop Type */}
              <div className="mb-4 flex flex-col gap-1">
                <label className="font-bold text-black">{t.cropType}</label>
                <div className="flex items-stretch">
                  <input type="text" value={cropType} onChange={e => setCropType(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setCropType)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
              </div>

              {/* Soil Type */}
              <div className="mb-4 flex flex-col gap-1">
                <label className="font-bold text-black">{t.soilType}</label>
                <div className="flex items-stretch">
                  <input type="text" value={soilType} onChange={e => setSoilType(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setSoilType)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
              </div>

              {/* Rainfall Level */}
              <div className="mb-8 flex flex-col gap-1">
                <label className="font-bold text-black">{t.rainfallLevel}</label>
                <div className="flex items-stretch mb-2">
                  <input type="text" value={rainfallLevel} onChange={e => setRainfallLevel(e.target.value)} required className="w-full border border-black p-2 rounded-none text-black outline-none focus:ring-2 focus:ring-[#003366]" />
                  <button type="button" onClick={() => startDictation(setRainfallLevel)} className="bg-[#003366] text-white border border-black border-l-0 px-3 cursor-pointer rounded-none">🎙️</button>
                </div>
                <button type="button" onClick={handleFetchLocationData} className="w-fit bg-white text-black border border-black px-3 py-1.5 font-bold cursor-pointer rounded-none hover:bg-gray-100 flex items-center gap-2">
                  📍 {t.fetchLoc}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-[#003366] text-white font-bold border border-black p-3 cursor-pointer rounded-none hover:bg-blue-800">
                  {t.submit}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white text-black font-bold border border-black p-3 cursor-pointer rounded-none hover:bg-gray-100">
                  {t.cancel}
                </button>
              </div>

            </form>
          </section>
        </div>
      )}
    </main>
  );
}
