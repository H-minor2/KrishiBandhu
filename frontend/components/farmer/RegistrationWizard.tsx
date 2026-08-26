'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import LanguageSelector from '../auth/LanguageSelector';
import LocationSelector from './LocationSelector';
import CropSelector from './CropSelector';
import LandDetailsInput from './LandDetailsInput';
import AgriDetailsInput from './AgriDetailsInput';
import FinancialDetailsInput from './FinancialDetailsInput';
import { FullRegistrationState } from '../../lib/supabase/types';
import { registerFarmerAndCrop, isSupabaseConfigured } from '../../lib/supabase/client';
import { getTranslation } from '../../lib/constants/languages';

const initialFormState: FullRegistrationState = {
  language: 'en',
  full_name: 'Rajesh Kumar',
  mobile_number: '9876543210',
  password: 'Password123',
  is_manual_location: true,
  state: 'Maharashtra',
  district: 'Pune',
  location_address: 'Village XYZ, Pune, Maharashtra',
  latitude: 18.5204,
  longitude: 73.8567,
  crop_name: 'Rice',
  custom_crop_name: '',
  land_size: 5,
  land_unit: 'Acre',
  sowing_date: new Date().toISOString().split('T')[0],
  irrigation_type: 'Rain-fed',
  custom_irrigation_type: '',
  soil_type: 'Alluvial',
  custom_soil_type: '',
  expected_harvest_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  loan_amount: 15000,
  loan_due_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
};

