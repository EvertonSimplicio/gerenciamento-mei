
import React, { useState, useEffect } from 'react';
import { User, Transaction, Account, TransactionType } from './types';
import { CATEGORIES as DEFAULT_CATEGORIES, INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AccountManager from './components/AccountManager';
import Navbar from './components/Navbar';
import AddTransactionModal from './components/AddTransactionModal';
import MeiReport from './components/MeiReport';
import Settings from './components/Settings';
import { auth } from './lib/firebase';
import { firebaseService } from './lib/firebaseService';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'transactions' | 'accounts' | 'reports' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<{ INCOME: string[], EXPENSE: string[] }>(DEFAULT_CATEGORIES);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("Auth state change:", fbUser?.uid);
      if (fbUser) {
        setLoading(true);
        try {
          let profile = await firebaseService.getUser(fbUser.uid);
          
          if (!profile) {
            console.log("No profile found, creating one for:", fbUser.uid);
            // New user - create profile
            profile = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Empreendedor',
              email: fbUser.email || '',
              meiName: 'Minha MEI Digital',
              cnpj: '00.000.000/0001-00'
            };
            await firebaseService.saveUser(profile);

            // Create initial accounts with unique IDs
            for (const acc of INITIAL_ACCOUNTS) {
              const uniqueAccId = `${fbUser.uid}_${acc.id}`;
              await firebaseService.saveAccount({ ...acc, id: uniqueAccId, userId: fbUser.uid });
              
              const txsForAcc = INITIAL_TRANSACTIONS.filter(tx => tx.accountId === acc.id);
              for (const tx of txsForAcc) {
                const uniqueTxId = Math.random().toString(36).substr(2, 9);
                await firebaseService.saveTransaction({ ...tx, id: uniqueTxId, accountId: uniqueAccId, userId: fbUser.uid });
              }
            }
          }

          setUser(profile);
          if (profile.categories) {
            setCategories(profile.categories);
          }
        } catch (err: any) {
          console.error("Erro ao carregar perfil:", err);
          let errorMessage = err.message;
          try {
            const parsed = JSON.parse(err.message);
            if (parsed.error) errorMessage = parsed.error;
          } catch (e) {
            // Not JSON
          }
          
          if (errorMessage.toLowerCase().includes("permission") || errorMessage.toLowerCase().includes("insufficient")) {
             setErrorState("Erro de permissão no Firebase. Tente abrir o app em uma nova aba e fazer login de novo.");
          } else {
             setErrorState(`Erro: ${errorMessage}`);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Monitor Data (Transactions & Accounts)
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccounts([]);
      return;
    }

    const unsubTxs = firebaseService.subscribeToTransactions(user.id, (txs) => {
      setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    const unsubAccs = firebaseService.subscribeToAccounts(user.id, (accs) => {
      setAccounts(accs);
    });

    return () => {
      unsubTxs();
      unsubAccs();
    };
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  const updateUserSettings = async (updatedUser: User) => {
    setUser(updatedUser);
    await firebaseService.saveUser(updatedUser);
  };

  const handleSetCategories = async (newCategories: { INCOME: string[], EXPENSE: string[] }) => {
    setCategories(newCategories);
    if (user) {
      const updatedUser = { ...user, categories: newCategories };
      setUser(updatedUser);
      await firebaseService.saveUser(updatedUser);
    }
  };

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      if (!user) return;
      const id = Math.random().toString(36).substr(2, 9);
      const tx = { ...newTx, id, userId: user.id } as Transaction;
      
      await firebaseService.saveTransaction(tx);
      
      // Update account balance
      const acc = accounts.find(a => a.id === tx.accountId);
      if (acc) {
        const change = tx.type === TransactionType.INCOME ? tx.amount : -tx.amount;
        await firebaseService.saveAccount({ ...acc, balance: acc.balance + change });
      }
      
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error("Erro ao adicionar lançamento:", error);
      alert("Erro ao salvar o lançamento: " + error.message);
    }
  };

  const updateTransaction = async (updatedTx: Transaction) => {
    try {
      if (!user) return;
      const oldTx = transactions.find(t => t.id === updatedTx.id);
      if (!oldTx) return;

      const finalTx = { ...oldTx, ...updatedTx } as Transaction;

      await firebaseService.saveTransaction(finalTx);

      // Handle balance changes if account or amount changed
      if (oldTx.accountId === finalTx.accountId) {
        const acc = accounts.find(a => a.id === finalTx.accountId);
        if (acc) {
          const oldChange = oldTx.type === TransactionType.INCOME ? oldTx.amount : -oldTx.amount;
          const newChange = finalTx.type === TransactionType.INCOME ? finalTx.amount : -finalTx.amount;
          const netChange = newChange - oldChange;
          await firebaseService.saveAccount({ ...acc, balance: acc.balance + netChange });
        }
      } else {
        // Different accounts
        const oldAcc = accounts.find(a => a.id === oldTx.accountId);
        if (oldAcc) {
          const revertChange = oldTx.type === TransactionType.INCOME ? -oldTx.amount : oldTx.amount;
          await firebaseService.saveAccount({ ...oldAcc, balance: oldAcc.balance + revertChange });
        }
        const newAcc = accounts.find(a => a.id === finalTx.accountId);
        if (newAcc) {
          const applyChange = finalTx.type === TransactionType.INCOME ? finalTx.amount : -finalTx.amount;
          await firebaseService.saveAccount({ ...newAcc, balance: newAcc.balance + applyChange });
        }
      }

      setTransactionToEdit(null);
    } catch (error: any) {
      console.error("Erro ao atualizar lançamento:", error);
      alert("Erro ao atualizar o lançamento: " + error.message);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    await firebaseService.deleteTransaction(id);
    
    const acc = accounts.find(a => a.id === tx.accountId);
    if (acc) {
      const revert = tx.type === TransactionType.INCOME ? -tx.amount : tx.amount;
      await firebaseService.saveAccount({ ...acc, balance: acc.balance + revert });
    }
  };

  const updateAccount = async (updatedAcc: Account) => {
    try {
      await firebaseService.saveAccount(updatedAcc);
    } catch (error: any) {
      console.error("Erro ao atualizar conta:", error);
      alert("Erro ao atualizar a conta: " + error.message);
    }
  };

  const addAccount = async (newAcc: Omit<Account, 'id' | 'userId'>) => {
    if (!user) return;
    try {
      const accToSave: Account = {
        ...newAcc,
        id: Date.now().toString(),
        userId: user.uid
      };
      await firebaseService.saveAccount(accToSave);
    } catch (error: any) {
      console.error("Erro ao adicionar conta:", error);
      alert("Erro ao adicionar a conta: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-black uppercase tracking-widest text-xs">Carregando...</p>
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center">
          <i className="fas fa-exclamation-triangle text-rose-500 text-6xl mb-6"></i>
          <h2 className="text-2xl font-black text-black mb-4 uppercase">Ops! Algo deu errado</h2>
          <p className="text-slate-600 mb-8 font-bold">{errorState}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        activeView={view} 
        setView={setView} 
        onLogout={handleLogout} 
        userName={user.meiName}
      />

      <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
        {view === 'dashboard' && (
          <Dashboard transactions={transactions} accounts={accounts} />
        )}
        {view === 'transactions' && (
          <TransactionList 
            transactions={transactions} 
            accounts={accounts}
            onDelete={deleteTransaction} 
            onEdit={(tx) => setTransactionToEdit(tx)}
          />
        )}
        {view === 'accounts' && (
          <AccountManager 
            accounts={accounts} 
            onUpdateAccount={updateAccount} 
            onAddAccount={addAccount}
          />
        )}
        {view === 'reports' && (
          <MeiReport transactions={transactions} categories={categories} />
        )}
        {view === 'settings' && (
          <Settings 
            user={user} 
            onUpdate={updateUserSettings} 
            categories={categories} 
            setCategories={handleSetCategories} 
          />
        )}
      </main>

      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 transition-all z-40"
      >
        <i className="fas fa-plus"></i>
      </button>

      {isAddModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={addTransaction}
          accounts={accounts}
          categories={categories}
        />
      )}

      {transactionToEdit && (
        <AddTransactionModal 
          initialData={transactionToEdit}
          onClose={() => setTransactionToEdit(null)}
          onSubmit={updateTransaction}
          accounts={accounts}
          categories={categories}
        />
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-2 px-1 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center flex-1 py-1 ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-500'}`}>
          <i className="fas fa-home text-xl"></i>
          <span className="text-[9px] mt-0.5 font-bold">Início</span>
        </button>
        <button onClick={() => setView('transactions')} className={`flex flex-col items-center flex-1 py-1 ${view === 'transactions' ? 'text-blue-600' : 'text-slate-500'}`}>
          <i className="fas fa-exchange-alt text-xl"></i>
          <span className="text-[9px] mt-0.5 font-bold">Extrato</span>
        </button>
        <button onClick={() => setView('reports')} className={`flex flex-col items-center flex-1 py-1 ${view === 'reports' ? 'text-blue-600' : 'text-slate-500'}`}>
          <i className="fas fa-file-invoice-dollar text-xl"></i>
          <span className="text-[9px] mt-0.5 font-bold">Relatórios</span>
        </button>
        <button onClick={() => setView('accounts')} className={`flex flex-col items-center flex-1 py-1 ${view === 'accounts' ? 'text-blue-600' : 'text-slate-500'}`}>
          <i className="fas fa-wallet text-xl"></i>
          <span className="text-[9px] mt-0.5 font-bold">Contas</span>
        </button>
        <button onClick={() => setView('settings')} className={`flex flex-col items-center flex-1 py-1 ${view === 'settings' ? 'text-blue-600' : 'text-slate-500'}`}>
          <i className="fas fa-cog text-xl"></i>
          <span className="text-[9px] mt-0.5 font-bold">Ajustes</span>
        </button>
      </div>
    </div>
  );
};
export default App;

