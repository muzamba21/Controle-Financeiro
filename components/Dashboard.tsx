import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Transaction, MonthlyStats } from '../types';
import { StatsCard } from './StatsCard';

interface DashboardProps {
  transactions: Transaction[];
}

interface DailyData {
  day: number;
  income: number;
  expense: number;
  details: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#64748b'];

// Custom Tooltip Component
// Fix: Use 'any' type for Tooltip props to avoid Recharts type definition issues
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DailyData;
    
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg text-sm max-w-[280px]">
        <p className="font-bold text-slate-800 mb-2 border-b pb-1">Data: {label}</p>
        
        {/* Sums */}
        <div className="flex justify-between gap-4 mb-2">
          {data.income > 0 && <span className="text-emerald-600 font-medium">Receita: R${data.income.toFixed(2)}</span>}
          {data.expense > 0 && <span className="text-rose-600 font-medium">Despesa: R${data.expense.toFixed(2)}</span>}
        </div>
        
        {/* Transaction Details */}
        <div className="space-y-1">
          {data.details.map((t) => (
            <div key={t.id} className="flex justify-between items-center text-xs text-slate-500">
              <span className="truncate mr-2 w-full">
                <span className="font-semibold text-slate-700">[{t.user || 'Casa'}]</span> {t.description}
              </span>
              <span className={`whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Math.abs(t.amount).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  
  const stats = useMemo<MonthlyStats>(() => {
    const calculated = transactions.reduce((acc: MonthlyStats, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += Number(curr.amount);
      } else {
        acc.totalExpense += Number(curr.amount);
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0 });

    calculated.balance = calculated.totalIncome - calculated.totalExpense;
    return calculated;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc: Record<string, number>, curr) => {
      const current = acc[curr.category] || 0;
      acc[curr.category] = current + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [transactions]);

  const memberData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc: Record<string, number>, curr) => {
      const user = curr.user || 'Casa';
      const current = acc[user] || 0;
      acc[user] = current + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [transactions]);

  const dailyData = useMemo(() => {
    // Aggregate by day for the chart
    const grouped = transactions.reduce((acc: Record<number, DailyData>, curr) => {
      const parts = curr.date.split('-');
      const dayStr = parts[2];
      if (!dayStr) return acc;

      const day = parseInt(dayStr, 10);
      if (isNaN(day)) return acc;

      if (!acc[day]) {
        acc[day] = { 
          day, 
          income: 0, 
          expense: 0, 
          details: [] 
        };
      }
      
      const val = Number(curr.amount);
      if (curr.type === 'income') {
        acc[day].income += val;
      } else {
        acc[day].expense += val;
      }

      acc[day].details.push(curr);
      return acc;
    }, {} as Record<number, DailyData>);
    
    return (Object.values(grouped) as DailyData[]).sort((a, b) => a.day - b.day);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Receitas" value={stats.totalIncome} type="income" />
        <StatsCard title="Despesas" value={stats.totalExpense} type="expense" />
        <StatsCard title="Saldo" value={stats.balance} type="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Spending Chart (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Fluxo do Mês</h3>
          {dailyData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Sem dados para este período
            </div>
          )}
        </div>

        {/* Member Expenses Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Gastos por Pessoa</h3>
          {memberData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memberData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {memberData.map((entry, index) => (
                      <Cell key={`cell-member-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `R$ ${val.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Sem despesas
            </div>
          )}
        </div>

        {/* Category Pie Chart (Full Width or 3rd spot) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[350px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Despesas por Categoria</h3>
          {categoryData.length > 0 ? (
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(val: number) => `R$ ${val.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              Sem despesas registradas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};