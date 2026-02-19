import { useState, useEffect } from 'react';

interface CurrencyInfo {
  code: string;
  symbol: string;
  convertFromUSD: (amount: number) => number;
}

const currencyMap: Record<string, { code: string; symbol: string; rate: number }> = {
  US: { code: 'USD', symbol: '$', rate: 1 },
  GB: { code: 'GBP', symbol: '£', rate: 0.75 },
  EU: { code: 'EUR', symbol: '€', rate: 0.85 },
  KE: { code: 'KES', symbol: 'KSh', rate: 130 },
  CA: { code: 'CAD', symbol: 'C$', rate: 1.25 },
  AU: { code: 'AUD', symbol: 'A$', rate: 1.35 },
  JP: { code: 'JPY', symbol: '¥', rate: 150 },
  IN: { code: 'INR', symbol: '₹', rate: 83 },
  ZA: { code: 'ZAR', symbol: 'R', rate: 18 },
  NG: { code: 'NGN', symbol: '₦', rate: 1600 },
  BR: { code: 'BRL', symbol: 'R$', rate: 5.5 },
  MX: { code: 'MXN', symbol: '$', rate: 20 },
  AR: { code: 'ARS', symbol: '$', rate: 950 },
  CL: { code: 'CLP', symbol: '$', rate: 950 },
  CO: { code: 'COP', symbol: '$', rate: 4100 },
  PE: { code: 'PEN', symbol: 'S/', rate: 3.8 },
  CH: { code: 'CHF', symbol: 'CHF', rate: 0.9 },
  SE: { code: 'SEK', symbol: 'kr', rate: 11 },
  NO: { code: 'NOK', symbol: 'kr', rate: 11 },
  DK: { code: 'DKK', symbol: 'kr', rate: 7.5 },
  PL: { code: 'PLN', symbol: 'zł', rate: 4.5 },
  CZ: { code: 'CZK', symbol: 'Kč', rate: 25 },
  HU: { code: 'HUF', symbol: 'Ft', rate: 400 },
  TR: { code: 'TRY', symbol: '₺', rate: 34 },
  RU: { code: 'RUB', symbol: '₽', rate: 100 },
  CN: { code: 'CNY', symbol: '¥', rate: 7.3 },
  KR: { code: 'KRW', symbol: '₩', rate: 1400 },
  TH: { code: 'THB', symbol: '฿', rate: 37 },
  MY: { code: 'MYR', symbol: 'RM', rate: 4.7 },
  SG: { code: 'SGD', symbol: 'S$', rate: 1.35 },
  PH: { code: 'PHP', symbol: '₱', rate: 58 },
  ID: { code: 'IDR', symbol: 'Rp', rate: 16000 },
  VN: { code: 'VND', symbol: '₫', rate: 25000 },
  EG: { code: 'EGP', symbol: '£', rate: 50 },
  MA: { code: 'MAD', symbol: 'DH', rate: 10 },
  TN: { code: 'TND', symbol: 'DT', rate: 3.1 },
  GH: { code: 'GHS', symbol: '₵', rate: 15 },
  TZ: { code: 'TZS', symbol: 'TSh', rate: 2700 },
  UG: { code: 'UGX', symbol: 'USh', rate: 3800 },
  RW: { code: 'RWF', symbol: 'RF', rate: 1300 },
  ET: { code: 'ETB', symbol: 'Br', rate: 120 },
  SD: { code: 'SDG', symbol: '£', rate: 600 },
  LY: { code: 'LYD', symbol: 'LD', rate: 4.8 },
  DZ: { code: 'DZD', symbol: 'DA', rate: 140 },
  AO: { code: 'AOA', symbol: 'Kz', rate: 900 },
  MZ: { code: 'MZN', symbol: 'MT', rate: 65 },
  ZW: { code: 'ZWD', symbol: '$', rate: 350 },
  BW: { code: 'BWP', symbol: 'P', rate: 14 },
  NA: { code: 'NAD', symbol: '$', rate: 18 },
  ZM: { code: 'ZMW', symbol: 'ZK', rate: 25 },
  MW: { code: 'MWK', symbol: 'MK', rate: 1700 },
  LS: { code: 'LSL', symbol: 'L', rate: 18 },
  SZ: { code: 'SZL', symbol: 'E', rate: 18 },
};

export const useCurrency = (): CurrencyInfo & { loading: boolean } => {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    code: 'USD',
    symbol: '$',
    convertFromUSD: (amount: number) => amount,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;

        const currencyData = currencyMap[countryCode] || currencyMap.US;

        setCurrency({
          code: currencyData.code,
          symbol: currencyData.symbol,
          convertFromUSD: (amount: number) => amount * currencyData.rate,
        });
      } catch (error) {
        console.error('Failed to fetch location:', error);
        // Fallback to USD
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { ...currency, loading };
};