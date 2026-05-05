
import { Account, Transaction, TransactionType } from './types';

// userId is injected at runtime in App.tsx when creating initial data for new users
export const INITIAL_ACCOUNTS: Omit<Account, 'userId'>[] = [
  { id: '1', name: 'Conta Principal PJ', balance: 5240.50, color: 'bg-blue-600', type: 'CHECKING' },
  { id: '2', name: 'Caixa Físico', balance: 450.00, color: 'bg-emerald-600', type: 'CASH' },
  { id: '3', name: 'Nubank PJ', balance: 1200.00, color: 'bg-purple-600', type: 'CHECKING' },
];

export const CATEGORIES = {
  INCOME: ['Venda de Produtos', 'Prestação de Serviços', 'Outros'],
  EXPENSE: ['Aluguel', 'DAS-MEI', 'Fornecedores', 'Internet/Luz', 'Marketing', 'Retirada Pró-labore', 'Outros']
};

// userId and accountId are injected at runtime in App.tsx
export const INITIAL_TRANSACTIONS: Omit<Transaction, 'userId'>[] = [
  {
    id: 't1',
    date: new Date().toISOString().split('T')[0],
    description: 'Venda Consultoria TI',
    amount: 1500.00,
    type: TransactionType.INCOME,
    category: 'Prestação de Serviços',
    accountId: '1'
  },
  {
    id: 't2',
    date: new Date().toISOString().split('T')[0],
    description: 'Pagamento DAS-MEI',
    amount: 72.00,
    type: TransactionType.EXPENSE,
    category: 'DAS-MEI',
    accountId: '1'
  }
];
