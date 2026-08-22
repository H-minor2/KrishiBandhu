'use client'

import React from 'react';
import { LAND_UNITS } from '../../lib/constants/crops';
import { LandUnit } from '../../lib/supabase/types';
import { getTranslation } from '../../lib/constants/languages';

interface LandDetailsInputProps {
  language: string;
  landSize: number | '';
  landUnit: LandUnit;
  onChange: (fields: Partial<{ land_size: number | ''; land_unit: LandUnit }>) => void;
}

export default function LandDetailsInput({
  language,
  landSize,
  landUnit,
  onChange
}: LandDetailsInputProps) {
  const t = (key: string) => getTranslation(language, key);

  return (
    <div className="bg-white border border-black p-5 rounded-none space-y-4">
      <h3 className="text-lg font-bold text-[#003366] border-b border-black pb-2">
        📐 {t('landSizeLabel')} & Unit
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="land-size-input" className="font-bold text-black text-sm">
            {t('landSizeLabel')} *
          </label>
          <input
            id="land-size-input"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 2.5"
            value={landSize}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseFloat(e.target.value);
              onChange({ land_size: val });
            }}
            required
            className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="land-unit-select" className="font-bold text-black text-sm">
            {t('landUnitLabel')} *
          </label>
          <select
            id="land-unit-select"
            value={landUnit}
            onChange={(e) => onChange({ land_unit: e.target.value as LandUnit })}
            required
            className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] cursor-pointer font-bold"
          >
            {LAND_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
