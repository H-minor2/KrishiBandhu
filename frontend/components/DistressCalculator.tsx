'use client'

import React, { useState } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';

export default function DistressCalculator() {
  const [formData, setFormData] = useState({
    outstandingDebt: '',
    activeLoans: '1',
    lenderType: 'public',
    recentDefaults: 'no',
    cropLoss: 'no',
    annualIncome: '',
    loanDetails: [] as Array<{ interestRate: string, tenure: string }>
  });

  const [score, setScore] = useState<number | null>(null);

  const renderLoanFields = () => {
    const loanFields = [];
    const numLoans = parseInt(formData.activeLoans) || 0;
    
    for (let i = 0; i < numLoans; i++) {
      loanFields.push(
        <div key={i} className="mb-6 p-4 border-2 border-black bg-slate-100">
            <h3 className="font-bold text-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">Loan {i + 1} Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">Interest Rate (%)</label>
                    <input 
                        type="number" 
                        required
                        value={formData.loanDetails[i]?.interestRate || ''}
                        onChange={(e) => {
                            const newLoanDetails = [...formData.loanDetails];
                            if (!newLoanDetails[i]) newLoanDetails[i] = { interestRate: '', tenure: '' };
                            newLoanDetails[i].interestRate = e.target.value;
                            setFormData({...formData, loanDetails: newLoanDetails});
                        }}
                        placeholder="e.g. 12"
                        className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366] rounded-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">Tenure (in years)</label>
                    <input 
                        type="number" 
                        required
                        value={formData.loanDetails[i]?.tenure || ''}
                        onChange={(e) => {
                            const newLoanDetails = [...formData.loanDetails];
                            if (!newLoanDetails[i]) newLoanDetails[i] = { interestRate: '', tenure: '' };
                            newLoanDetails[i].tenure = e.target.value;
                            setFormData({...formData, loanDetails: newLoanDetails});
                        }}
                        placeholder="e.g. 5"
                        className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366] rounded-none"
                    />
                </div>
            </div>
        </div>
      );
    }
    
    return loanFields;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mockup calculation based on inputs
    let calculatedScore = 50; // base score
    
    if (Number(formData.outstandingDebt) > 50000) calculatedScore += 15;
    if (Number(formData.outstandingDebt) > 150000) calculatedScore += 20;
    
    if (formData.activeLoans === '3') calculatedScore += 10;
    if (formData.activeLoans === '4+') calculatedScore += 20;
    
    if (formData.lenderType === 'moneylender') calculatedScore += 25;
    if (formData.recentDefaults === 'yes') calculatedScore += 30;
    if (formData.cropLoss === 'yes') calculatedScore += 15;
    
    if (Number(formData.annualIncome) > 100000) calculatedScore -= 20;
    
    calculatedScore = Math.min(Math.max(calculatedScore, 0), 100);
    setScore(calculatedScore);
  };

  const getScoreColor = (val: number) => {
    if (val < 40) return 'text-emerald-700 bg-emerald-100 border-emerald-700'; // Low risk
    if (val < 70) return 'text-amber-700 bg-amber-100 border-amber-700'; // Medium risk
    return 'text-red-700 bg-red-100 border-red-700'; // High risk
  };
  
  const getScoreLabel = (val: number) => {
    if (val < 40) return 'LOW RISK (STABLE)';
    if (val < 70) return 'MODERATE DISTRESS';
    return 'HIGH DISTRESS (INTERVENTION REQUIRED)';
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      {/* Header */}
      <div className="bg-[#FFD700] border-2 border-black p-6 mb-6">
        <h2 className="text-2xl font-black text-black uppercase tracking-wider flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          Financial Distress Score Calculator
        </h2>
        <p className="text-black font-medium mt-2">
          Enter your current loan history and financial details to calculate a real-time agricultural distress index.
        </p>
      </div>

      {score !== null ? (
          <div className="bg-white border-2 border-black p-8 text-center mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-bold text-gray-600 uppercase tracking-widest mb-4">Calculated Distress Score</h3>
              <div className={`text-6xl font-black p-8 border-4 inline-block mb-4 ${getScoreColor(score)}`}>
                  {score}/100
              </div>
              <p className={`text-xl font-bold uppercase tracking-wider ${getScoreColor(score).split(' ')[0]}`}>
                  {getScoreLabel(score)}
              </p>
              
              <button 
                onClick={() => setScore(null)} 
                className="mt-8 bg-black text-white font-bold px-8 py-3 border-2 border-black uppercase hover:bg-gray-800"
              >
                Recalculate
              </button>
          </div>
      ) : (
          <form onSubmit={handleCalculate} className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 1. Total Outstanding Debt */}
              <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">Total Outstanding Debt (₹)</label>
              <input 
                  type="number" 
                  required
                  value={formData.outstandingDebt}
                  onChange={(e) => setFormData({...formData, outstandingDebt: e.target.value})}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366] rounded-none"
              />
              </div>

              {/* 2. Estimated Annual Income */}
              <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">Est. Annual Farming Income (₹)</label>
              <input 
                  type="number" 
                  required
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({...formData, annualIncome: e.target.value})}
                  placeholder="e.g. 120000"
                  className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366] rounded-none"
              />
              </div>

              {/* 3. Number of Active Loans */}
              <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">Number of Active Loans</label>
              <select 
                  value={formData.activeLoans}
                  onChange={(e) => setFormData({...formData, activeLoans: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366] rounded-none appearance-none"
              >
                  <option value="1">1 Loan</option>
                  <option value="2">2 Loans</option>
                  <option value="3">3 Loans</option>
                  <option value="4+">4 or more Loans</option>
              </select>
              </div>

              {/* 4. Primary Lender Type */}
              <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">Primary Lender Type</label>
              <select 
                  value={formData.lenderType}
                  onChange={(e) => setFormData({...formData, lenderType: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-black px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366] rounded-none appearance-none"
              >
                  <option value="public">Public Sector Bank (KCC)</option>
                  <option value="cooperative">Cooperative Society / Bank</option>
                  <option value="moneylender">Private Moneylender / Sahukar</option>
                  <option value="nbfc">Microfinance / NBFC</option>
              </select>
              </div>
          </div>

          {/* Dynamic Loan Fields */}
          {renderLoanFields()}

          <div className="space-y-6 mb-8 border-t-2 border-black pt-6">
              {/* 5. Recent Defaults */}
              <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-3">Any Defaults or Missed Payments in last 12 months?</label>
              <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" name="default" value="yes" checked={formData.recentDefaults === 'yes'} onChange={(e) => setFormData({...formData, recentDefaults: e.target.value})} className="w-5 h-5 accent-[#003366]"/>
                  YES
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" name="default" value="no" checked={formData.recentDefaults === 'no'} onChange={(e) => setFormData({...formData, recentDefaults: e.target.value})} className="w-5 h-5 accent-[#003366]"/>
                  NO
                  </label>
              </div>
              </div>

              {/* 6. Crop Loss */}
              <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-3">Any major crop loss (climate/pests) in last 2 years?</label>
              <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" name="cropLoss" value="yes" checked={formData.cropLoss === 'yes'} onChange={(e) => setFormData({...formData, cropLoss: e.target.value})} className="w-5 h-5 accent-[#003366]"/>
                  YES
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" name="cropLoss" value="no" checked={formData.cropLoss === 'no'} onChange={(e) => setFormData({...formData, cropLoss: e.target.value})} className="w-5 h-5 accent-[#003366]"/>
                  NO
                  </label>
              </div>
              </div>
          </div>

          <button 
              type="submit"
              className="w-full bg-[#003366] text-white font-black text-lg py-4 border-2 border-black uppercase tracking-widest hover:bg-blue-800 flex items-center justify-center gap-3 transition-colors"
          >
              <Calculator className="w-6 h-6" />
              Calculate Distress Score
          </button>
          </form>
      )}
    </div>
  );
}
