import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Calendar,
  Clock,
  Coins,
  Copy,
  Check,
  ListOrdered,
  Info,
} from 'lucide-react';
import { CalculationResult } from '../types/mas';
import { formatSGD, formatPercent } from '../utils/calculator';

interface CalculationSummaryProps {
  result: CalculationResult;
  onOpenSchedule: () => void;
}

export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  result,
  onOpenSchedule,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = async () => {
    const text = `Singapore Fixed Deposit Summary
------------------------------------
Principal: ${formatSGD(result.principal)}
Tenor: ${result.tenorMonths} Months (${result.days} calendar days)
Annual Rate: ${formatPercent(result.nominalRate)} p.a.
Effective Annual Rate (EAR): ${formatPercent(result.effectiveAnnualRate)}
Deposit Period: ${result.startDate} to ${result.maturityDate}
Total Interest Earned: ${formatSGD(result.totalInterest)}
Total Maturity Value: ${formatSGD(result.maturityAmount)}
Daily Interest: ${formatSGD(result.dailyInterest)}/day
Benchmark/Source: ${result.sourceDescription}
SDIC Status: ${result.isSdicFullyCovered ? '100% Insured (Up to S$100,000)' : `S$100,000 Insured, ${formatSGD(result.uninsuredAmount)} Uninsured`}
Tax Status: 100% Tax-Free (IRAS Individual Exemption)
------------------------------------
Calculated via SingDeposit (MAS Statistical Benchmark Engine)`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-7 shadow-md space-y-6">
      {/* Top Source kicker */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate pr-2">
          <span>Singapore Fixed Deposit</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-300 font-medium truncate">{result.sourceDescription}</span>
        </div>
        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors shrink-0"
          title="Copy Calculation Summary"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Hero Figures */}
      <div>
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
          Total Interest Earned
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
            {formatSGD(result.totalInterest)}
          </span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            +{formatPercent(result.nominalRate)} p.a.
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-baseline justify-between">
          <span className="text-xs text-slate-400">Total Payout at Maturity</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            {formatSGD(result.maturityAmount)}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-800">
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">Effective Yield (EAR)</span>
          <span className="text-sm font-semibold font-mono text-slate-100 tabular-nums">
            {formatPercent(result.effectiveAnnualRate)}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">Daily Accrual</span>
          <span className="text-sm font-semibold font-mono text-slate-100 tabular-nums">
            {formatSGD(result.dailyInterest)}/d
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">Maturity Date</span>
          <span className="text-sm font-semibold font-mono text-slate-100 tabular-nums">
            {result.maturityDate}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">Deposit Duration</span>
          <span className="text-sm font-semibold font-mono text-slate-100 tabular-nums">
            {result.days} Days ({result.tenorMonths}M)
          </span>
        </div>
      </div>

      {/* Singapore Regulatory & SDIC Protection Card */}
      <div className="space-y-2.5">
        <div
          className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            result.isSdicFullyCovered
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
          }`}
        >
          {result.isSdicFullyCovered ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-semibold text-white">
              {result.isSdicFullyCovered
                ? '100% Protected by SDIC (Singapore)'
                : 'SDIC Cap Exceeded: Consider Splitting'}
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {result.isSdicFullyCovered
                ? `Singapore Deposit Insurance Scheme covers SGD deposits up to S$100,000 per depositor per bank/finance company. Your entire ${formatSGD(result.principal)} deposit is fully insured.`
                : `S$100,000 is covered by SDIC. The remaining ${formatSGD(result.uninsuredAmount)} is uninsured. To maintain 100% protection, consider splitting across multiple licensed banks or finance companies.`}
            </p>
          </div>
        </div>

        {/* IRAS Individual Tax Exemption note */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-500" />
            IRAS Tax Exemption
          </span>
          <span className="text-slate-300 font-medium">
            100% Tax-Free for Individuals
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSchedule}
          className="flex-1 py-2.5 px-3 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
        >
          <ListOrdered className="w-3.5 h-3.5" />
          View Accrual Timeline
        </button>
      </div>
    </div>
  );
};
