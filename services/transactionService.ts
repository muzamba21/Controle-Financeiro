import { supabase } from './supabaseClient';
import { Transaction } from '../types';

export const transactionService = {
  // Buscar todas as transações
  async getAll() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }

    // Mapear do formato do banco (snake_case) para o frontend (camelCase) se necessário
    // Como criamos a tabela com family_member, mapeamos para user
    return data.map((item: any) => ({
      ...item,
      isFixed: item.is_fixed,
      user: item.family_member // Mapeando coluna do banco para propriedade do frontend
    })) as Transaction[];
  },

  // Adicionar transação
  async add(transaction: Omit<Transaction, 'id'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        is_fixed: transaction.isFixed,
        family_member: transaction.user // Mapeando frontend para coluna do banco
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }

    return {
      ...data,
      isFixed: data.is_fixed,
      user: data.family_member
    } as Transaction;
  },

  // Deletar transação
  async delete(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  }
};
