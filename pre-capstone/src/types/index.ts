export interface IFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  landmark: string;
  ghanaPostAddress: string;
  region: string;
  city: string;
  area: string;
  idType: string;
  idNumber: string;
  idCardFile: File | null;
  idExpiry: string;
  selfieFile: File | null;
}

export interface VerificationData {
  success: boolean;
  message: string;
  details?: string[];
  ocrDetails?: string[];
  facialDetails?: string[];
  confidence?: number;
}

export const REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Bono',
  'Bono East',
  'Ahafo',
  'Western North',
  'Oti',
  'Savannah',
  'North East'
] as const;

export const ID_TYPES = [
  'Ghana Card',
  'Passport',
  'Voter\'s ID',
  'Driver\'s License',
  'NHIS Card'
] as const;

export type Region = typeof REGIONS[number];
export type IDType = typeof ID_TYPES[number];