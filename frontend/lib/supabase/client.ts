import { createClient } from '@supabase/supabase-js';
import { FarmerProfile, FarmerCropData, FullRegistrationState } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const MOCK_STORAGE_KEY_PROFILE = 'krishibandhu_farmer_profile';
const MOCK_STORAGE_KEY_CROPS = 'krishibandhu_farmer_crops';

// Fallback UUID generator for mobile browsers that do not support crypto.randomUUID()
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function registerFarmerAndCrop(data: FullRegistrationState): Promise<{ success: boolean; profile?: FarmerProfile; crop?: FarmerCropData; error?: string }> {
  try {
    // Generate valid UUID for Postgres compliance
    const validUserUuid = generateUUID();

    const profilePayload: FarmerProfile = {
      id: validUserUuid,
      full_name: data.full_name,
      mobile_number: data.mobile_number,
      preferred_language: data.language,
      state: data.state,
      district: data.district,
      annual_income: data.annual_income || 60000,
      location_address: data.location_address,
      latitude: data.latitude || null,
      longitude: data.longitude || null
    };

    if (isSupabaseConfigured && supabase) {
      // 1. Try Supabase Auth (Email / Mobile)
      try {
        const dummyEmail = `${data.mobile_number.replace(/\D/g, '')}@krishibandhu.in`;
        const userPassword = data.password || `KB#${data.mobile_number.slice(-4)}!2026`;

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: userPassword,
          options: {
            data: {
              full_name: data.full_name,
              mobile_number: data.mobile_number
            }
          }
        });

        if (!authError && authData?.user?.id) {
          profilePayload.id = authData.user.id;
        } else if (authError && authError.message.includes('already registered')) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password: userPassword
          });
          if (signInData?.user?.id) profilePayload.id = signInData.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase Auth skipped or provider disabled:', authErr);
      }

      // 2. Insert into Supabase Postgres profiles table
      try {
        const { data: profileRes, error: profileError } = await supabase
          .from('profiles')
          .upsert(profilePayload)
          .select()
          .single();

        if (profileError) {
          console.error('❌ Supabase profile insertion error:', profileError.message, profileError);
        } else if (profileRes) {
          console.log('✅ Profile successfully stored in Supabase Postgres:', profileRes);
          profilePayload.id = profileRes.id;
        }
      } catch (dbErr) {
        console.error('Profile DB insert catch error:', dbErr);
      }

      // 3. Insert into Supabase Postgres farmer_crops table
      const cropPayloadForDb: any = {
        user_id: profilePayload.id,
        crop_name: data.crop_name,
        custom_crop_name: data.crop_name === 'Other' ? data.custom_crop_name : undefined,
        land_size: Number(data.land_size) || 0,
        land_unit: data.land_unit,
        sowing_date: data.sowing_date,
        irrigation_type: data.irrigation_type === 'Other' && data.custom_irrigation_type ? data.custom_irrigation_type : data.irrigation_type,
        soil_type: data.soil_type === 'Other' && data.custom_soil_type ? data.custom_soil_type : data.soil_type,
        expected_harvest_date: data.expected_harvest_date,
        loan_amount: Number(data.loan_amount) || 0,
        outstanding_loan_amount: Number(data.outstanding_loan_amount) || 0,
        loan_due_date: data.loan_due_date
      };

      let finalCrop: FarmerCropData = {
        ...cropPayloadForDb,
        id: generateUUID()
      };

      try {
        const { data: cropRes, error: cropError } = await supabase
          .from('farmer_crops')
          .insert(cropPayloadForDb)
          .select()
          .single();

        if (cropError) {
          console.error('❌ Supabase crop insertion error:', cropError.message, cropError);
        } else if (cropRes) {
          console.log('✅ Crop details successfully stored in Supabase Postgres:', cropRes);
          finalCrop = cropRes;
        }
      } catch (dbErr) {
        console.error('Crop DB insert catch error:', dbErr);
      }

      // Mirror to localStorage for client state persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(profilePayload));
        localStorage.setItem(MOCK_STORAGE_KEY_CROPS, JSON.stringify([finalCrop]));
      }

      return { success: true, profile: profilePayload, crop: finalCrop };
    } else {
      // Offline / LocalStorage Mock Fallback
      const cropPayload: FarmerCropData = {
        id: generateUUID(),
        user_id: profilePayload.id,
        crop_name: data.crop_name,
        custom_crop_name: data.crop_name === 'Other' ? data.custom_crop_name : undefined,
        land_size: Number(data.land_size) || 0,
        land_unit: data.land_unit,
        sowing_date: data.sowing_date,
        irrigation_type: data.irrigation_type,
        soil_type: data.soil_type,
        loan_amount: Number(data.loan_amount) || 0,
        outstanding_loan_amount: Number(data.outstanding_loan_amount) || 0,
        loan_due_date: data.loan_due_date,
        created_at: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(profilePayload));
        localStorage.setItem(MOCK_STORAGE_KEY_CROPS, JSON.stringify([cropPayload]));
      }

      return { success: true, profile: profilePayload, crop: cropPayload };
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    return { success: false, error: err.message || 'Error saving registration data.' };
  }
}

