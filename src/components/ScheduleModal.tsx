import React from 'react';
import { X, Calendar, Download, Printer } from 'lucide-react';
import { CalculationResult } from '../types/mas';
import { formatSGD, formatPercent } from '../utils/calculator';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = ['Period', 'Date', 'Opening Balance (SGD)', 'Interest Earned (SGD)', 'Closing Balance (SGD)'];
    const rows = result.schedule.map((p) => [
      p.period,
      p.date,
      p.openingBalance.toFixed(2),
      p.interestEarned.toFixed(2),
      p.closingBalance.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `singdeposit-schedule-${result.principal}-${result.tenorMonths}M.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interest Accrual & Payout Schedule
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{formatSGD(result.principal)} Principal</span>
              <span aria-hidden="true">·</span>
              <span>{formatPercent(result.nominalRate)} p.a.</span>
              <span aria-hidden="true">·</span>
              <span>{result.tenorMonths} Months Duration</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Schedule Table */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Accrual Date</th>
                  <th className="py-2.5 px-3 text-right">Opening Balance</th>
                  <th className="py-2.5 px-3 text-right text-rose-600">Interest Earned</th>
                  <th className="py-2.5 px-3 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.schedule.map((row) => (
                  <tr key={row.period} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-medium text-slate-700">
                      #{row.period}
                    </td>
                    <td className="py-2 px-3 text-slate-600 tabular-nums">
                      {row.date}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 tabular-nums">
                      {formatSGD(row.openingBalance)}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-rose-600 tabular-nums">
                      +{formatSGD(row.interestEarned)}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">
                      {formatSGD(row.closingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-mono font-bold text-xs">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 font-sans text-slate-900">
                    Total at Maturity:
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                    {formatSGD(result.principal)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600 tabular-nums">
                    +{formatSGD(result.totalInterest)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-900 tabular-nums">
                    {formatSGD(result.maturityAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800">Compounding Mechanism: </span>
            <span>
              {result.compounding === 'maturity'
                ? 'Interest is computed based on Actual/365 calendar days and disbursed as a single lump-sum payout upon deposit maturity.'
                : `Interest compounds ${result.compounding}, reinvesting the accrued interest into the principal balance for each cycle.`}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
