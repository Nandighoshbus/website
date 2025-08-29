import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const generateTokens = (userId: string) => {
  const payload = { sub: userId };
  console.log('=== TOKEN GENERATION DEBUG ===');
  console.log('Generating tokens for userId:', userId);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET);
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  } as jwt.SignOptions);

  console.log('Access token generated:', accessToken ? `${accessToken.substring(0, 20)}...` : 'FAILED');
  console.log('Refresh token generated:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'FAILED');

  return { accessToken, refreshToken };
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateBookingReference = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `NBS${timestamp}${randomPart}`.toUpperCase();
};

export const generateAgentCode = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36).substring(-4);
  return `AGT${timestamp}${randomPart}`.toUpperCase();
};

export const generateScheduleCode = (routeCode: string, departureTime: string): string => {
  const timePart = departureTime.replace(':', '');
  const randomPart = Math.random().toString(36).substring(2, 4);
  return `${routeCode}-${timePart}-${randomPart}`.toUpperCase();
};

export const validateIndianPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const calculateTax = (amount: number, taxRate = 0.05): number => {
  return Math.round((amount * taxRate) * 100) / 100;
};

export const calculateDiscountedPrice = (originalPrice: number, discountPercent: number): number => {
  const discount = (originalPrice * discountPercent) / 100;
  return Math.round((originalPrice - discount) * 100) / 100;
};

export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const maskPhoneNumber = (phone: string): string => {
  if (phone.length !== 10) return phone;
  return `${phone.substring(0, 2)}****${phone.substring(6)}`;
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (!username || username.length <= 2) return email;
  
  const maskedUsername = `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}`;
  return `${maskedUsername}@${domain}`;
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const sanitizeSearchQuery = (query: string): string => {
  // Remove special characters that might be used for SQL injection
  return query.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const parseTimeString = (timeString: string): { hours: number; minutes: number; seconds: number } => {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const seconds = parseInt(parts[2] || '0', 10);
  return { hours, minutes, seconds };
};

export const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

export const addMinutesToTime = (timeString: string, minutesToAdd: number): string => {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const getBusinessHours = () => {
  return {
    start: '06:00:00',
    end: '23:00:00',
    timezone: 'Asia/Kolkata'
  };
};

export const isBusinessHours = (time?: Date): boolean => {
  const checkTime = time || new Date();
  const hours = checkTime.getHours();
  const minutes = checkTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  const businessStart = 6 * 60; // 6:00 AM in minutes
  const businessEnd = 23 * 60; // 11:00 PM in minutes
  
  return totalMinutes >= businessStart && totalMinutes <= businessEnd;
};

export const generateApiKey = (length = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
