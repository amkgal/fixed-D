import { CalculationInputs, CalculationResult, SchedulePeriod, TenorMonth } from '../types/mas';

export const SDIC_COVERAGE_CAP = 100000; // S$100,000 cap per depositor per institution

/**
 * Calculates maturity date by adding tenor months to the start date.
 * Handles month-end clamping (e.g. Aug 31 + 6 months -> Feb 28).
 */
export function calculateMaturityDate(startDateStr: string, months: number): { maturityDateStr: string; days: number } {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day);

  const targetMonth = start.getMonth() + months;
  const targetYear = start.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;

  // Days in target month
  const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const clampedDay = Math.min(day, daysInTargetMonth);

  const maturity = new Date(targetYear, normalizedMonth, clampedDay);

  // Exact difference in calendar days
  const diffTime = maturity.getTime() - start.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const pad = (n: number) => String(n).padStart(2, '0');
  const maturityDateStr = `${maturity.getFullYear()}-${pad(maturity.getMonth() + 1)}-${pad(maturity.getDate())}`;

  return { maturityDateStr, days };
}

/**
 * Formats currency in SGD format: S$ 12,345.67
 */
export function formatSGD(amount: number, includeDecimals = true): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Formats percentage: 2.85%
 */
export function formatPercent(rate: number, decimals = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Main Singapore Fixed Deposit Calculation Engine
 */
export function calculateFixedDeposit(
  inputs: CalculationInputs,
  sourceDescription: string,
  rateToUse: number
): CalculationResult {
  const { principal, tenorMonths, compounding, startDate, dayCountConvention } = inputs;
  const { maturityDateStr, days } = calculateMaturityDate(startDate, tenorMonths);
  const divisor = dayCountConvention === 'act_360' ? 360 : 365;

  let totalInterest = 0;
  let maturityAmount = principal;
  let effectiveAnnualRate = rateToUse;
  const schedule: SchedulePeriod[] = [];

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const startDateObj = new Date(startYear, startMonth - 1, startDay);

  if (compounding === 'maturity') {
    // Simple Interest at maturity (Standard for SGD Fixed Deposits <= 12 months)
    totalInterest = principal * (rateToUse / 100) * (days / divisor);
    maturityAmount = principal + totalInterest;
    effectiveAnnualRate = rateToUse;

    // Single schedule row
    schedule.push({
      period: 1,
      date: maturityDateStr,
      openingBalance: principal,
      interestEarned: totalInterest,
      closingBalance: maturityAmount,
    });
  } else {
    // Compounded interest
    let periodsPerYear = 1;
    let totalPeriods = 1;

    if (compounding === 'monthly') {
      periodsPerYear = 12;
      totalPeriods = tenorMonths;
    } else if (compounding === 'quarterly') {
      periodsPerYear = 4;
      totalPeriods = Math.max(1, Math.round(tenorMonths / 3));
    } else if (compounding === 'annually') {
      periodsPerYear = 1;
      totalPeriods = Math.max(1, Math.round(tenorMonths / 12));
    }

    const periodicRate = rateToUse / 100 / periodsPerYear;
    // Calculate EAR: (1 + r/n)^n - 1
    effectiveAnnualRate = (Math.pow(1 + periodicRate, periodsPerYear) - 1) * 100;

    let currentBalance = principal;
    const monthsPerPeriod = tenorMonths / totalPeriods;

    for (let p = 1; p <= totalPeriods; p++) {
      const periodInterest = currentBalance * periodicRate;
      const periodClosing = currentBalance + periodInterest;

      // Approximate period date
      const periodDateObj = new Date(startDateObj);
      periodDateObj.setMonth(startDateObj.getMonth() + Math.round(p * monthsPerPeriod));
      const pad = (n: number) => String(n).padStart(2, '0');
      const periodDateStr = `${periodDateObj.getFullYear()}-${pad(periodDateObj.getMonth() + 1)}-${pad(periodDateObj.getDate())}`;

      schedule.push({
        period: p,
        date: p === totalPeriods ? maturityDateStr : periodDateStr,
        openingBalance: currentBalance,
        interestEarned: periodInterest,
        closingBalance: periodClosing,
      });

      currentBalance = periodClosing;
    }

    totalInterest = currentBalance - principal;
    maturityAmount = currentBalance;
  }

  // Daily interest accrual rate
  const dailyInterest = totalInterest / Math.max(1, days);
  // Monthly equivalent
  const monthlyEquivalent = totalInterest / Math.max(1, tenorMonths);

  // SDIC scheme coverage calculation
  const isSdicFullyCovered = principal <= SDIC_COVERAGE_CAP;
  const uninsuredAmount = Math.max(0, principal - SDIC_COVERAGE_CAP);

  return {
    principal,
    tenorMonths,
    nominalRate: rateToUse,
    effectiveAnnualRate,
    days,
    totalInterest,
    maturityAmount,
    dailyInterest,
    monthlyEquivalent,
    startDate,
    maturityDate: maturityDateStr,
    compounding,
    isSdicFullyCovered,
    sdicCoverageCap: SDIC_COVERAGE_CAP,
    uninsuredAmount,
    schedule,
    sourceDescription,
  };
}

/**
 * Resolves the applicable rate given input parameters and available datasets
 */
export function resolveRate(
  inputs: CalculationInputs,
  masRecords: import('../types/mas').MasYearlyRateRecord[],
  institutions: import('../types/mas').InstitutionRate[]
): { rate: number; label: string } {
  const { rateSource, tenorMonths, customRate, selectedInstitutionId, selectedYear } = inputs;

  if (rateSource === 'custom') {
    return {
      rate: customRate,
      label: 'User Custom Rate',
    };
  }

  if (rateSource === 'institution' && selectedInstitutionId) {
    const inst = institutions.find((i) => i.id === selectedInstitutionId);
    if (inst) {
      // Check if special promo exists for this tenor
      if (inst.specialPromoRate && inst.specialPromoRate.tenor === tenorMonths && inputs.principal >= inst.specialPromoRate.minDeposit) {
        return {
          rate: inst.specialPromoRate.rate,
          label: `${inst.shortName} (${inst.specialPromoRate.promoName})`,
        };
      }
      const boardRate = inst.rates[tenorMonths] ?? inst.rates[12] ?? 2.5;
      return {
        rate: boardRate,
        label: `${inst.shortName} Board Rate`,
      };
    }
  }

  // MAS Benchmark lookups
  const record = masRecords.find((r) => r.year === selectedYear) || masRecords[0];

  if (rateSource === 'mas_finance_yearly') {
    let rate = record.finance_fixed_dep_12m;
    if (tenorMonths <= 3) rate = record.finance_fixed_dep_3m;
    else if (tenorMonths <= 6) rate = record.finance_fixed_dep_6m;
    else rate = record.finance_fixed_dep_12m;

    return {
      rate,
      label: `MAS Finance Companies Yearly Benchmark (${record.year} - ${tenorMonths}M)`,
    };
  }

  // mas_bank_yearly default
  let rate = record.bank_fixed_dep_12m;
  if (tenorMonths <= 1) rate = record.bank_fixed_dep_1m;
  else if (tenorMonths <= 3) rate = record.bank_fixed_dep_3m;
  else if (tenorMonths <= 6) rate = record.bank_fixed_dep_6m;
  else rate = record.bank_fixed_dep_12m;

  return {
    rate,
    label: `MAS Commercial Banks Yearly Benchmark (${record.year} - ${tenorMonths}M)`,
  };
}
