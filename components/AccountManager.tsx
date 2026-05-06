
import React, { useState } from 'react';
import { Account } from '../types';

interface AccountManagerProps {
  accounts: Account[];
  onUpdateAccount: (acc: Account) => void;
  onAddAccount: (acc: Omit<Account, 'id' | 'userId'>) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ accounts, onUpdateAccount, onAddAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{name: string, balance: number, color: string, type: 'CHECKING' | 'SAVINGS' | 'CASH' | 'INVESTMENT'}>({ 
    name: '', 
    balance: 0, 
    color: 'bg-blue-600',
    type: 'CHECKING'
  });

  const openAdd = () => {
    setFormData({ name: '', balance: 0, color: 'bg-emerald-600', type: 'CHECKING' });
    setEditId(null);
    setIsModalOpen(true);
  };

  const openEdit = (acc: Account) => {
    setFormData({ name: acc.name, balance: acc.balance, color: acc.color, type: acc.type || 'CHECKING' });
    setEditId(acc.id);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      const acc = accounts.find(a => a.id === editId);
      if (acc) {
        onUpdateAccount({ ...acc, ...formData });
      }
    } else {
      onAddAccount(formData);
    }
    setIsModalOpen(false);
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
                  onClick={() => openEdit(acc)}
                  className="text-black hover:text-blue-600 transition-all p-2 hover:bg-slate-100 rounded-full"
                  title="Editar conta"
                >
                  <i className="fas fa-ellipsis-v text-xl"></i>
                </button>
              </div>
              <h3 className="text-lg font-black text-black mb-1">{acc.name}</h3>
              <p className="text-black font-bold text-xs mb-4 uppercase tracking-tighter opacity-80">
                {acc.type === 'CHECKING' ? 'Conta Corrente' : 
                 acc.type === 'SAVINGS' ? 'Poupança' : 
                 acc.type === 'CASH' ? 'Dinheiro em Espécie' : 'Investimento'}
              </p>
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

        <button onClick={openAdd} className="border-4 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-black hover:border-blue-400 hover:text-blue-700 transition-all bg-slate-50">
          <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-300 flex items-center justify-center shadow-sm mb-4">
            <i className="fas fa-plus text-xl"></i>
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Adicionar Nova Conta</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden border-2 border-black animate-in zoom-in duration-200">
            <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-black uppercase">{editId ? 'Editar Conta' : 'Nova Conta'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-black hover:text-rose-600">
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
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase ml-1">{editId ? 'Saldo Atual (Ajuste)' : 'Saldo Inicial'}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-black">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase ml-1">Tipo de Conta</label>
                <select 
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="CHECKING">Conta Corrente</option>
                  <option value="SAVINGS">Poupança</option>
                  <option value="CASH">Dinheiro em Espécie</option>
                  <option value="INVESTMENT">Investimento</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-black uppercase ml-1">Cor do Card</label>
                <div className="flex gap-2">
                  {['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600', 'bg-slate-800'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-10 h-10 rounded-full ${color} border-4 transition-all ${formData.color === color ? 'border-black scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl"
              >
                {editId ? 'Salvar Alterações' : 'Adicionar Conta'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountManager;
