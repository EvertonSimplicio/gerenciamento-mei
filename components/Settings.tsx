
import React, { useState } from 'react';
import { User, TransactionType } from '../types';

interface SettingsProps {
  user: User;
  onUpdate: (user: User) => void;
  categories: { INCOME: string[], EXPENSE: string[] };
  setCategories: React.Dispatch<React.SetStateAction<{ INCOME: string[], EXPENSE: string[] }>>;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate, categories, setCategories }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [showToast, setShowToast] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<TransactionType>(TransactionType.INCOME);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const typeKey = categoryType === TransactionType.INCOME ? 'INCOME' : 'EXPENSE';
    if (categories[typeKey].includes(newCategoryName.trim())) return;

    setCategories(prev => ({
      ...prev,
      [typeKey]: [...prev[typeKey], newCategoryName.trim()]
    }));
    setNewCategoryName('');
  };

  const removeCategory = (type: TransactionType, cat: string) => {
    const typeKey = type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE';
    setCategories(prev => ({
      ...prev,
      [typeKey]: prev[typeKey].filter(c => c !== cat)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <header>
        <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Configurações do Sistema</h1>
        <p className="text-black font-bold">Personalize os dados da sua empresa e categorias de fluxo.</p>
      </header>

      {/* Dados da Empresa */}
      <section className="bg-white rounded-3xl shadow-sm border-2 border-black overflow-hidden">
        <div className="bg-slate-900 text-white px-8 py-4 flex items-center gap-3">
          <i className="fas fa-building"></i>
          <h2 className="font-black uppercase text-sm tracking-widest">Dados da Empresa</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-black uppercase ml-1">Nome Fantasia</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                value={formData.meiName}
                onChange={(e) => setFormData({...formData, meiName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-black uppercase ml-1">CNPJ</label>
              <input 
                type="text" 
                placeholder="00.000.000/0001-00"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
                value={formData.cnpj || ''}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-black uppercase ml-1">Razão Social</label>
            <input 
              type="text" 
              placeholder="Nome Completo do MEI + CPF"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
              value={formData.razaoSocial || ''}
              onChange={(e) => setFormData({...formData, razaoSocial: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-black uppercase ml-1">Endereço Comercial</label>
            <input 
              type="text" 
              placeholder="Rua, Número, Bairro, Cidade - UF"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-black"
              value={formData.endereco || ''}
              onChange={(e) => setFormData({...formData, endereco: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl"
          >
            ATUALIZAR DADOS DA EMPRESA
          </button>
        </form>
      </section>

      {/* Categorias */}
      <section className="bg-white rounded-3xl shadow-sm border-2 border-black overflow-hidden">
        <div className="bg-slate-900 text-white px-8 py-4 flex items-center gap-3">
          <i className="fas fa-tags"></i>
          <h2 className="font-black uppercase text-sm tracking-widest">Categorias de Lançamentos</h2>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-black text-black uppercase">Nome da Categoria</label>
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Consultoria, Softwares, etc"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none text-black font-black"
              />
            </div>
            <div className="w-full md:w-48 space-y-1">
              <label className="text-xs font-black text-black uppercase">Tipo</label>
              <select 
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value as TransactionType)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none text-black font-black"
              >
                <option value={TransactionType.INCOME}>Entrada</option>
                <option value={TransactionType.EXPENSE}>Saída</option>
              </select>
            </div>
            <button 
              onClick={addCategory}
              className="md:mt-5 bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-slate-800 transition-all shadow-md"
            >
              Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna Entradas */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-arrow-up"></i> Categorias de Entrada
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.INCOME.map(cat => (
                  <div key={cat} className="group bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-900">{cat}</span>
                    <button 
                      onClick={() => removeCategory(TransactionType.INCOME, cat)}
                      className="text-emerald-300 hover:text-rose-600 transition-colors"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna Saídas */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-arrow-down"></i> Categorias de Saída
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.EXPENSE.map(cat => (
                  <div key={cat} className="group bg-rose-50 border-2 border-rose-200 px-4 py-2 rounded-xl flex items-center gap-3">
                    <span className="text-sm font-black text-rose-900">{cat}</span>
                    <button 
                      onClick={() => removeCategory(TransactionType.EXPENSE, cat)}
                      className="text-rose-300 hover:text-rose-600 transition-colors"
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-50">
          <i className="fas fa-check-circle mr-2"></i> DADOS SALVOS COM SUCESSO!
        </div>
      )}
    </div>
  );
};

export default Settings;
