export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Salário'
  | 'Investimentos'
  | 'Outros';

export type FamilyMember = 'Liz' | 'Pai' | 'Mãe' | 'Casa';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO string YYYY-MM-DD
  isFixed?: boolean;
  user: FamilyMember; // Who made the transaction
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const CATEGORIES: Category[] = [
  'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Salário', 'Investimentos', 'Outros'
];

export const FAMILY_MEMBERS: FamilyMember[] = ['Liz', 'Pai', 'Mãe', 'Casa'];