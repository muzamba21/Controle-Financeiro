import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, Plus, ChevronLeft, ChevronRight, Wallet, PieChart, Loader2, Users, Moon, Sun } from 'lucide-react';
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

  const handleUpdateTransaction = async (id: string, updates: Omit<Transaction, 'id'>) => {
    try {
      const updatedTransaction = await transactionService.update(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
    } catch (err) {
      alert('Erro ao atualizar transação. Tente novamente.');
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

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
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
      className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all w-full text-xs md:text-sm font-medium ${
        currentView === view 
          ? 'text-blue-600 dark:text-blue-400 md:bg-blue-50 md:dark:bg-blue-900/20' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={24} className={`mb-1 md:mb-0 ${currentView === view ? 'fill-current opacity-20 md:opacity-100 md:fill-none' : ''}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100">Família da Liz</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestão Financeira</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Visão Geral" />
            <NavItem view="budget" icon={PieChart} label="Orçamento" />
            <NavItem view="transactions" icon={List} label="Extrato" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
           <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Wallet size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-800 dark:text-slate-100">Família da Liz</h1>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-500 dark:text-slate-400"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        <div className="space-y-6 md:space-y-8">
          
          {/* Filters & Actions Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Controls Group */}
              <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {/* Month Selector */}
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-1 shrink-0">
                  <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-3 min-w-[120px] text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </div>
                  <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500">
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Member Filter */}
                <div className="relative shrink-0">
                  <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm px-3 py-2 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                    <Users size={16} className="text-slate-400 mr-2" />
                    <select 
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value as FamilyMember | 'Todos')}
                      className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer appearance-none pr-6 outline-none py-0"
                    >
                      <option value="Todos" className="dark:bg-slate-800">Todos</option>
                      {FAMILY_MEMBERS.map(member => (
                        <option key={member} value={member} className="dark:bg-slate-800">{member}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 w-full md:w-auto"
              >
                <Plus size={18} />
                <span className="md:hidden">Adicionar Transação</span>
                <span className="hidden md:inline">Nova Transação</span>
              </button>
            </div>
          </div>

          {error && (
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
               {error}
             </div>
          )}

          {/* Dynamic Content */}
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
                onEdit={openEditModal}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Fixed) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between items-center z-40 safe-area-bottom">
        <NavItem view="dashboard" icon={LayoutDashboard} label="Início" />
        <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
        <NavItem view="budget" icon={PieChart} label="Orçamento" />
        <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
        <NavItem view="transactions" icon={List} label="Extrato" />
      </nav>

      {/* Modal Overlay */}
      {isModalOpen && (
        <TransactionForm 
          onAdd={handleAddTransaction}
          onUpdate={handleUpdateTransaction}
          initialData={editingTransaction}
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}

export default App;