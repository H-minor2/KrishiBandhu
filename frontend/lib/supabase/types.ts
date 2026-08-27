export type LandUnit = 'Acre' | 'Hectare' | 'Bigha';

export type IrrigationType = 
  | 'Rain-fed' 
  | 'Canal' 
  | 'Borewell' 
  | 'Tube well' 
  | 'Drip' 
  | 'Sprinkler' 
  | 'Other';

export type SoilType = 
  | 'Alluvial' 
  | 'Black' 
  | 'Red' 
  | 'Laterite' 
  | 'Sandy' 
  | 'Clay' 
  | 'Loamy' 
  | 'Other';

export interface FarmerProfile {
  id?: string;
  full_name: string;
  mobile_number: string;
  preferred_language: string;
  state: string;
  district: string;
  pincode?: string;
  location_address?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface FarmerCropData {
  id?: string;
  user_id?: string;
  crop_name: string;
  custom_crop_name?: string;
  land_size: number;
  land_unit: LandUnit;
  sowing_date: string;
  irrigation_type: IrrigationType;
  soil_type: SoilType;
  expected_harvest_date: string;
  loan_amount: number;
  loan_due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface FullRegistrationState {
  // Step 1: Language
  language: string;
  
  // Step 2: Account Details
  full_name: string;
  mobile_number: string;
  password?: string;

  // Step 3: Location
  is_manual_location: boolean;
  state: string;
  district: string;
  location_address: string;
  latitude?: number | null;
  longitude?: number | null;

  // Step 4: Crop & Land Size
  crop_name: string;
  custom_crop_name: string;
  land_size: number | '';
  land_unit: LandUnit;

  // Step 5: Sowing, Soil, Irrigation, Harvest
  sowing_date: string;
  irrigation_type: IrrigationType;
  custom_irrigation_type?: string;
  soil_type: SoilType;
  custom_soil_type?: string;
  expected_harvest_date: string;

  // Step 6: Financial / Loan Info
  loan_amount: number | '';
  loan_due_date: string;
}
