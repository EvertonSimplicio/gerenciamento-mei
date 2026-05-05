
import React, { useState, useEffect } from 'react';
import { TransactionType, Account, Transaction } from '../types';

interface AddTransactionModalProps {
  onClose: () => void;
  onSubmit: (tx: any) => void;
  accounts: Account[];
  categories: { INCOME: string[], EXPENSE: string[] };
  initialData?: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onSubmit, accounts, categories, initialData }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || TransactionType.INCOME);
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || (initialData?.type === TransactionType.EXPENSE ? categories.EXPENSE[0] : categories.INCOME[0]));
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [hasInvoice, setHasInvoice] = useState(initialData?.hasInvoice || false);

  // Atualiza a categoria selecionada se o tipo mudar
  useEffect(() => {
    if (!initialData) {
      setCategory(type === TransactionType.INCOME ? categories.INCOME[0] : categories.EXPENSE[0]);
    }
  }, [type, categories, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const txData = {
      type,
      amount: parseFloat(amount),
      description,
      category,
      accountId,
      date,
      hasInvoice: type === TransactionType.INCOME ? hasInvoice : false
    };

    if (initialData) {
      onSubmit({ ...txData, id: initialData.id });
    } else {
      onSubmit(txData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border-2 border-black max-h-[90vh] flex flex-col">
        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-black uppercase">{initialData ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button onClick={onClose} className="text-black hover:text-rose-600 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Type Toggle */}
          <div className="flex bg-slate-200 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === TransactionType.INCOME ? 'bg-white text-emerald-800 shadow-md border border-slate-300' : 'text-black'}`}
            >
              <i className="fas fa-plus-circle mr-2"></i>ENTRADA
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === TransactionType.EXPENSE ? 'bg-white text-rose-800 shadow-md border border-slate-300' : 'text-black'}`}
            >
              <i className="fas fa-minus-circle mr-2"></i>SAÍDA
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-black uppercase ml-1">Valor do Lançamento</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-black text-xl">R$</span>
              <input 
                autoFocus
                type="number" 
                step="0.01"
                required
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-3xl font-black text-black"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-black uppercase ml-1">Descrição</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-black"
              placeholder="Ex: Venda de produto X"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-black uppercase ml-1">Categoria</label>
              <select 
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {(type === TransactionType.INCOME ? categories.INCOME : categories.EXPENSE).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-black uppercase ml-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-black uppercase ml-1">Conta Financeira</label>
            <select 
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (Saldo: R$ {acc.balance.toFixed(2)})</option>
              ))}
            </select>
          </div>

          {type === TransactionType.INCOME && (
            <div className="flex items-center space-x-3 bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasInvoice}
                  onChange={(e) => setHasInvoice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <div className="flex flex-col">
                <span className="text-xs font-black text-black uppercase">Emiti Nota Fiscal</span>
                <span className="text-[10px] text-slate-500 font-bold">Marque se esta venda teve NF emitida</span>
              </div>
            </div>
          )}

          <button 
            type="submit"
            className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] ${type === TransactionType.INCOME ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-500/20' : 'bg-rose-700 hover:bg-rose-800 shadow-rose-500/20'}`}
          >
            {initialData ? 'SALVAR ALTERAÇÕES' : `CONFIRMAR ${type === TransactionType.INCOME ? 'RECEBIMENTO' : 'PAGAMENTO'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
