import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse shadow-sm">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2 mb-6"></div>
    <div className="space-y-3">
      <div className="h-3 bg-slate-100 rounded w-full"></div>
      <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      <div className="h-3 bg-slate-100 rounded w-4/6"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 4 }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse shadow-sm space-y-4">
    <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);
