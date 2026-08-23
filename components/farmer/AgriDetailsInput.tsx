'use client'

import React from 'react';
import { IRRIGATION_TYPES, SOIL_TYPES } from '../../lib/constants/crops';
import { IrrigationType, SoilType } from '../../lib/supabase/types';
import { getTranslation } from '../../lib/constants/languages';

interface AgriDetailsInputProps {
  language: string;
  sowingDate: string;
  irrigationType: IrrigationType;
  customIrrigationType?: string;
  soilType: SoilType;
  customSoilType?: string;
  expectedHarvestDate: string;
  onChange: (fields: Partial<{
    sowing_date: string;
    irrigation_type: IrrigationType;
    custom_irrigation_type?: string;
    soil_type: SoilType;
    custom_soil_type?: string;
    expected_harvest_date: string;
  }>) => void;
}

export default function AgriDetailsInput({
  language,
  sowingDate,
  irrigationType,
  customIrrigationType = '',
  soilType,
  customSoilType = '',
  expectedHarvestDate,
  onChange
}: AgriDetailsInputProps) {
  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="bg-white border border-black p-5 rounded-none space-y-5">
      <h3 className="text-lg font-bold text-[#003366] border-b border-black pb-2">
        🌱 Agricultural Parameters (Sowing, Soil & Irrigation)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sowing Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sowing-date" className="font-bold text-black text-sm">
            📅 {t('sowingDateLabel')} *
          </label>
          <input
            id="sowing-date"
            type="date"
            value={sowingDate}
            onChange={(e) => onChange({ sowing_date: e.target.value })}
            required
            className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        {/* Expected Harvest Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="harvest-date" className="font-bold text-black text-sm">
            🌾 {t('expectedHarvestDateLabel')} *
          </label>
          <input
            id="harvest-date"
            type="date"
            value={expectedHarvestDate}
            onChange={(e) => onChange({ expected_harvest_date: e.target.value })}
            required
            className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>
      </div>

      {/* Soil Type Selection (Interactive Cards & Dropdown) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="soil-type-select" className="font-bold text-black text-sm">
          🧱 {t('soilTypeLabel')} *
        </label>

        {/* Clickable Option Cards for Soil Type */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {SOIL_TYPES.map((st) => {
            const isSelected = soilType === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => onChange({ soil_type: st })}
                className={`p-3 border text-sm font-semibold text-left flex items-center justify-between cursor-pointer transition-all ${isSelected
                    ? 'bg-[#003366] text-white border-black ring-2 ring-yellow-300 shadow-sm'
                    : 'bg-white text-black border-black hover:bg-slate-100'
                  }`}
              >
                <span>{st} Soil</span>
                <span className="text-xs">{isSelected ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown fallback for accessibility */}
        <div className="mt-1">
          <select
            id="soil-type-select"
            value={soilType}
            onChange={(e) => onChange({ soil_type: e.target.value as SoilType })}
            required
            className="w-full border border-black p-2.5 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] cursor-pointer text-sm font-medium"
          >
            <option value="">-- Select Soil Type --</option>
            {SOIL_TYPES.map((st) => (
              <option key={st} value={st}>
                {st} Soil
              </option>
            ))}
          </select>
        </div>

        {soilType === 'Other' && (
          <div className="bg-yellow-50 border border-yellow-400 p-3 mt-2">
            <label htmlFor="custom-soil-input" className="font-bold text-black text-xs block mb-1">
              Specify Custom Soil Type *
            </label>
            <input
              id="custom-soil-input"
              type="text"
              placeholder="e.g. Peaty, Saline, Silt, Chalky..."
              value={customSoilType}
              onChange={(e) => onChange({ custom_soil_type: e.target.value })}
              required
              className="w-full border border-black p-2.5 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
            />
          </div>
        )}
      </div>

      {/* Irrigation Type Selection (Radio / Dropdown) */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-black text-sm">
          💧 {t('irrigationTypeLabel')} *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {IRRIGATION_TYPES.map((type) => {
            const isSelected = irrigationType === type;
            return (
              <label
                key={type}
                className={`p-3 border text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${isSelected
                    ? 'bg-[#003366] text-white border-black ring-2 ring-yellow-300'
                    : 'bg-white text-black border-black hover:bg-slate-50'
                  }`}
              >
                <input
                  type="radio"
                  name="irrigation_type_radio"
                  value={type}
                  checked={isSelected}
                  onChange={() => onChange({ irrigation_type: type })}
                  className="accent-[#003366]"
                />
                <span>{type}</span>
              </label>
            );
          })}
        </div>

        {irrigationType === 'Other' && (
          <input
            type="text"
            placeholder="Specify Irrigation Method..."
            value={customIrrigationType}
            onChange={(e) => onChange({ custom_irrigation_type: e.target.value })}
            className="mt-2 w-full border border-black p-2.5 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        )}
      </div>
    </div>
  );
}
