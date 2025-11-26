import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, Plus, ChevronLeft, ChevronRight, Wallet, PieChart, Loader2, Users, Moon, Sun, LogOut } from 'lucide-react';
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
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  // Apply Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p>Sincronizando com o banco de dados da família...</p>
      </div>
    );
  }

  const NavItem = ({ view, icon: Icon, label }: { view: 'dashboard' | 'transactions' | 'budget', icon: any, label: string }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-sm font-medium group relative overflow-hidden ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-white' : ''} />
      <span className="hidden md:inline">{label}</span>
      {currentView === view && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 w-full md:w-72 flex-shrink-0 flex flex-col fixed md:relative z-20 h-16 md:h-screen transition-colors duration-200">
        <div className="p-4 md:p-8 flex items-center gap-3 md:mb-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Wallet size={24} />
          </div>
          <h1 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight hidden md:block leading-tight">
            Família da Liz<br/>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Controle de Gastos</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-2 md:px-6 flex md:flex-col gap-1 md:gap-2 justify-around md:justify-start items-center md:items-stretch">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="budget" icon={PieChart} label="Orçamento" />
          <NavItem view="transactions" icon={List} label="Transações" />
        </nav>

        {/* Sidebar Footer (Desktop) */}
        <div className="hidden md:flex flex-col gap-4 p-6 border-t border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-10">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex flex-wrap items-center justify-between md:justify-start gap-3 w-full md:w-auto">
              {/* Mobile Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="md:hidden p-3 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Month Selector */}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm p-1 transition-colors">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                  <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-1 min-w-[140px] text-center font-semibold text-slate-800 dark:text-slate-100">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Family Member Filter */}
              <div className="relative group">
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                  <Users size={16} className="text-slate-500 dark:text-slate-400 mr-2" />
                  <select 
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value as FamilyMember | 'Todos')}
                    className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer appearance-none pr-6 outline-none"
                  >
                    <option value="Todos" className="dark:bg-slate-800">Toda a Família</option>
                    {FAMILY_MEMBERS.map(member => (
                      <option key={member} value={member} className="dark:bg-slate-800">{member}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={20} />
              Nova Transação
            </button>
          </div>

          {error && (
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
               {error} <br/>
               <span className="text-xs text-red-500 dark:text-red-400">Dica: Edite o arquivo services/supabaseClient.ts com suas chaves.</span>
             </div>
          )}

          {/* Content Views */}
          <div className="animate-fade-in">
            {currentView === 'dashboard' ? (
              <Dashboard 
                transactions={filteredTransactions}
                isDarkMode={isDarkMode}
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