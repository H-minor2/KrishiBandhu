'use client'

import React, { useState } from 'react';
import { ALL_INDIAN_STATES, INDIA_STATES_DISTRICTS, fetchLocationViaGeocoding } from '../../lib/constants/indiaLocations';
import { getTranslation } from '../../lib/constants/languages';
import { AlertTriangle, MapPin } from 'lucide-react';

interface LocationSelectorProps {
  language: string;
  state: string;
  district: string;
  locationAddress: string;
  isManual: boolean;
  onChange: (fields: Partial<{ state: string; district: string; locationAddress: string; isManual: boolean; latitude?: number; longitude?: number }>) => void;
}

export default function LocationSelector({
  language,
  state,
  district,
  locationAddress,
  isManual,
  onChange
}: LocationSelectorProps) {
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');

  const t = (key: string) => getTranslation(language, key);

  const availableDistricts = state && INDIA_STATES_DISTRICTS[state] ? INDIA_STATES_DISTRICTS[state] : [];

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    onChange({ state: newState, district: '', locationAddress: `${newState}` });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    onChange({ district: newDistrict, locationAddress: `${newDistrict}, ${state}` });
  };

  const handleAutoLocate = async () => {
    setLocating(true);
    setGeoMsg('Detecting location via GPS / Geolocation service...');

    try {
      const loc = await fetchLocationViaGeocoding();
      setLocating(false);
      setGeoMsg('Location successfully updated!');
      
      const updates: any = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        locationAddress: loc.formattedAddress || `${loc.latitude}, ${loc.longitude}`
      };

      if (loc.state && ALL_INDIAN_STATES.includes(loc.state)) {
        updates.state = loc.state;
      }
      if (loc.district) {
        updates.district = loc.district;
      }

      onChange(updates);
    } catch (err: any) {
      setLocating(false);
      setGeoMsg(`Could not fetch auto location. Please select state and district. ${err.message || ''}`);
    }
  };

  return (
    <div className="bg-white border border-black p-5 rounded-none space-y-4">
      <div className="flex flex-wrap justify-between items-center border-b border-black pb-2 gap-2">
        <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#003366]" />
          {t('locationTitle')}
        </h3>
        
        {/* Toggle Manual / Cascade mode */}
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
          <input
            type="checkbox"
            checked={isManual}
            onChange={(e) => onChange({ isManual: e.target.checked })}
            className="w-4 h-4 text-[#003366] rounded-none focus:ring-2 focus:ring-[#003366]"
          />
          <span>{t('manualInputToggle')}</span>
        </label>
      </div>

      {geoMsg && (
        <div className={`text-sm font-bold p-3 flex items-center gap-2 ${geoMsg.includes('Could not') ? 'bg-red-100 text-red-800 border border-red-600' : 'bg-green-100 text-green-800 border border-green-600'}`}>
          {geoMsg.includes('Could not') ? <AlertTriangle className="w-4 h-4 shrink-0" /> : null}
          <span>{geoMsg}</span>
        </div>
      )}

      {isManual ? (
        /* Manual Address Input */
        <div className="flex flex-col gap-1.5">
          <label htmlFor="manual-address" className="font-bold text-black text-sm">
            {t('manualAddressLabel')} *
          </label>
          <textarea
            id="manual-address"
            rows={3}
            placeholder="Enter your complete District, Tehsil, Village or Postal location address..."
            value={locationAddress}
            onChange={(e) => onChange({ locationAddress: e.target.value })}
            required
            className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>
      ) : (
        /* State -> District Cascading Dropdowns */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="state-select" className="font-bold text-black text-sm">
              {t('stateLabel')} *
            </label>
            <select
              id="state-select"
              value={state}
              onChange={handleStateChange}
              required
              className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] cursor-pointer"
            >
              <option value="">-- Select State --</option>
              {ALL_INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="district-select" className="font-bold text-black text-sm">
              {t('districtLabel')} *
            </label>
            <select
              id="district-select"
              value={district}
              onChange={handleDistrictChange}
              disabled={!state}
              required
              className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{state ? '-- Select District --' : '-- First Select State --'}</option>
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Auto Location / GPS / Google Maps integration trigger */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleAutoLocate}
          disabled={locating}
          className="bg-white text-[#003366] border border-black px-4 py-2 text-sm font-bold cursor-pointer rounded-none hover:bg-slate-100 flex items-center gap-2 outline-none focus:ring-2 focus:ring-yellow-300"
        >
          {locating ? '⌛ Locating Coordinates...' : t('fetchGpsLocation')}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          * Prepared for future Google Maps API & automatic Reverse Geocoding.
        </p>
      </div>
    </div>
  );
}
