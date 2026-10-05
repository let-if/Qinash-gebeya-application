export interface SendOtpInput {
  phoneNumber: string;
}

export interface VerifyOtpInput {
  phoneNumber: string;
  code: string;
  shopName?: string;
  preferredLanguage?: 'am' | 'om';
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export interface AuthTokenPayload {
  userId: string;
  phoneNumber: string;
  shopName: string;
}