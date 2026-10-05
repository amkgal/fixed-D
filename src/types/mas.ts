export type TenorMonth = 1 | 3 | 6 | 9 | 12 | 18 | 24 | 36;

export interface MasYearlyRateRecord {
  year: number;
  period: string; // e.g. "2025", "2024", "2023"
  // Banks fixed deposit rates (% p.a.)
  bank_fixed_dep_1m: number;
  bank_fixed_dep_3m: number;
  bank_fixed_dep_6m: number;
  bank_fixed_dep_12m: number;
  bank_savings_dep: number;
  bank_prime_lending: number;
  // Finance companies fixed deposit rates (% p.a.)
  finance_fixed_dep_3m: number;
  finance_fixed_dep_6m: number;
  finance_fixed_dep_12m: number;
  finance_savings_dep: number;
}

export type InstitutionType = 'bank' | 'finance_company';

export interface InstitutionRate {
  id: string;
  name: string;
  shortName: string;
  type: InstitutionType;
  sdicInsured: boolean;
  minDeposit: number;
  rates: Partial<Record<TenorMonth, number>>;
  specialPromoRate?: {
    tenor: TenorMonth;
    rate: number;
    minDeposit: number;
    promoName: string;
    expiryDate?: string;
  };
  notes: string;
  website: string;
}

export type RateSource =
  | 'mas_bank_yearly'
  | 'mas_finance_yearly'
  | 'institution'
  | 'custom';

export type CompoundingFrequency = 'maturity' | 'monthly' | 'quarterly' | 'annually';

export interface CalculationInputs {
  principal: number;
  tenorMonths: TenorMonth;
  rateSource: RateSource;
  customRate: number;
  selectedInstitutionId?: string;
  selectedYear: number;
  compounding: CompoundingFrequency;
  startDate: string; // YYYY-MM-DD
  dayCountConvention: 'act_365' | 'act_360';
}

export interface SchedulePeriod {
  period: number;
  date: string;
  openingBalance: number;
  interestEarned: number;
  closingBalance: number;
}

export interface CalculationResult {
  principal: number;
  tenorMonths: TenorMonth;
  nominalRate: number;
  effectiveAnnualRate: number; // APY / EAR
  days: number;
  totalInterest: number;
  maturityAmount: number;
  dailyInterest: number;
  monthlyEquivalent: number;
  startDate: string;
  maturityDate: string;
  compounding: CompoundingFrequency;
  isSdicFullyCovered: boolean;
  sdicCoverageCap: number;
  uninsuredAmount: number;
  schedule: SchedulePeriod[];
  sourceDescription: string;
}

export interface MasBackendConfig {
  endpointUrl: string;
  useLiveBackend: boolean;
  apiKey?: string;
  lastSyncTimestamp?: string;
}
