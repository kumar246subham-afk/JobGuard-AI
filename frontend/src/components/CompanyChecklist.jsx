import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const CompanyChecklist = ({ checklist = {} }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'provided':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Provided
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Missing
          </span>
        );
      case 'unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Unverified
          </span>
        );
    }
  };

  const items = Object.entries(checklist);

  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500 italic bg-slate-50 rounded-lg border border-slate-200">
        No company information checklist data available.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {items.map(([key, item]) => (
        <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
          <div>
            <div className="text-sm font-medium text-slate-800">{item.field}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.details}</div>
          </div>
          <div className="self-start sm:self-center">
            {getStatusBadge(item.status)}
          </div>
        </div>
      ))}
    </div>
  );
};
