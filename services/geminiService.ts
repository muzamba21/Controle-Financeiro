import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (transactions: Transaction[], month: string): Promise<string> => {
  if (transactions.length === 0) {
    return "Adicione transações para receber uma análise financeira inteligente.";
  }

  // Prepare a summary for the AI to reduce token usage
  const summary = transactions.map(t => 
    `- ${t.date}: ${t.description} (${t.category}) - R$ ${t.amount.toFixed(2)} (${t.type === 'income' ? 'Receita' : 'Despesa'})`
  ).join('\n');

  const prompt = `
    Atue como um consultor financeiro pessoal experiente.
    Analise as seguintes transações financeiras do mês de ${month} e forneça um resumo executivo curto e direto (máximo 3 parágrafos).
    
    Dados:
    ${summary}

    Diretrizes:
    1. Identifique a categoria de maior gasto.
    2. Aponte se o usuário está gastando mais do que ganha (se houver dados de receita).
    3. Dê uma dica prática e acionável para economizar no próximo mês baseada nos padrões de gasto identificados.
    4. Use formatação Markdown (negrito, listas) para facilitar a leitura.
    5. Seja encorajador mas realista.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return "Ocorreu um erro ao tentar conectar com a inteligência artificial. Verifique sua conexão ou tente mais tarde.";
  }
};