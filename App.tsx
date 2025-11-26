import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, Plus, ChevronLeft, ChevronRight, Wallet, PieChart, Loader2, Users } from 'lucide-react';
import { Transaction, FamilyMember, FAMILY_MEMBERS } from './types';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { BudgetView } from './components/BudgetView';
import { transactionService } from './services/transactionService';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions' | 'budget'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMember, setSelectedMember] = useState<FamilyMember | 'Todos'>('Todos');

  // Load data from Supabase on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.getAll();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados. Verifique a conexão ou as chaves de API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      const savedTransaction = await transactionService.add(t);
      setTransactions(prev => [savedTransaction, ...prev]);
    } catch (err) {
      alert('Erro ao salvar transação. Tente novamente.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Erro ao excluir. Tente novamente.');
    }
  };

  const getFilteredTransactions = () => {
    const monthStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM
    
    return transactions.filter(t => {
      const matchesMonth = t.date.startsWith(monthStr);
      const matchesMember = selectedMember === 'Todos' || t.user === selectedMember;
      return matchesMonth && matchesMember;
    });
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + increment);
      return newDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p>Sincronizando com o banco de dados da família...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="bg-white border-r border-slate-200 w-full md:w-64 flex-shrink-0 flex flex-col fixed md:relative z-20 h-16 md:h-auto overflow-hidden">
        <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-100 md:border-none">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Wallet size={24} />
          </div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight hidden md:block leading-tight">
            Família da Liz<br/>
            <span className="text-xs font-normal text-slate-500">Controle de Gastos</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-2 md:p-4 flex md:flex-col gap-1 md:gap-2 justify-around md:justify-start">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-sm font-medium ${
              currentView === 'dashboard' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('budget')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-sm font-medium ${
              currentView === 'budget' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <PieChart size={20} />
            <span className="hidden md:inline">Orçamento</span>
          </button>

          <button 
            onClick={() => setCurrentView('transactions')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-sm font-medium ${
              currentView === 'transactions' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <List size={20} />
            <span className="hidden md:inline">Transações</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8 pb-20 md:pb-0">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
              {/* Month Selector */}
              <div className="flex items-center bg-white rounded-full border border-slate-200 shadow-sm p-1">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-1 min-w-[140px] text-center font-semibold text-slate-800">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Family Member Filter */}
              <div className="relative group">
                <div className="flex items-center bg-white rounded-full border border-slate-200 shadow-sm px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                  <Users size={16} className="text-slate-500 mr-2" />
                  <select 
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value as FamilyMember | 'Todos')}
                    className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer appearance-none pr-6 outline-none"
                  >
                    <option value="Todos">Toda a Família</option>
                    {FAMILY_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={20} />
              Nova Transação
            </button>
          </div>

          {error && (
             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
               {error} <br/>
               <span className="text-xs text-red-500">Dica: Edite o arquivo services/supabaseClient.ts com suas chaves.</span>
             </div>
          )}

          {/* Content Views */}
          <div className="animate-fade-in">
            {currentView === 'dashboard' ? (
              <Dashboard 
                transactions={filteredTransactions} 
              />
            ) : currentView === 'budget' ? (
              <BudgetView transactions={filteredTransactions} />
            ) : (
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={handleDeleteTransaction}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <TransactionForm 
          onAdd={handleAddTransaction} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;