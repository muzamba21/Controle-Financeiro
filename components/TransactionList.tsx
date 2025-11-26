import React from 'react';
import { Trash2, TrendingUp, TrendingDown, User } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  // Sort by date descending
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="text-slate-300" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-700">Nenhuma transação</h3>
        <p className="text-slate-500">Adicione uma nova receita ou despesa para começar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Descrição</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Categoria</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Responsável</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Data</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Valor</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <span className="font-medium text-slate-800">{t.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    <span className="text-slate-700 font-medium">{t.user || 'Casa'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'expense' ? '-' : '+'} R$ {t.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};