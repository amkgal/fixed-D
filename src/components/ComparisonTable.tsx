import React, { useState, useMemo } from 'react';
import {
  Building2,
  Landmark,
  ShieldCheck,
  Search,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  Check,
} from 'lucide-react';
import { InstitutionRate, TenorMonth, InstitutionType } from '../types/mas';
import { formatSGD, formatPercent, calculateMaturityDate } from '../utils/calculator';

interface ComparisonTableProps {
  institutions: InstitutionRate[];
  principal: number;
  tenorMonths: TenorMonth;
  startDate: string;
  onSelectInstitution: (institutionId: string, rate: number) => void;
  selectedInstitutionId?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  institutions,
  principal,
  tenorMonths,
  startDate,
  onSelectInstitution,
  selectedInstitutionId,
}) => {
  const [filterType, setFilterType] = useState<'all' | InstitutionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'interest' | 'rate' | 'minDeposit' | 'name'>('interest');

  const { days } = calculateMaturityDate(startDate, tenorMonths);

  const processedList = useMemo(() => {
    return institutions
      .filter((inst) => {
        if (filterType !== 'all' && inst.type !== filterType) return false;
        if (
          searchQuery.trim() &&
          !inst.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !inst.shortName.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((inst) => {
        // Resolve rate for this tenor
        let rate = inst.rates[tenorMonths] ?? inst.rates[12] ?? 2.5;
        let isPromo = false;
        let promoName = '';

        if (
          inst.specialPromoRate &&
          inst.specialPromoRate.tenor === tenorMonths &&
          principal >= inst.specialPromoRate.minDeposit
        ) {
          rate = inst.specialPromoRate.rate;
          isPromo = true;
          promoName = inst.specialPromoRate.promoName;
        }

        // Calculate simple interest: P * (r/100) * (days/365)
        const interest = principal * (rate / 100) * (days / 365);
        const meetsMinDeposit = principal >= inst.minDeposit;

        return {
          ...inst,
          resolvedRate: rate,
          isPromo,
          promoName,
          interest,
          totalPayout: principal + interest,
          meetsMinDeposit,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'interest' || sortBy === 'rate') {
          return b.interest - a.interest;
        }
        if (sortBy === 'minDeposit') {
          return a.minDeposit - b.minDeposit;
        }
        return a.name.localeCompare(b.name);
      });
  }, [institutions, filterType, searchQuery, sortBy, tenorMonths, principal, days]);

  const bankCount = institutions.filter((i) => i.type === 'bank').length;
  const financeCount = institutions.filter((i) => i.type === 'finance_company').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Singapore Fixed Deposit Rates Comparison
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Calculated for {formatSGD(principal)}</span>
            <span aria-hidden="true">·</span>
            <span>{tenorMonths} Months Duration</span>
            <span aria-hidden="true">·</span>
            <span>{days} Calendar Days</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({institutions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('bank')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'bank'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Banks ({bankCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('finance_company')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'finance_company'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Finance Co ({financeCount})
          </button>
        </div>
      </div>

      {/* Search and Sort controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search DBS, OCBC, Hong Leong..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="interest">Highest Interest Return</option>
            <option value="rate">Highest Interest Rate (% p.a.)</option>
            <option value="minDeposit">Lowest Min Deposit</option>
            <option value="name">Institution Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Institution & Type</th>
              <th className="py-3 px-3 text-right">Rate (% p.a.)</th>
              <th className="py-3 px-3 text-right">Est. Interest</th>
              <th className="py-3 px-3 text-right">Total Payout</th>
              <th className="py-3 px-3">Min. Deposit</th>
              <th className="py-3 px-3 text-center">SDIC Insured</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No institutions found matching "{searchQuery}".
                </td>
              </tr>
            ) : (
              processedList.map((inst, index) => {
                const isSelected = selectedInstitutionId === inst.id;
                return (
                  <tr
                    key={inst.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* Institution Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {inst.type === 'finance_company' ? (
                          <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Landmark className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{inst.name}</span>
                            {index === 0 && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                                Highest Return
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>
                              {inst.type === 'finance_company'
                                ? 'MAS-Licensed Finance Co'
                                : 'Full Commercial Bank'}
                            </span>
                            {inst.isPromo && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-rose-600 font-medium truncate">
                                  {inst.promoName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {formatPercent(inst.resolvedRate)}
                      </span>
                    </td>

                    {/* Est. Interest */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-bold text-rose-600 tabular-nums">
                        {formatSGD(inst.interest)}
                      </span>
                    </td>

                    {/* Total Payout */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-medium text-slate-900 tabular-nums">
                        {formatSGD(inst.totalPayout)}
                      </span>
                    </td>

                    {/* Min Deposit */}
                    <td className="py-3 px-3">
                      <div className="text-slate-700 font-mono tabular-nums">
                        {formatSGD(inst.minDeposit, false)}
                      </div>
                      {!inst.meetsMinDeposit && (
                        <span className="text-[10px] text-amber-600 block">
                          Deposit is below min
                        </span>
                      )}
                    </td>

                    {/* SDIC Insured */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Up to S$100k</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectInstitution(inst.id, inst.resolvedRate)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Use Rate'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Finance Companies vs Banks Insight Note */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-800">Singapore Finance Companies vs. Commercial Banks:</span>
        <span className="ml-1">
          MAS-licensed Finance Companies (e.g. Hong Leong Finance, Sing Investments & Finance, Singapura Finance) operate under the Finance Companies Act and are supervised by MAS. They are standard Scheme Members under SDIC, meaning Singapore Dollar deposits placed with finance companies are insured up to S$100,000—the exact same legal coverage level as retail banks like DBS or OCBC.
        </span>
      </div>
    </div>
  );
};
