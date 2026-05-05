
import React, { useState } from 'react';
import { Transaction, TransactionType, Account } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, accounts, onDelete, onEdit }) => {
  const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = transactions.filter(t => {
    const matchesFilter = filter === 'ALL' || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalize date to YYYY-MM-DD for simple comparison
    const txDate = new Date(t.date).toISOString().split('T')[0];
    const matchesDateRange = (!startDate || txDate >= startDate) && (!endDate || txDate <= endDate);

    return matchesFilter && matchesSearch && matchesDateRange;
  });

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'N/A';

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 overflow-hidden">
      {/* Cabeçalho de Filtros */}
      <div className="p-4 md:p-6 border-b-2 border-slate-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Extrato de Lançamentos</h2>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <button 
              onClick={() => setFilter('ALL')}
              className={`whitespace-nowrap px-4 py-2 text-xs font-black rounded-lg transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-black hover:bg-slate-300'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter(TransactionType.INCOME)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-black rounded-lg transition-colors ${filter === TransactionType.INCOME ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-black hover:bg-slate-300'}`}
            >
              Entradas
            </button>
            <button 
              onClick={() => setFilter(TransactionType.EXPENSE)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-black rounded-lg transition-colors ${filter === TransactionType.EXPENSE ? 'bg-rose-600 text-white' : 'bg-slate-200 text-black hover:bg-slate-300'}`}
            >
              Saídas
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">De</label>
            <input 
              type="date"
              className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Até</label>
            <input 
              type="date"
              className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <div className="flex items-end">
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="px-4 py-2 bg-slate-200 text-black text-[10px] font-black rounded-xl hover:bg-slate-300 transition-colors uppercase h-[42px]"
              >
                Limpar Datas
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-black"></i>
          <input 
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-black font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista Mobile / Tabela Desktop */}
      <div className="overflow-x-auto lg:overflow-visible">
        {/* Tabela Desktop */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-slate-100 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest w-24">Data</th>
              <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest">Descrição</th>
              <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest w-32 hidden lg:table-cell">Categoria</th>
              <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest w-32 hidden lg:table-cell">Conta</th>
              <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-right w-32">Valor</th>
              <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-right w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-black font-black">
                  <i className="fas fa-receipt text-4xl mb-3 block text-slate-400"></i>
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-black font-black">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4 text-xs font-black text-black leading-tight">
                    <div className="max-w-[150px] md:max-w-none break-words">
                      <div className="flex items-center gap-2">
                        {tx.description}
                        {tx.hasInvoice && (
                          <span className="bg-blue-100 text-blue-700 text-[8px] px-1.5 py-0.5 rounded border border-blue-200" title="Nota Fiscal Emitida">NF</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span className="px-2 py-1 text-[10px] font-black rounded-md bg-slate-200 text-black border border-slate-300">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px] text-black font-bold hidden lg:table-cell">
                    {getAccountName(tx.accountId)}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-xs font-black text-right ${tx.type === TransactionType.INCOME ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'} {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => onEdit(tx)}
                        className="text-black hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </button>
                      <button 
                        onClick={() => onDelete(tx.id)}
                        className="text-black hover:text-rose-700 transition-colors p-2 hover:bg-rose-50 rounded-lg"
                        title="Excluir"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Lista Mobile (Cards) */}
        <div className="md:hidden divide-y-2 divide-slate-50">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-black font-black">
              <i className="fas fa-receipt text-4xl mb-3 block text-slate-400"></i>
              Nenhum lançamento encontrado.
            </div>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="p-4 active:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black text-black">{tx.description}</span>
                      {tx.hasInvoice && (
                        <span className="bg-blue-100 text-blue-700 text-[8px] px-1 py-0.5 rounded border border-blue-200">NF</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-black ${tx.type === TransactionType.INCOME ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'} {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-black rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
                      {tx.category}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-black rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
                      {getAccountName(tx.accountId)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEdit(tx)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-100 text-black rounded-lg"
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button 
                      onClick={() => onDelete(tx.id)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-100 text-rose-600 rounded-lg"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