export default function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FullRegistrationState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = (key: string) => getTranslation(formData.language, key);

  const updateFormData = (fields: Partial<FullRegistrationState>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNextStep = () => {
    setErrorMsg('');

    if (currentStep === 2) {
      if (!formData.full_name.trim()) {
        setErrorMsg('Please enter your Full Name.');
        return;
      }
      if (!formData.mobile_number || formData.mobile_number.trim().length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    if (currentStep === 3) {
      if (formData.is_manual_location) {
        if (!formData.location_address.trim()) {
          setErrorMsg('Please enter your location/address text.');
          return;
        }
      } else {
        if (!formData.state || !formData.district) {
          setErrorMsg('Please select both State and District or switch to manual input.');
          return;
        }
      }
    }

    if (currentStep === 4) {
      if (!formData.crop_name) {
        setErrorMsg('Please select a Crop.');
        return;
      }
      if (formData.crop_name === 'Other' && !formData.custom_crop_name.trim()) {
        setErrorMsg('Please specify the custom crop name.');
        return;
      }
      if (formData.land_size === '' || Number(formData.land_size) <= 0) {
        setErrorMsg('Please enter a valid numeric land size.');
        return;
      }
    }

    if (currentStep === 5) {
      if (!formData.sowing_date) {
        setErrorMsg('Please select a Sowing Date.');
        return;
      }
      if (!formData.expected_harvest_date) {
        setErrorMsg('Please select an Expected Harvest Date.');
        return;
      }
    }

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const res = await registerFarmerAndCrop(formData);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(t('successMsg'));
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Failed to submit registration data.');
    }
  };

  const steps = [
    { num: 1, label: t('stepLanguage') },
    { num: 2, label: t('stepAccount') },
    { num: 3, label: t('stepLocation') },
    { num: 4, label: t('stepCropLand') },
    { num: 5, label: t('stepAgriDetails') },
    { num: 6, label: t('stepFinancial') }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 my-6">
      {/* Top Banner Header */}
      <div className="bg-[#003366] text-white p-6 border border-black mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
          🏛️ {t('appTitle')}
        </h1>
        <p className="text-sm md:text-base text-gray-200">
          {t('portalSubtitle')}
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-4 bg-amber-50 border-2 border-amber-500 p-3 text-sm text-amber-900 font-semibold">
          ⚡ Supabase Status: Database running in interactive local fallback mode. Submissions will populate local storage & client state. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> to sync live to Postgres.
        </div>
      )}

      {/* Step Indicators Bar */}
      <div className="flex flex-wrap gap-1 mb-6 bg-slate-100 p-2 border border-black overflow-x-auto">
        {steps.map((step) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <button
              key={step.num}
              type="button"
              onClick={() => {
                if (isDone || step.num < currentStep) setCurrentStep(step.num);
              }}
              className={`px-3 py-2 text-xs md:text-sm font-bold border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#003366] text-white border-black ring-2 ring-yellow-300'
                  : isDone
                  ? 'bg-emerald-700 text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-100 border-2 border-red-600 text-red-900 p-4 text-sm font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 p-4 text-base font-bold text-center">
          ✅ {successMsg} Redirecting to dashboard...
        </div>
      )}

      {/* Step Contents */}
      <form onSubmit={currentStep === 6 ? handleSubmitFinal : (e) => { e.preventDefault(); handleNextStep(); }}>

        {/* STEP 1: Select Language */}
        {currentStep === 1 && (
          <div>
            <LanguageSelector
              selectedLanguage={formData.language}
              onSelectLanguage={(lang) => {
                updateFormData({ language: lang });
              }}
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#003366] text-white font-bold border border-black px-6 py-3 hover:bg-blue-800 rounded-none outline-none focus:ring-2 focus:ring-yellow-300"
              >
                {t('nextButton')} ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Farmer Credentials */}
        {currentStep === 2 && (
          <div className="bg-white border border-black p-6 space-y-4">
            <h3 className="text-xl font-bold text-[#003366] border-b border-black pb-2">
              👤 {t('stepAccount')}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="farmer-full-name" className="font-bold text-black text-sm">
                {t('fullName')} *
              </label>
              <input
                id="farmer-full-name"
                type="text"
                placeholder="e.g. Ramesh Kumar Patel"
                value={formData.full_name}
                onChange={(e) => updateFormData({ full_name: e.target.value })}
                required
                className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="farmer-mobile" className="font-bold text-black text-sm">
                {t('mobileNumber')} *
              </label>
              <input
                id="farmer-mobile"
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.mobile_number}
                onChange={(e) => updateFormData({ mobile_number: e.target.value })}
                required
                className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="farmer-password" className="font-bold text-black text-sm">
                {t('password')} (Optional)
              </label>
              <input
                id="farmer-password"
                type="password"
                placeholder="Create password for future portal sign-in"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Location / District */}
        {currentStep === 3 && (
          <LocationSelector
            language={formData.language}
            state={formData.state}
            district={formData.district}
            locationAddress={formData.location_address}
            isManual={formData.is_manual_location}
            onChange={(fields) => {
              if (fields.isManual !== undefined) updateFormData({ is_manual_location: fields.isManual });
              if (fields.state !== undefined) updateFormData({ state: fields.state });
              if (fields.district !== undefined) updateFormData({ district: fields.district });
              if (fields.locationAddress !== undefined) updateFormData({ location_address: fields.locationAddress });
              if (fields.latitude !== undefined) updateFormData({ latitude: fields.latitude });
              if (fields.longitude !== undefined) updateFormData({ longitude: fields.longitude });
            }}
          />
        )}

        {/* STEP 4: Crop & Land Size */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <CropSelector
              language={formData.language}
              cropName={formData.crop_name}
              customCropName={formData.custom_crop_name}
              onChange={(fields) => {
                if (fields.crop_name !== undefined) updateFormData({ crop_name: fields.crop_name });
                if (fields.custom_crop_name !== undefined) updateFormData({ custom_crop_name: fields.custom_crop_name });
              }}
            />
            <LandDetailsInput
              language={formData.language}
              landSize={formData.land_size}
              landUnit={formData.land_unit}
              onChange={(fields) => {
                if (fields.land_size !== undefined) updateFormData({ land_size: fields.land_size });
                if (fields.land_unit !== undefined) updateFormData({ land_unit: fields.land_unit });
              }}
            />
          </div>
        )}

        {/* STEP 5: Soil, Irrigation, Sowing/Harvest Dates */}
        {currentStep === 5 && (
          <AgriDetailsInput
            language={formData.language}
            sowingDate={formData.sowing_date}
            irrigationType={formData.irrigation_type}
            customIrrigationType={formData.custom_irrigation_type}
            soilType={formData.soil_type}
            customSoilType={formData.custom_soil_type}
            expectedHarvestDate={formData.expected_harvest_date}
            onChange={(fields) => {
              if (fields.sowing_date !== undefined) updateFormData({ sowing_date: fields.sowing_date });
              if (fields.irrigation_type !== undefined) updateFormData({ irrigation_type: fields.irrigation_type });
              if (fields.custom_irrigation_type !== undefined) updateFormData({ custom_irrigation_type: fields.custom_irrigation_type });
              if (fields.soil_type !== undefined) updateFormData({ soil_type: fields.soil_type });
              if (fields.custom_soil_type !== undefined) updateFormData({ custom_soil_type: fields.custom_soil_type });
              if (fields.expected_harvest_date !== undefined) updateFormData({ expected_harvest_date: fields.expected_harvest_date });
            }}
          />
        )}

        {/* STEP 6: Financial Details & Final Submission */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <FinancialDetailsInput
              language={formData.language}
              loanAmount={formData.loan_amount}
              loanDueDate={formData.loan_due_date}
              onChange={(fields) => {
                if (fields.loan_amount !== undefined) updateFormData({ loan_amount: fields.loan_amount });
                if (fields.loan_due_date !== undefined) updateFormData({ loan_due_date: fields.loan_due_date });
              }}
            />

            {/* Registration Summary Card */}
            <div className="bg-slate-50 border border-black p-5 rounded-none text-sm space-y-2">
              <h4 className="font-bold text-[#003366] text-base border-b border-black pb-1">
                📋 Final Registration Summary
              </h4>
              <p><strong>Farmer Name:</strong> {formData.full_name || 'N/A'}</p>
              <p><strong>Mobile Number:</strong> {formData.mobile_number || 'N/A'}</p>
              <p><strong>Location:</strong> {formData.is_manual_location ? formData.location_address : `${formData.district}, ${formData.state}`}</p>
              <p><strong>Crop:</strong> {formData.crop_name === 'Other' ? formData.custom_crop_name : formData.crop_name} ({formData.land_size} {formData.land_unit})</p>
              <p><strong>Soil & Irrigation:</strong> {formData.soil_type} Soil, {formData.irrigation_type} Irrigation</p>
              <p><strong>Dates:</strong> Sowing ({formData.sowing_date}) ➔ Harvest ({formData.expected_harvest_date})</p>
              <p><strong>Loan Info:</strong> ₹{formData.loan_amount || 0} (Due: {formData.loan_due_date || 'N/A'})</p>
            </div>
          </div>
        )}

        {/* Bottom Action Navigation Buttons */}
        {currentStep > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-black">
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-white text-black font-bold border border-black px-6 py-3 hover:bg-slate-100 rounded-none outline-none"
            >
              ⬅️ {t('backButton')}
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#003366] text-white font-bold border border-black px-6 py-3 hover:bg-blue-800 rounded-none outline-none focus:ring-2 focus:ring-yellow-300"
              >
                {t('nextButton')} ➔
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#003366] text-white font-bold border-2 border-black px-8 py-3.5 hover:bg-blue-800 rounded-none outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer text-base disabled:opacity-50"
              >
                {submitting ? t('saving') : `📥 ${t('submitButton')}`}
              </button>
            )}
          </div>
        )}
      </form>

      <div className="mt-8 text-center text-sm border-t border-gray-300 pt-4">
        <span>{t('alreadyHaveAccount')} </span>
        <Link href="/signin" className="text-[#003366] font-bold underline hover:text-blue-800">
          {t('signInButton')}
        </Link>
      </div>
    </div>
  );
}
