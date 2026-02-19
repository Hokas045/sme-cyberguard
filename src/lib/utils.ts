import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Data formatting utilities
export const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat('en-US', options).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// String utilities
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number = 50) => {
  return str.length > length ? str.slice(0, length) + '...' : str;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

// Threat severity utilities
export const getSeverityColor = (severity: string) => {
  const colors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-gray-600',
  };
  return colors[severity as keyof typeof colors] || colors.low;
};

export const getSeverityBadgeVariant = (severity: string) => {
  const variants = {
    critical: 'destructive',
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
  };
  return variants[severity as keyof typeof variants] || variants.low;
};

// Device status utilities
export const getDeviceStatusColor = (status: string) => {
  const colors = {
    online: 'text-green-600',
    offline: 'text-gray-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };
  return colors[status as keyof typeof colors] || colors.offline;
};

// UUID generation (for IDs)
export const generateId = () => {
  return crypto.randomUUID();
};

// Currency conversion utilities
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  KES: 130,
  CAD: 1.25,
  AUD: 1.35,
  JPY: 150,
  INR: 83,
  ZAR: 18,
  NGN: 1600,
  BRL: 5.5,
  MXN: 20,
  ARS: 950,
  CLP: 950,
  COP: 4100,
  PEN: 3.8,
  CHF: 0.9,
  SEK: 11,
  NOK: 11,
  DKK: 7.5,
  PLN: 4.5,
  CZK: 25,
  HUF: 400,
  TRY: 34,
  RUB: 100,
  CNY: 7.3,
  KRW: 1400,
  THB: 37,
  MYR: 4.7,
  SGD: 1.35,
  PHP: 58,
  IDR: 16000,
  VND: 25000,
  EGP: 50,
  MAD: 10,
  TND: 3.1,
  GHS: 15,
  TZS: 2700,
  UGX: 3800,
  RWF: 1300,
  ETB: 120,
  SDG: 600,
  LYD: 4.8,
  DZD: 140,
  AOA: 900,
  MZN: 65,
  ZWD: 350,
  BWP: 14,
  NAD: 18,
  ZMW: 25,
  MWK: 1700,
  LSL: 18,
  SZL: 18,
};

export const convertFromUSD = (amount: number, targetCurrency: string): number => {
  const rate = exchangeRates[targetCurrency] || 1;
  return amount * rate;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    INR: '₹',
    ZAR: 'R',
    NGN: '₦',
    BRL: 'R$',
    MXN: '$',
    ARS: '$',
    CLP: '$',
    COP: '$',
    PEN: 'S/',
    CHF: 'CHF',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    TRY: '₺',
    RUB: '₽',
    CNY: '¥',
    KRW: '₩',
    THB: '฿',
    MYR: 'RM',
    SGD: 'S$',
    PHP: '₱',
    IDR: 'Rp',
    VND: '₫',
    EGP: '£',
    MAD: 'DH',
    TND: 'DT',
    GHS: '₵',
    TZS: 'TSh',
    UGX: 'USh',
    RWF: 'RF',
    ETB: 'Br',
    SDG: '£',
    LYD: 'LD',
    DZD: 'DA',
    AOA: 'Kz',
    MZN: 'MT',
    ZWD: '$',
    BWP: 'P',
    NAD: '$',
    ZMW: 'ZK',
    MWK: 'MK',
    LSL: 'L',
    SZL: 'E',
  };
  return symbols[currencyCode] || '$';
};
