import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type CurrencyCode = "USD" | "NGN" | "EUR" | "GBP";

interface Currency {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // rate relative to USD
}

// Fallback rates (used if the live fetch fails)
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  NGN: 1382.87,
  EUR: 0.8552,
  GBP: 0.7478,
};

const CURRENCY_META: Omit<Currency, "rate">[] = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
];

const CACHE_KEY = "tx_currency_rates";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedRates {
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
}

function loadCachedRates(): Record<CurrencyCode, number> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedRates = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.rates;
    return null; // expired
  } catch {
    return null;
  }
}

function saveCachedRates(rates: Record<CurrencyCode, number>) {
  try {
    const data: CachedRates = { rates, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage not available — silently ignore
  }
}

async function fetchLiveRates(): Promise<Record<CurrencyCode, number>> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error("Failed to fetch rates");
  const data = await res.json();
  if (data.result !== "success") throw new Error("Bad response from rate API");
  return {
    USD: 1,
    NGN: data.rates.NGN,
    EUR: data.rates.EUR,
    GBP: data.rates.GBP,
  };
}

interface CurrencyContextValue {
  currency: Currency;
  currencies: Currency[];
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (usdPrice: number) => string;
  ratesLoading: boolean;
  ratesError: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);

  useEffect(() => {
    // Try cache first
    const cached = loadCachedRates();
    if (cached) {
      setRates(cached);
      setRatesLoading(false);
      return;
    }

    // Fetch fresh rates
    fetchLiveRates()
      .then((liveRates) => {
        setRates(liveRates);
        saveCachedRates(liveRates);
        setRatesError(false);
      })
      .catch(() => {
        // Keep fallback rates silently
        setRatesError(true);
      })
      .finally(() => {
        setRatesLoading(false);
      });
  }, []);

  const currencies: Currency[] = CURRENCY_META.map((m) => ({
    ...m,
    rate: rates[m.code],
  }));

  const currency = currencies.find((c) => c.code === currencyCode)!;

  const setCurrency = (code: CurrencyCode) => setCurrencyCode(code);

  const formatPrice = (usdPrice: number): string => {
    const converted = usdPrice * currency.rate;
    if (currency.code === "NGN") {
      return `${currency.symbol}${converted.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencies, setCurrency, formatPrice, ratesLoading, ratesError }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
