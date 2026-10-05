import React from 'react';
import { Database, ShieldCheck, Landmark } from 'lucide-react';
import { MasBackendConfig } from '../types/mas';

interface NavbarProps {
  activeTab: 'calculator' | 'comparison' | 'mas_table';
  setActiveTab: (tab: 'calculator' | 'comparison' | 'mas_table') => void;
  onOpenBackendModal: () => void;
  backendConfig: MasBackendConfig;
  isLiveConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBackendModal,
  backendConfig,
  isLiveConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('calculator')}
            className="flex items-center gap-2 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-rose-700 transition-colors">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              SingDeposit
            </span>
          </button>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`transition-colors py-1 border-b-2 ${
                activeTab === 'calculator'
                  ? 'text-rose-600 border-rose-600 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              FD Calculator
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`transition-colors py-1 border-b-2 ${
                activeTab === 'comparison'
                  ? 'text-rose-600 border-rose-600 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              Banks vs Finance Co
            </button>
            <button
              onClick={() => setActiveTab('mas_table')}
              className={`transition-colors py-1 border-b-2 ${
                activeTab === 'mas_table'
                  ? 'text-rose-600 border-rose-600 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              MAS Yearly Rates
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBackendModal}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                backendConfig.useLiveBackend && isLiveConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Configure MAS Backend API Endpoint"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">
                {backendConfig.useLiveBackend ? 'MAS Backend: Live' : 'Backend Adapter'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  backendConfig.useLiveBackend && isLiveConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
