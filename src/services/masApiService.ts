import { DEFAULT_MAS_YEARLY_RATES } from '../data/masData';
import { MasBackendConfig, MasYearlyRateRecord } from '../types/mas';

const STORAGE_KEY_CONFIG = 'singdeposit_backend_config';

export const DEFAULT_CONFIG: MasBackendConfig = {
  endpointUrl: import.meta.env.VITE_MAS_BACKEND_URL || '/api/fixedd',
  useLiveBackend: false,
};

export function getStoredBackendConfig(): MasBackendConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to read config from localStorage', err);
  }
  return DEFAULT_CONFIG;
}

export function saveBackendConfig(config: MasBackendConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save config to localStorage', err);
  }
}

/**
 * Normalizes raw records from either MAS Datastore or custom backend into MasYearlyRateRecord[]
 */
export function normalizeMasRecords(rawRecords: any[]): MasYearlyRateRecord[] {
  if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
    return DEFAULT_MAS_YEARLY_RATES;
  }

  return rawRecords.map((r, index) => {
    const year = Number(r.year || r.period || (2025 - index));
    return {
      year,
      period: String(r.period || r.year || `${year}`),
      bank_fixed_dep_1m: Number(r.bank_fixed_dep_1m ?? r.bank_1m ?? 2.45),
      bank_fixed_dep_3m: Number(r.bank_fixed_dep_3m ?? r.bank_3m ?? 2.70),
      bank_fixed_dep_6m: Number(r.bank_fixed_dep_6m ?? r.bank_6m ?? 2.85),
      bank_fixed_dep_12m: Number(r.bank_fixed_dep_12m ?? r.bank_12m ?? 2.95),
      bank_savings_dep: Number(r.bank_savings_dep ?? r.bank_savings ?? 0.18),
      bank_prime_lending: Number(r.bank_prime_lending ?? r.prime_lending ?? 5.25),
      finance_fixed_dep_3m: Number(r.finance_fixed_dep_3m ?? r.fc_3m ?? 2.90),
      finance_fixed_dep_6m: Number(r.finance_fixed_dep_6m ?? r.fc_6m ?? 3.10),
      finance_fixed_dep_12m: Number(r.finance_fixed_dep_12m ?? r.fc_12m ?? 3.25),
      finance_savings_dep: Number(r.finance_savings_dep ?? r.fc_savings ?? 0.25),
    };
  }).sort((a, b) => b.year - a.year);
}

export interface FetchResult {
  records: MasYearlyRateRecord[];
  isLiveBackend: boolean;
  statusMessage: string;
  timestamp: string;
  sourceUrl?: string;
  rawResponse?: any;
}

/**
 * Fetches MAS yearly rates either from live backend or from bundled MAS Table I.1 statistical dataset
 */
export async function fetchMasRates(config: MasBackendConfig): Promise<FetchResult> {
  const timestamp = new Date().toISOString();

  if (!config.useLiveBackend) {
    return {
      records: DEFAULT_MAS_YEARLY_RATES,
      isLiveBackend: false,
      statusMessage: 'Loaded from local MAS Table I.1 statistical database (Offline / Standalone mode).',
      timestamp,
    };
  }

  try {
    const response = await fetch(config.endpointUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(config.apiKey ? { KeyId: config.apiKey, Authorization: `Bearer ${config.apiKey}` } : {}),
      },
    });

    const json = await response.json();

    if (!response.ok) {
      const errMsg = json?.message || json?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errMsg);
    }

    // Check if it's normalized records, MAS Datastore shape (result.records), or flat array
    const rawList = json.records || json.result?.records || json.data || (Array.isArray(json) ? json : null);

    if (!rawList) {
      throw new Error('Unexpected response format. Expected an array or { result: { records: [...] } }');
    }

    const normalized = normalizeMasRecords(rawList);

    return {
      records: normalized,
      isLiveBackend: true,
      statusMessage: `Successfully retrieved ${normalized.length} MAS yearly rate records from backend.`,
      timestamp,
      sourceUrl: config.endpointUrl,
      rawResponse: json,
    };
  } catch (error: any) {
    console.error('MAS backend fetch failed, falling back to cached baseline:', error);
    return {
      records: DEFAULT_MAS_YEARLY_RATES,
      isLiveBackend: false,
      statusMessage: `Backend connection error (${error?.message || 'Network error'}). Fell back to bundled MAS data.`,
      timestamp,
      sourceUrl: config.endpointUrl,
    };
  }
}
