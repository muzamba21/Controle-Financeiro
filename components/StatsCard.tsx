import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, type }) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

  let colorClass = '';
  let Icon = Wallet;
  let textClass = '';

  switch (type) {
    case 'income':
      // Emerald
      colorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50';
      textClass = 'text-emerald-600 dark:text-emerald-400';
      Icon = ArrowUpCircle;
      break;
    case 'expense':
      // Rose
      colorClass = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800/50';
      textClass = 'text-rose-600 dark:text-rose-400';
      Icon = ArrowDownCircle;
      break;
    default:
      // Blue
      colorClass = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/50';
      textClass = 'text-slate-800 dark:text-white';
      Icon = Wallet;
      break;
  }

  const borderClass = colorClass.split(' ').find(c => c.startsWith('border')) || 'border-transparent';
  const iconBgClass = colorClass.split(' ').filter(c => c.includes('bg-') || c.includes('text-')).join(' ');

  return (
    <div className={`p-6 rounded-2xl border ${borderClass} bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/50 flex items-center justify-between transition-colors`}>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${textClass}`}>
          {formattedValue}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${iconBgClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};