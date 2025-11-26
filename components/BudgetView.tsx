import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { Calendar, ShoppingBag, TrendingDown } from 'lucide-react';

interface BudgetViewProps {
  transactions: Transaction[];
}

export const BudgetView: React.FC<BudgetViewProps> = ({ transactions }) => {
  const { fixedExpenses, variableExpenses, totalFixed, totalVariable } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const fixed = expenses.filter(t => t.isFixed);
    const variable = expenses.filter(t => !t.isFixed);
    
    return {
      fixedExpenses: fixed,
      variableExpenses: variable,
      totalFixed: fixed.reduce((sum, t) => sum + t.amount, 0),
      totalVariable: variable.reduce((sum, t) => sum + t.amount, 0),
    };
  }, [transactions]);

  const total = totalFixed + totalVariable;
  const fixedPercent = total > 0 ? (totalFixed / total) * 100 : 0;
  const variablePercent = total > 0 ? (totalVariable / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Fixed Expenses Card */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar size={18} className="text-blue-500" />
                <h3 className="font-medium text-sm">Despesas Fixas</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFixed)}
              </p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {fixedPercent.toFixed(0)}% do total
            </div>
          </div>
          
          <div className="space-y-3 mt-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detalhamento</h4>
            {fixedExpenses.length > 0 ? (
              <ul className="space-y-2">
                {fixedExpenses.map(t => (
                  <li key={t.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-slate-600">{t.description}</span>
                    <span className="font-medium text-slate-800">R$ {t.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">Nenhuma despesa fixa encontrada.</p>
            )}
          </div>
        </div>

        {/* Variable Expenses Card */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <ShoppingBag size={18} className="text-orange-500" />
                <h3 className="font-medium text-sm">Despesas Variáveis</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVariable)}
              </p>
            </div>
            <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
              {variablePercent.toFixed(0)}% do total
            </div>
          </div>
          
          <div className="space-y-3 mt-6">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detalhamento</h4>
            {variableExpenses.length > 0 ? (
              <ul className="space-y-2">
                {variableExpenses.map(t => (
                  <li key={t.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-slate-600">{t.description}</span>
                    <span className="font-medium text-slate-800">R$ {t.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">Nenhuma despesa variável encontrada.</p>
            )}
          </div>
        </div>
      </div>

      {/* Total Card */}
      <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-full">
            <TrendingDown size={24} className="text-white" />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Total de Despesas</p>
            <h3 className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </h3>
          </div>
        </div>
        
        {/* Progress Bar Visualization */}
        <div className="hidden md:flex flex-col items-end w-1/3">
          <div className="flex text-xs text-slate-300 mb-2 gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Fixas
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div> Variáveis
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
            <div style={{ width: `${fixedPercent}%` }} className="h-full bg-blue-500"></div>
            <div style={{ width: `${variablePercent}%` }} className="h-full bg-orange-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};