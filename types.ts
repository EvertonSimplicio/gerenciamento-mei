
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  hasInvoice?: boolean;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  balance: number;
  color: string;
  type?: 'CHECKING' | 'SAVINGS' | 'CASH' | 'INVESTMENT';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  meiName: string;
  cnpj?: string;
  razaoSocial?: string;
  endereco?: string;
  meiLimit?: number;
}

export interface AppState {
  transactions: Transaction[];
  accounts: Account[];
  user: User | null;
}

