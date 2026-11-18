import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export const RiskBadge = ({ level = 'LOW', score, size = 'md' }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldCheck,
      label: 'Low Risk',
      dot: 'bg-emerald-500'
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      label: 'Medium Risk',
      dot: 'bg-amber-500'
    },
    HIGH: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: ShieldAlert,
      label: 'High Risk',
      dot: 'bg-rose-500'
    }
  };

  const current = configs[normLevel] || configs.LOW;
  const Icon = current.icon;

  const sizeClasses = size === 'lg' 
    ? 'px-4 py-2 text-base font-semibold' 
    : size === 'sm'
    ? 'px-2 py-0.5 text-xs font-medium'
    : 'px-3 py-1 text-sm font-medium';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border ${current.bg} ${sizeClasses}`}>
      <span className={`h-2 w-2 rounded-full ${current.dot} animate-pulse`} />
      <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-xs">({score}/100)</span>
      )}
    </span>
  );
};
