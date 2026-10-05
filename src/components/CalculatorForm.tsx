import React from 'react';
import {
  Calendar,
  Building2,
  Percent,
  Coins,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  CalculationInputs,
  InstitutionRate,
  MasYearlyRateRecord,
  RateSource,
  TenorMonth,
  CompoundingFrequency,
} from '../types/mas';

interface CalculatorFormProps {
  inputs: CalculationInputs;
  onChange: (updated: Partial<CalculationInputs>) => void;
  institutions: InstitutionRate[];
  masRecords: MasYearlyRateRecord[];
  activeResolvedRate: number;
  activeRateLabel: string;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000];
const TENOR_OPTIONS: { label: string; value: TenorMonth }[] = [
  { label: '1 Month', value: 1 },
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '9 Months', value: 9 },
  { label: '12 Months', value: 12 },
  { label: '24 Months', value: 24 },
];

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  inputs,
  onChange,
  institutions,
  masRecords,
  activeResolvedRate,
  activeRateLabel,
}) => {
  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(rawVal) || 0;
    onChange({ principal: num });
  };

  const setPreset = (amount: number) => {
    onChange({ principal: amount });
  };

  const handleRateSourceChange = (source: RateSource) => {
    if (source === 'institution' && !inputs.selectedInstitutionId) {
      onChange({ rateSource: source, selectedInstitutionId: institutions[0]?.id });
    } else {
      onChange({ rateSource: source });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      {/* 1. Deposit Amount Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-rose-600" />
            Deposit Amount (SGD)
          </label>
          <span className="text-xs text-slate-500">
            Min S$1,000
          </span>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-medium text-slate-500">
            S$
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={inputs.principal ? inputs.principal.toLocaleString('en-US') : ''}
            onChange={handlePrincipalChange}
            placeholder="50,000"
            className="w-full pl-10 pr-4 py-2.5 text-lg font-semibold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all font-mono tabular-nums"
          />
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {PRESET_AMOUNTS.map((amt) => {
            const isSdicCap = amt === 100000;
            const isSelected = inputs.principal === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => setPreset(amt)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors border ${
                  isSelected
                    ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                    : isSdicCap
                    ? 'bg-slate-50 text-slate-800 border-emerald-300 hover:bg-emerald-50'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                S${amt >= 1000 ? `${amt / 1000}k` : amt}
                {isSdicCap && <span className="ml-1 text-[10px] text-emerald-700">★ SDIC Cap</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Tenor Selector */}
      <div>
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
          <Calendar className="w-4 h-4 text-rose-600" />
          Deposit Tenor (Duration)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TENOR_OPTIONS.map((tenor) => {
            const isSelected = inputs.tenorMonths === tenor.value;
            return (
              <button
                key={tenor.value}
                type="button"
                onClick={() => onChange({ tenorMonths: tenor.value })}
                className={`py-2 px-2 text-xs font-medium rounded-lg text-center transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {tenor.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interest Rate Source (MAS vs Bank vs Custom) */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Percent className="w-4 h-4 text-rose-600" />
          Interest Rate Source
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleRateSourceChange('mas_bank_yearly')}
            className={`p-3 rounded-lg border text-left transition-all ${
              inputs.rateSource === 'mas_bank_yearly'
                ? 'bg-rose-50/50 border-rose-500 ring-1 ring-rose-500'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                MAS Commercial Banks
              </span>
              <span className="text-xs font-mono font-bold text-rose-600">
                Table I.1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Official MAS published annual average rate across commercial banks
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleRateSourceChange('mas_finance_yearly')}
            className={`p-3 rounded-lg border text-left transition-all ${
              inputs.rateSource === 'mas_finance_yearly'
                ? 'bg-rose-50/50 border-rose-500 ring-1 ring-rose-500'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                MAS Finance Companies
              </span>
              <span className="text-xs font-mono font-bold text-rose-600">
                Table I.1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Official MAS published annual rate for licensed finance companies
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleRateSourceChange('institution')}
            className={`p-3 rounded-lg border text-left transition-all ${
              inputs.rateSource === 'institution'
                ? 'bg-rose-50/50 border-rose-500 ring-1 ring-rose-500'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Specific Bank / Finance Co
              </span>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              DBS, OCBC, UOB, Hong Leong Finance, CIMB, SIF promo rates
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleRateSourceChange('custom')}
            className={`p-3 rounded-lg border text-left transition-all ${
              inputs.rateSource === 'custom'
                ? 'bg-rose-50/50 border-rose-500 ring-1 ring-rose-500'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Custom Manual Rate
              </span>
              <Percent className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Specify your agreed quote or targeted promotional yield
            </p>
          </button>
        </div>

        {/* Conditional controls based on selected Rate Source */}
        {inputs.rateSource.startsWith('mas_') && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                MAS Benchmark Year:
              </span>
              <select
                value={inputs.selectedYear}
                onChange={(e) => onChange({ selectedYear: Number(e.target.value) })}
                className="text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2.5 py-1 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              >
                {masRecords.map((rec) => (
                  <option key={rec.year} value={rec.year}>
                    {rec.year} Series {rec.year === 2025 ? '(Current Benchmark)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span>MAS Table I.1 Annual Rate for {inputs.tenorMonths}M:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {activeResolvedRate.toFixed(2)}% p.a.
              </span>
            </div>
          </div>
        )}

        {inputs.rateSource === 'institution' && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <label className="text-xs font-medium text-slate-700 block">
              Select Institution:
            </label>
            <select
              value={inputs.selectedInstitutionId || institutions[0]?.id}
              onChange={(e) => onChange({ selectedInstitutionId: e.target.value })}
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            >
              <optgroup label="Commercial Banks">
                {institutions
                  .filter((i) => i.type === 'bank')
                  .map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.rates[inputs.tenorMonths] ?? inst.rates[12]}% p.a.)
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Finance Companies (MAS Supervised)">
                {institutions
                  .filter((i) => i.type === 'finance_company')
                  .map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.rates[inputs.tenorMonths] ?? inst.rates[12]}% p.a.)
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        )}

        {inputs.rateSource === 'custom' && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Annual Interest Rate (% p.a.)
              </label>
              <span className="text-xs text-slate-500">e.g. 3.25</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0.01"
                max="25"
                value={inputs.customRate || ''}
                onChange={(e) => onChange({ customRate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-3 pr-8 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 font-mono tabular-nums"
                placeholder="3.20"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400">
                %
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Advanced Settings: Start Date & Compounding */}
      <div className="pt-2 border-t border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Deposit Start Date
              </label>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  onChange({ startDate: today });
                }}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium"
              >
                Today
              </button>
            </div>
            <input
              type="date"
              value={inputs.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Interest Payment / Compounding
            </label>
            <select
              value={inputs.compounding}
              onChange={(e) =>
                onChange({ compounding: e.target.value as CompoundingFrequency })
              }
              className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-rose-500"
            >
              <option value="maturity">At Maturity / Simple (Standard in SG)</option>
              <option value="monthly">Compounded Monthly</option>
              <option value="quarterly">Compounded Quarterly</option>
              <option value="annually">Compounded Annually</option>
            </select>
          </div>
        </div>

        {/* Day count convention notice */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Singapore Money Market Convention:</span>
          <span className="font-mono text-slate-700">Actual / 365 Days</span>
        </div>
      </div>
    </div>
  );
};
