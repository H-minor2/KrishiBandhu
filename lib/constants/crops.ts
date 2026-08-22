import { IrrigationType, LandUnit, SoilType } from "../supabase/types";

export const CROP_OPTIONS = [
  "Rice",
  "Wheat",
  "Maize",
  "Cotton",
  "Pulses",
  "Vegetables",
  "Other"
] as const;

export const IRRIGATION_TYPES: IrrigationType[] = [
  "Rain-fed",
  "Canal",
  "Borewell",
  "Tube well",
  "Drip",
  "Sprinkler",
  "Other"
];

export const SOIL_TYPES: SoilType[] = [
  "Alluvial",
  "Black",
  "Red",
  "Laterite",
  "Sandy",
  "Clay",
  "Loamy",
  "Other"
];

export const LAND_UNITS: LandUnit[] = [
  "Acre",
  "Hectare",
  "Bigha"
];

export function filterCrops(query: string): string[] {
  if (!query) return [...CROP_OPTIONS];
  const q = query.toLowerCase().trim();
  return CROP_OPTIONS.filter((c) => c.toLowerCase().includes(q));
}
