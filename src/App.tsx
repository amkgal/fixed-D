import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  Calendar,
  Landmark,
  Building2,
  ShieldCheck,
  Percent,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CalculatorForm } from './components/CalculatorForm';
import { CalculationSummary } from './components/CalculationSummary';
import { ComparisonTable } from './components/ComparisonTable';
import { MasBenchmarkViewer } from './components/MasBenchmarkViewer';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { ScheduleModal } from './components/ScheduleModal';
import { DEFAULT_MAS_YEARLY_RATES, MAS_TABLE_METADATA } from './data/masData';
import { SINGAPORE_INSTITUTIONS } from './data/institutionsData';
import {
  CalculationInputs,
  MasBackendConfig,
  MasYearlyRateRecord,
  TenorMonth,
} from './types/mas';
import {
  calculateFixedDeposit,
  resolveRate,
  formatSGD,
  formatPercent,
} from './utils/calculator';
import {
  fetchMasRates,
  getStoredBackendConfig,
  saveBackendConfig,
} from './services/masApiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'comparison' | 'mas_table'>('calculator');
  const [backendConfig, setBackendConfig] = useState<MasBackendConfig>(getStoredBackendConfig);
  const [masRecords, setMasRecords] = useState<MasYearlyRateRecord[]>(DEFAULT_MAS_YEARLY_RATES);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [backendStatusText, setBackendStatusText] = useState<string>('Local MAS Table I.1 database');

  // Modals
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Form Inputs
  const [inputs, setInputs] = useState<CalculationInputs>(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      principal: 50000,
      tenorMonths: 12,
      rateSource: 'mas_bank_yearly',
      customRate: 3.20,
      selectedInstitutionId: 'dbs',
      selectedYear: 2025,
      compounding: 'maturity',
      startDate: today,
      dayCountConvention: 'act_365',
    };
  });

  // Load MAS rates on mount or when backend config changes
  const loadMasData = async () => {
    try {
      const result = await fetchMasRates(backendConfig);
      setMasRecords(result.records);
      setIsLiveConnected(result.isLiveBackend);
      setBackendStatusText(result.statusMessage);
    } catch (err) {
      console.error('Failed to load MAS rates', err);
      setMasRecords(DEFAULT_MAS_YEARLY_RATES);
      setIsLiveConnected(false);
    }
  };

  useEffect(() => {
    loadMasData();
  }, [backendConfig.useLiveBackend, backendConfig.endpointUrl]);

  const handleUpdateInputs = (updated: Partial<CalculationInputs>) => {
    setInputs((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveConfig = (newConfig: MasBackendConfig) => {
    setBackendConfig(newConfig);
    saveBackendConfig(newConfig);
  };

  // Resolved Rate & Label
  const { rate: activeResolvedRate, label: activeRateLabel } = useMemo(() => {
    return resolveRate(inputs, masRecords, SINGAPORE_INSTITUTIONS);
  }, [inputs, masRecords]);

  // Calculation Result
  const calculationResult = useMemo(() => {
    return calculateFixedDeposit(inputs, activeRateLabel, activeResolvedRate);
  }, [inputs, activeRateLabel, activeResolvedRate]);

  // Handler to pick an institution from comparison table
  const handleSelectInstitution = (instId: string) => {
    setInputs((prev) => ({
      ...prev,
      rateSource: 'institution',
      selectedInstitutionId: instId,
    }));
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler to pick a MAS benchmark rate from viewer
  const handleSelectBenchmark = (
    year: number,
    source: 'mas_bank_yearly' | 'mas_finance_yearly',
    tenor: TenorMonth
  ) => {
    setInputs((prev) => ({
      ...prev,
      rateSource: source,
      selectedYear: year,
      tenorMonths: tenor,
    }));
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header with Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        backendConfig={backendConfig}
        isLiveConnected={isLiveConnected}
      />

      {/* 2. Hero Section */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-2">
                <Landmark className="w-3.5 h-3.5" />
                <span>Monetary Authority of Singapore (MAS) Benchmark Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Singapore Fixed Deposit Calculator
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Calculate precise deposit interest returns using official MAS Interest Rates of Banks and Finance Companies yearly statistical benchmarks or current board rates.
              </p>
            </div>

            {/* Quiet Trust Markers */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                SDIC Insured (S$100k)
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>Act/365 Day Convention</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>IRAS Tax-Exempt</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            {/* Form + Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Input Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                    Deposit Configuration
                  </h2>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span>Active Rate:</span>
                    <span className="font-mono font-bold text-rose-600 tabular-nums">
                      {formatPercent(activeResolvedRate)} p.a.
                    </span>
                  </div>
                </div>

                <CalculatorForm
                  inputs={inputs}
                  onChange={handleUpdateInputs}
                  institutions={SINGAPORE_INSTITUTIONS}
                  masRecords={masRecords}
                  activeResolvedRate={activeResolvedRate}
                  activeRateLabel={activeRateLabel}
                />
              </div>

              {/* Right Column: Calculation Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-rose-600" />
                  Maturity Payout & Returns
                </h2>

                <CalculationSummary
                  result={calculationResult}
                  onOpenSchedule={() => setIsScheduleModalOpen(true)}
                />

                {/* Quick Teaser: Compare with other institutions */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Top Rates for {inputs.tenorMonths}M Tenor
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('comparison')}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                    >
                      Compare All (12)
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {SINGAPORE_INSTITUTIONS.slice(0, 3).map((inst) => {
                      const rate = inst.rates[inputs.tenorMonths] ?? inst.rates[12] ?? 2.5;
                      const estInterest = inputs.principal * (rate / 100) * (calculationResult.days / 365);
                      return (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-900 block truncate">
                              {inst.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {inst.type === 'finance_company' ? 'Finance Co' : 'Commercial Bank'}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-slate-900 block tabular-nums">
                              {formatPercent(rate)}
                            </span>
                            <span className="font-mono text-emerald-600 text-[11px] tabular-nums">
                              +{formatSGD(estInterest)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Section / Singapore Banking FAQ */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 mt-12">
              <h3 className="text-base font-bold text-slate-900">
                Understanding Singapore Fixed Deposits & MAS Statistical Benchmarks
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
                <div className="space-y-2">
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-rose-600" />
                    MAS Table I.1 Benchmark
                  </div>
                  <p>
                    The Monetary Authority of Singapore tracks and aggregates annual average fixed deposit interest rates across commercial banks and finance companies. These official benchmarks reflect wholesale and retail market liquidity trends in Singapore.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    Finance Companies Yield Spread
                  </div>
                  <p>
                    Licensed finance companies in Singapore (such as Hong Leong Finance and Sing Investments & Finance) frequently offer a +0.20% to +0.35% yield premium over major commercial banks to attract retail deposits.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    SDIC Statutory Protection
                  </div>
                  <p>
                    Under the Singapore Deposit Insurance Scheme (revised effective 1 April 2024), standard SGD fixed deposits are legally protected up to S$100,000 per depositor per Scheme Member bank or finance company.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <ComparisonTable
              institutions={SINGAPORE_INSTITUTIONS}
              principal={inputs.principal}
              tenorMonths={inputs.tenorMonths}
              startDate={inputs.startDate}
              onSelectInstitution={handleSelectInstitution}
              selectedInstitutionId={inputs.selectedInstitutionId}
            />
          </div>
        )}

        {activeTab === 'mas_table' && (
          <div className="space-y-6">
            <MasBenchmarkViewer
              records={masRecords}
              onSelectBenchmark={handleSelectBenchmark}
            />
          </div>
        )}
      </main>

      {/* 4. Modals */}
      <BackendIntegrationModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        config={backendConfig}
        onSaveConfig={handleSaveConfig}
        onRefreshData={loadMasData}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        result={calculationResult}
      />

      {/* 5. Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SingDeposit</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Fixed Deposit & Finance Company Calculator</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Backend API Specifications
            </button>
            <span aria-hidden="true">·</span>
            <span>MAS Table I.1 Reference</span>
            <span aria-hidden="true">·</span>
            <span>SDIC Scheme Member Disclosures</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
