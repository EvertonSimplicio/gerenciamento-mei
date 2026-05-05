
import React, { useState } from 'react';
import { Account } from '../types';

interface AccountManagerProps {
  accounts: Account[];
  onUpdateAccount: (acc: Account) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ accounts, onUpdateAccount }) => {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      onUpdateAccount(editingAccount);
      setEditingAccount(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-black">Minhas Contas</h1>
          <p className="text-black font-bold">Gerencie seus saldos e contas bancárias.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 overflow-hidden group">
            <div className={`h-2 ${acc.color}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <i className={`fas fa-university text-xl text-black transition-colors`}></i>
                </div>
                <button 
                  onClick={() => setEditingAccount(acc)}
                  className="text-black hover:text-blue-600 transition-all p-2 hover:bg-slate-100 rounded-full"
                  title="Editar conta"
                >
                  <i className="fas fa-ellipsis-v text-xl"></i>
                </button>
              </div>
              <h3 className="text-lg font-black text-black mb-1">{acc.name}</h3>
              <p className="text-black font-bold text-xs mb-4 uppercase tracking-tighter opacity-80">Conta Corrente PJ</p>
              <p className="text-2xl font-black text-black">
                {acc.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              
              <div className="mt-6 pt-6 border-t-2 border-slate-100 flex justify-between items-center text-xs font-black">
                <span className="text-emerald-700 uppercase tracking-widest"><i className="fas fa-check-circle mr-1"></i> ATIVA</span>
                <span className="text-black opacity-60">Atualizado agora</span>
              </div>
            </div>
          </div>
        ))}

        <button className="border-4 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-black hover:border-blue-400 hover:text-blue-700 transition-all bg-slate-50">
          <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-300 flex items-center justify-center shadow-sm mb-4">
            <i className="fas fa-plus text-xl"></i>
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Adicionar Nova Conta</span>
        </button>
      </div>

      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingAccount(null)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden border-2 border-black animate-in zoom-in duration-200">
            <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-black uppercase">Editar Conta</h2>
              <button onClick={() => setEditingAccount(null)} className="text-black hover:text-rose-600">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase ml-1">Nome da Conta</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase ml-1">Saldo Atual (Ajuste)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-black">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                    value={editingAccount.balance}
                    onChange={(e) => setEditingAccount({...editingAccount, balance: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase ml-1">Cor do Card</label>
                <div className="flex gap-2">
                  {['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600', 'bg-slate-800'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingAccount({...editingAccount, color})}
                      className={`w-10 h-10 rounded-full ${color} border-4 transition-all ${editingAccount.color === color ? 'border-black scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-3">Precisa de crédito?</h2>
          <p className="font-bold max-w-md mb-8 text-blue-50 text-lg leading-snug">Como MEI, você tem acesso a taxas exclusivas para expandir seu negócio. Confira as ofertas dos nossos parceiros.</p>
          <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-lg uppercase tracking-widest text-sm">
            Ver Ofertas Disponíveis
          </button>
        </div>
        <i className="fas fa-rocket absolute -right-10 -bottom-10 text-[200px] opacity-10 rotate-12"></i>
      </div>
    </div>
  );
};

export default AccountManager;