export async function loginFarmer(mobileNumber: string, password?: string): Promise<{ success: boolean; profile?: FarmerProfile; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

      if (profile) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(profile));
        }
        return { success: true, profile };
      }
    }

    if (typeof window !== 'undefined') {
      const storedProfileStr = localStorage.getItem(MOCK_STORAGE_KEY_PROFILE);
      if (storedProfileStr) {
        const profile = JSON.parse(storedProfileStr);
        return { success: true, profile };
      }
    }

    const mockProfile: FarmerProfile = {
      id: generateUUID(),
      full_name: 'Registered Farmer',
      mobile_number: mobileNumber,
      preferred_language: 'en',
      state: 'Punjab',
      district: 'Ludhiana',
      location_address: 'Ludhiana, Punjab',
      created_at: new Date().toISOString()
    };
    return { success: true, profile: mockProfile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed.' };
  }
}

export async function fetchFarmerDashboardData(): Promise<{ profile: FarmerProfile | null; crops: FarmerCropData[] }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const local = getStoredFarmerData();
      const profileId = local.profile?.id;
      const mobileNumber = local.profile?.mobile_number;

      let query = supabase.from('profiles').select('*');
      if (profileId) {
        query = query.eq('id', profileId);
      } else if (mobileNumber) {
        query = query.eq('mobile_number', mobileNumber);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data: profile } = await query.maybeSingle();

      if (profile) {
        const { data: crops } = await supabase
          .from('farmer_crops')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (typeof window !== 'undefined') {
          localStorage.setItem(MOCK_STORAGE_KEY_PROFILE, JSON.stringify(profile));
          if (crops) localStorage.setItem(MOCK_STORAGE_KEY_CROPS, JSON.stringify(crops));
        }
        return { profile, crops: crops || [] };
      }
    }
  } catch (err) {
    console.warn('Supabase fetch error, using local fallback:', err);
  }

  return getStoredFarmerData();
}

export async function addNewCropToSupabase(cropData: Partial<FarmerCropData>): Promise<{ success: boolean; crop?: FarmerCropData; error?: string }> {
  try {
    const localData = getStoredFarmerData();
    const userId = localData.profile?.id || generateUUID();

    const payloadForDb: any = {
      user_id: userId,
      crop_name: cropData.crop_name || 'Rice',
      custom_crop_name: cropData.custom_crop_name,
      land_size: Number(cropData.land_size) || 0,
      land_unit: cropData.land_unit || 'Acre',
      sowing_date: cropData.sowing_date || new Date().toISOString().split('T')[0],
      irrigation_type: cropData.irrigation_type || 'Rain-fed',
      soil_type: cropData.soil_type || 'Alluvial',
      expected_harvest_date: cropData.expected_harvest_date || new Date().toISOString().split('T')[0],
      loan_amount: Number(cropData.loan_amount) || 0,
      outstanding_loan_amount: Number(cropData.outstanding_loan_amount) || 0,
      loan_due_date: cropData.loan_due_date || new Date().toISOString().split('T')[0]
    };

    let finalCrop: FarmerCropData = {
      ...payloadForDb,
      id: generateUUID()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: cropRes, error: cropError } = await supabase
          .from('farmer_crops')
          .insert(payloadForDb)
          .select()
          .single();

        if (!cropError && cropRes) {
          finalCrop = cropRes;
        } else if (cropError) {
          console.error('❌ Supabase new crop insertion error:', cropError.message);
        }
      } catch (e) {
        console.warn('Supabase crop insert error:', e);
      }
    }

    return { success: true, crop: finalCrop };
  } catch (err: any) {
    console.warn('Crop insert failed:', err);
    return { success: false, error: err.message };
  }
}

export function getStoredFarmerData(): { profile: FarmerProfile | null; crops: FarmerCropData[] } {
  if (typeof window === 'undefined') return { profile: null, crops: [] };
  try {
    const profileStr = localStorage.getItem(MOCK_STORAGE_KEY_PROFILE);
    const cropsStr = localStorage.getItem(MOCK_STORAGE_KEY_CROPS);

    return {
      profile: profileStr ? JSON.parse(profileStr) : null,
      crops: cropsStr ? JSON.parse(cropsStr) : []
    };
  } catch {
    return { profile: null, crops: [] };
  }
}
