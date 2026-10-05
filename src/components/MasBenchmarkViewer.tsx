import React, { useState } from 'react';
import {
  TrendingUp,
  Landmark,
  Building2,
  Calendar,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import { MasYearlyRateRecord, TenorMonth } from '../types/mas';
import { MAS_TABLE_METADATA } from '../data/masData';
import { formatPercent } from '../utils/calculator';

interface MasBenchmarkViewerProps {
  records: MasYearlyRateRecord[];
  onSelectBenchmark: (year: number, source: 'mas_bank_yearly' | 'mas_finance_yearly', tenor: TenorMonth) => void;
}

export const MasBenchmarkViewer: React.FC<MasBenchmarkViewerProps> = ({
  records,
  onSelectBenchmark,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(records[0]?.year || 2025);

  const activeRecord = records.find((r) => r.year === selectedYear) || records[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      {/* Title & MAS Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              MAS Table I.1: Interest Rates of Banks and Finance Companies
            </h2>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Yearly Series
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Official Monetary Authority of Singapore Statistics</span>
            <span aria-hidden="true">·</span>
            <span>Annual Benchmarks</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Dollar (SGD)</span>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Benchmark Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            {records.map((r) => (
              <option key={r.year} value={r.year}>
                {r.year} {r.year === 2025 ? '(Latest MAS Release)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenor Comparison Cards for Active Year */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 3-Month Tenor */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">3 Months Fixed Deposit</span>
            <span className="text-[11px] text-slate-500 font-mono">3M Tenor</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-slate-500" />
                Commercial Banks
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatPercent(activeRecord.bank_fixed_dep_3m)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Finance Companies
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatPercent(activeRecord.finance_fixed_dep_3m)}
                </span>
                <span className="text-[10px] text-emerald-600 font-mono block">
                  +{(activeRecord.finance_fixed_dep_3m - activeRecord.bank_fixed_dep_3m).toFixed(2)}% spread
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectBenchmark(activeRecord.year, 'mas_bank_yearly', 3)}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded transition-colors"
            >
              Use Bank 3M
            </button>
            <button
              type="button"
              onClick={() => onSelectBenchmark(activeRecord.year, 'mas_finance_yearly', 3)}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors"
            >
              Use Finance 3M
            </button>
          </div>
        </div>

        {/* 6-Month Tenor */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">6 Months Fixed Deposit</span>
            <span className="text-[11px] text-slate-500 font-mono">6M Tenor</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-slate-500" />
                Commercial Banks
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatPercent(activeRecord.bank_fixed_dep_6m)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Finance Companies
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatPercent(activeRecord.finance_fixed_dep_6m)}
                </span>
                <span className="text-[10px] text-emerald-600 font-mono block">
                  +{(activeRecord.finance_fixed_dep_6m - activeRecord.bank_fixed_dep_6m).toFixed(2)}% spread
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectBenchmark(activeRecord.year, 'mas_bank_yearly', 6)}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded transition-colors"
            >
              Use Bank 6M
            </button>
            <button
              type="button"
              onClick={() => onSelectBenchmark(activeRecord.year, 'mas_finance_yearly', 6)}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors"
            >
              Use Finance 6M
            </button>
          </div>
        </div>

        {/* 12-Month Tenor */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">12 Months (1 Year) Fixed Deposit</span>
            <span className="text-[11px] text-slate-500 font-mono">12M Tenor</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-slate-500" />
                Commercial Banks
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatPercent(activeRecord.bank_fixed_dep_12m)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Finance Companies
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatPercent(activeRecord.finance_fixed_dep_12m)}
                </span>
                <span className="text-[10px] text-emerald-600 font-mono block">
                  +{(activeRecord.finance_fixed_dep_12m - activeRecord.bank_fixed_dep_12m).toFixed(2)}% spread
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectBenchmark(activeRecord.year, 'mas_bank_yearly', 12)}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded transition-colors"
            >
              Use Bank 12M
            </button>
            <button
              type="button"
              onClick={() => onSelectBenchmark(activeRecord.year, 'mas_finance_yearly', 12)}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors"
            >
              Use Finance 12M
            </button>
          </div>
        </div>
      </div>

      {/* Historical Yearly Rates Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          MAS Yearly Statistical Table (Historical Benchmark Records)
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Bank 1M</th>
                <th className="py-2.5 px-3 text-right">Bank 3M</th>
                <th className="py-2.5 px-3 text-right">Bank 6M</th>
                <th className="py-2.5 px-3 text-right">Bank 12M</th>
                <th className="py-2.5 px-3 text-right text-amber-700">Finance 3M</th>
                <th className="py-2.5 px-3 text-right text-amber-700">Finance 6M</th>
                <th className="py-2.5 px-3 text-right text-amber-700">Finance 12M</th>
                <th className="py-2.5 px-3 text-right">Prime Lending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {records.map((r) => {
                const isCurrent = r.year === selectedYear;
                return (
                  <tr
                    key={r.year}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCurrent ? 'bg-rose-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">
                      {r.year}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 tabular-nums">
                      {r.bank_fixed_dep_1m.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 tabular-nums">
                      {r.bank_fixed_dep_3m.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 tabular-nums">
                      {r.bank_fixed_dep_6m.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-900 font-semibold tabular-nums">
                      {r.bank_fixed_dep_12m.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-amber-800 tabular-nums">
                      {r.finance_fixed_dep_3m.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-amber-800 tabular-nums">
                      {r.finance_fixed_dep_6m.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-amber-900 font-semibold tabular-nums">
                      {r.finance_fixed_dep_12m.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 tabular-nums">
                      {r.bank_prime_lending.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset & Regulatory Explanatory Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-600">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          About MAS Interest Rates of Banks and Finance Companies Statistics:
        </div>
        <p className="leading-relaxed">
          The Monetary Authority of Singapore (MAS) compiles and publishes Table I.1 representing average interest rates quoted by full commercial banks and finance companies for Singapore Dollar deposits and loans. Finance companies traditionally offer higher interest rates on term deposits to compete for retail liquidity while maintaining identical statutory protection under the Singapore Deposit Insurance Scheme (SDIC).
        </p>
      </div>
    </div>
  );
};
