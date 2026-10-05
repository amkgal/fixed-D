import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Code2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { MasBackendConfig, MasYearlyRateRecord } from '../types/mas';
import { fetchMasRates } from '../services/masApiService';
import { MAS_TABLE_METADATA } from '../data/masData';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MasBackendConfig;
  onSaveConfig: (config: MasBackendConfig) => void;
  onRefreshData: () => Promise<void>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onRefreshData,
}) => {
  const [localConfig, setLocalConfig] = useState<MasBackendConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
    latencyMs?: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'contract' | 'express_example'>('config');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const start = performance.now();

    try {
      const result = await fetchMasRates(localConfig);
      const latency = Math.round(performance.now() - start);

      if (localConfig.useLiveBackend && result.isLiveBackend) {
        setTestResult({
          success: true,
          message: `Live backend responded successfully. Received ${result.records.length} records.`,
          count: result.records.length,
          latencyMs: latency,
        });
      } else if (localConfig.useLiveBackend && !result.isLiveBackend) {
        setTestResult({
          success: false,
          message: result.statusMessage,
          latencyMs: latency,
        });
      } else {
        setTestResult({
          success: true,
          message: `Local standalone mode active. Ready with ${result.records.length} MAS Table I.1 records.`,
          count: result.records.length,
          latencyMs: latency,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    onSaveConfig(localConfig);
    await onRefreshData();
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleExpressCode = `// Node.js Express Route Example: MAS Backend Integration
// Route: GET /api/mas/interest-rates/yearly

import express from 'express';
const router = express.Router();

// Option A: Proxy directly to MAS Datastore API (Table I.1)
router.get('/api/mas/interest-rates/yearly', async (req, res) => {
  try {
    const masDatastoreUrl = 'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=5f2b8b3b-8296-477a-94c6-ce3ff3ded0c3&limit=50';
    
    const response = await fetch(masDatastoreUrl);
    const data = await response.json();

    // Map records to SingDeposit contract
    const records = (data.result?.records || []).map((row) => ({
      year: parseInt(row.end_of_year || row.year || '2024'),
      period: row.end_of_year || row.year,
      bank_fixed_dep_1m: parseFloat(row.banks_fixed_deposits_1_mth || 2.45),
      bank_fixed_dep_3m: parseFloat(row.banks_fixed_deposits_3_mth || 2.70),
      bank_fixed_dep_6m: parseFloat(row.banks_fixed_deposits_6_mth || 2.85),
      bank_fixed_dep_12m: parseFloat(row.banks_fixed_deposits_12_mth || 2.95),
      bank_savings_dep: parseFloat(row.banks_savings_deposits || 0.18),
      bank_prime_lending: parseFloat(row.prime_lending_rate || 5.25),
      finance_fixed_dep_3m: parseFloat(row.fc_fixed_deposits_3_mth || 2.90),
      finance_fixed_dep_6m: parseFloat(row.fc_fixed_deposits_6_mth || 3.10),
      finance_fixed_dep_12m: parseFloat(row.fc_fixed_deposits_12_mth || 3.25),
      finance_savings_dep: parseFloat(row.fc_savings_deposits || 0.25)
    }));

    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;`;

  const sampleContractSchema = `{
  "success": true,
  "records": [
    {
      "year": 2025,
      "period": "2025",
      "bank_fixed_dep_1m": 2.45,
      "bank_fixed_dep_3m": 2.70,
      "bank_fixed_dep_6m": 2.85,
      "bank_fixed_dep_12m": 2.95,
      "bank_savings_dep": 0.18,
      "bank_prime_lending": 5.25,
      "finance_fixed_dep_3m": 2.90,
      "finance_fixed_dep_6m": 3.10,
      "finance_fixed_dep_12m": 3.25,
      "finance_savings_dep": 0.25
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-rose-600 flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                MAS Backend Integration & API Adapter
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure your backend connection or inspect the MAS API contract
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Endpoint Configuration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'contract'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            JSON Schema Contract
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('express_example')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'express_example'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Sample Express Route
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Standalone vs Live Toggle */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Connect to Live Custom Backend
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Toggle ON when your backend server is up. Toggle OFF to use bundled MAS statistical dataset.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalConfig((prev) => ({
                        ...prev,
                        useLiveBackend: !prev.useLiveBackend,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localConfig.useLiveBackend ? 'bg-rose-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        localConfig.useLiveBackend ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Backend API Endpoint URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={localConfig.endpointUrl}
                    onChange={(e) =>
                      setLocalConfig((prev) => ({ ...prev, endpointUrl: e.target.value }))
                    }
                    placeholder="/api/mas/interest-rates/yearly or http://localhost:5000/api/mas-rates"
                    className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Tip: You can use relative paths like <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/api/mas/interest-rates/yearly</code> or full local URLs.
                </p>
              </div>

              {/* Optional Bearer Token */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Optional Authorization Header / API Key
                </label>
                <input
                  type="password"
                  value={localConfig.apiKey || ''}
                  onChange={(e) =>
                    setLocalConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  placeholder="Bearer token or API key if your endpoint is protected"
                  className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Test Action */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>

              {/* Test Result Banner */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-bold">
                      {testResult.success ? 'Connection Verified' : 'Connection Error'}
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {testResult.message}
                    </div>
                    {testResult.latencyMs !== undefined && (
                      <div className="text-[10px] opacity-75 font-mono">
                        Roundtrip latency: {testResult.latencyMs}ms
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contract' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Expected JSON Schema Response from Backend:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sampleContractSchema)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Schema'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
                {sampleContractSchema}
              </pre>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                The frontend accepts either a flat JSON array of records or standard envelopes with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">records</code> or <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">result.records</code> (matching the official MAS Datastore search response).
              </div>
            </div>
          )}

          {activeTab === 'express_example' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Ready-to-use Express Proxy Route:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sampleExpressCode)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Route'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-72">
                {sampleExpressCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
          >
            Save & Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
