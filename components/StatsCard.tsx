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

  switch (type) {
    case 'income':
      colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100';
      Icon = ArrowUpCircle;
      break;
    case 'expense':
      colorClass = 'text-rose-600 bg-rose-50 border-rose-100';
      Icon = ArrowDownCircle;
      break;
    default:
      colorClass = 'text-blue-600 bg-blue-50 border-blue-100';
      Icon = Wallet;
      break;
  }

  return (
    <div className={`p-6 rounded-2xl border ${colorClass.split(' ')[2]} bg-white shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${type === 'expense' ? 'text-rose-600' : type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
          {formattedValue}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};