
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Account, TransactionType } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
}

type PeriodFilter = 'month' | 'year' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts }) => {
  const [filterType, setFilterType] = useState<PeriodFilter>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    transactions.forEach(t => years.add(new Date(t.date).getFullYear()));
    return Array.from(years).sort((a, b) => a - b);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (filterType === 'month') {
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      }
      if (filterType === 'year') {
        return d.getFullYear() === selectedYear;
      }
      return true;
    });
  }, [transactions, filterType, selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    if (filterType === 'month') {
      const data = [];
      const now = new Date(selectedYear, selectedMonth);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const inc = transactions.filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === m && td.getFullYear() === y && t.type === TransactionType.INCOME;
        }).reduce((s, t) => s + t.amount, 0);
        const exp = transactions.filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === m && td.getFullYear() === y && t.type === TransactionType.EXPENSE;
        }).reduce((s, t) => s + t.amount, 0);
        data.push({ name: months[m], faturamento: inc, despesas: exp });
      }
      return data;
    } else {
      return months.map((m, idx) => {
        const inc = transactions.filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === idx && td.getFullYear() === selectedYear && t.type === TransactionType.INCOME;
        }).reduce((s, t) => s + t.amount, 0);
        const exp = transactions.filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === idx && td.getFullYear() === selectedYear && t.type === TransactionType.EXPENSE;
        }).reduce((s, t) => s + t.amount, 0);
        return { name: m, faturamento: inc, despesas: exp };
      });
    }
  }, [transactions, filterType, selectedMonth, selectedYear]);

  const meiLimit = 81000;
  const currentYearFaturamento = transactions
    .filter(t => t.type === TransactionType.INCOME && new Date(t.date).getFullYear() === selectedYear)
    .reduce((sum, t) => sum + t.amount, 0);
  const meiProgress = Math.min((currentYearFaturamento / meiLimit) * 100, 100);

  const monthsList = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-black">Dashboard</h1>
          <p className="text-black font-bold">Controle seu faturamento e limite MEI.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-300">
          <button 
            onClick={() => setFilterType('month')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${filterType === 'month' ? 'bg-blue-600 text-white shadow-md' : 'text-black hover:bg-slate-100'}`}
          >
            MENSAL
          </button>
          <button 
            onClick={() => setFilterType('year')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${filterType === 'year' ? 'bg-blue-600 text-white shadow-md' : 'text-black hover:bg-slate-100'}`}
          >
            ANUAL
          </button>
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${filterType === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-black hover:bg-slate-100'}`}
          >
            TUDO
          </button>
        </div>
      </header>

      {filterType !== 'all' && (
        <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {filterType === 'month' && (
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-white border-2 border-slate-300 rounded-xl px-4 py-2 text-sm font-black text-black shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthsList.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          )}
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white border-2 border-slate-300 rounded-xl px-4 py-2 text-sm font-black text-black shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border-2 border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-black font-black text-[10px] md:text-sm uppercase tracking-wider">Entradas</span>
            <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
              <i className="fas fa-arrow-up text-xs"></i>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-emerald-700 truncate">
            {summary.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-[10px] text-black mt-2 font-black">No período selecionado</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border-2 border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-black font-black text-[10px] md:text-sm uppercase tracking-wider">Saídas</span>
            <div className="w-8 h-8 bg-rose-100 text-rose-800 rounded-lg flex items-center justify-center">
              <i className="fas fa-arrow-down text-xs"></i>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-rose-700 truncate">
            {summary.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-[10px] text-black mt-2 font-black">No período selecionado</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border-2 border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-black font-black text-[10px] md:text-sm uppercase tracking-wider">Saldos</span>
            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center">
              <i className="fas fa-wallet text-xs"></i>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-black truncate">
            {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-[10px] text-black mt-2 font-black">Total hoje</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100">
          <h3 className="text-lg font-black text-black mb-6 uppercase tracking-tight">Comparativo Financeiro</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#000000', fontSize: 12, fontWeight: '900'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#000000', fontSize: 12, fontWeight: '900'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '16px', border: '2px solid #000', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold'}}
                />
                <Bar dataKey="faturamento" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-black mb-1 uppercase tracking-tight">Status Limite MEI {selectedYear}</h3>
            <p className="text-black font-bold text-sm mb-6">Faturamento acumulado no ano.</p>
            
            <div className="flex justify-between mb-3">
              <span className="text-sm font-black text-blue-700">
                {currentYearFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-sm font-black text-black">Teto: R$ 81.000</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden border-2 border-slate-300">
              <div 
                className={`h-full transition-all duration-1000 ${meiProgress > 90 ? 'bg-rose-500' : meiProgress > 70 ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${meiProgress}%` }}
              ></div>
            </div>
            
            <div className="mt-6 p-5 bg-blue-50 rounded-2xl text-black text-sm border-2 border-blue-200">
              <div className="flex items-start space-x-3">
                <i className="fas fa-info-circle mt-1 text-blue-700"></i>
                <div className="font-black">
                  Você utilizou {meiProgress.toFixed(1)}% do limite. 
                  <p className="mt-1 font-bold opacity-90">Restam {(meiLimit - currentYearFaturamento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para o limite anual.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t-2 border-slate-100 pt-6">
             <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">Saldos Bancários</h4>
             <div className="space-y-4">
               {accounts.map(acc => (
                 <div key={acc.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <div className="flex items-center space-x-3">
                     <div className={`w-4 h-4 rounded-full ${acc.color} shadow-sm`}></div>
                     <span className="text-sm font-black text-black">{acc.name}</span>
                   </div>
                   <span className="text-sm font-black text-black">{acc.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
