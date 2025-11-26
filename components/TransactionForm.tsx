import React, { useState } from 'react';
import { Plus, X, User, Calculator, Save } from 'lucide-react';
import { Category, CATEGORIES, Transaction, TransactionType, FamilyMember, FAMILY_MEMBERS } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate?: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction | null;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onUpdate, initialData, onClose }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Outros');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [isFixed, setIsFixed] = useState(initialData?.isFixed || false);
  const [user, setUser] = useState<FamilyMember>(initialData?.user || 'Casa');
  
  // States for installments (Only available when adding new)
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState(2);

  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const numericAmount = parseFloat(amount);

    // If editing, skip installment logic and just update
    if (isEditing && initialData && onUpdate) {
      onUpdate(initialData.id, {
        description,
        amount: numericAmount,
        type,
        category,
        date,
        isFixed,
        user
      });
      onClose();
      return;
    }

    // Logic for Installments (Only for new expenses)
    if (type === 'expense' && isInstallment && installments > 1) {
      const installmentValue = numericAmount / installments;
      
      // Parse date parts to handle month increment correctly
      const [yearStr, monthStr, dayStr] = date.split('-');
      const startYear = parseInt(yearStr);
      const startMonth = parseInt(monthStr) - 1; // JS months are 0-11
      const startDay = parseInt(dayStr);

      for (let i = 0; i < installments; i++) {
        // Calculate date for this installment
        const currentDate = new Date(startYear, startMonth + i, startDay);
        
        // Format back to YYYY-MM-DD
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${y}-${m}-${d}`;

        onAdd({
          description: `${description} (${i + 1}/${installments})`, // Adds (1/12) observation
          amount: installmentValue, // Stores only the installment value
          type,
          category,
          date: formattedDate,
          isFixed,
          user
        });
      }
    } else {
      // Standard single transaction
      onAdd({
        description,
        amount: numericAmount,
        type,
        category,
        date,
        isFixed,
        user
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto transition-colors">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Selection */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'expense' 
                  ? 'bg-white dark:bg-slate-600 text-rose-600 dark:text-rose-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setIsInstallment(false); // Reset installment if income
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'income' 
                  ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Receita
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mercado, TV Nova"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {isInstallment ? 'Valor Total (R$)' : 'Valor (R$)'}
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Installment Toggle (Only for New Expenses) */}
          {type === 'expense' && !isEditing && (
            <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="isInstallment" 
                  checked={isInstallment} 
                  onChange={(e) => {
                    setIsInstallment(e.target.checked);
                    if (e.target.checked) setIsFixed(false); // Can't be fixed and installment usually
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-500 rounded focus:ring-blue-500 bg-white dark:bg-slate-600"
                />
                <label htmlFor="isInstallment" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calculator size={14} />
                  Compra Parcelada?
                </label>
              </div>
              
              {isInstallment && (
                <div className="ml-6 animate-fade-in space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-600 dark:text-slate-400 min-w-[80px]">Parcelas:</label>
                    <input
                      type="number"
                      min="2"
                      max="60"
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value) || 2)}
                      className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">vezes</span>
                  </div>
                  {amount && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium ml-1">
                      = {installments}x de R$ {(parseFloat(amount) / installments).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
              <div className="relative">
                <select
                  value={user}
                  onChange={(e) => setUser(e.target.value as FamilyMember)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all appearance-none"
                >
                  {FAMILY_MEMBERS.map((member) => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
                <User className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {!isInstallment && (
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isFixed" 
                checked={isFixed} 
                onChange={(e) => setIsFixed(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-500 rounded focus:ring-blue-500 bg-white dark:bg-slate-600"
              />
              <label htmlFor="isFixed" className="text-sm text-slate-700 dark:text-slate-300">
                {type === 'expense' ? 'Despesa Fixa (Recorrente)' : 'Receita Fixa'}
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isEditing ? <Save size={20} /> : <Plus size={20} />}
            {isEditing ? 'Salvar Alterações' : (isInstallment ? `Gerar ${installments} Lançamentos` : 'Adicionar')}
          </button>
        </form>
      </div>
    </div>
  );
};