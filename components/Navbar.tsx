
import React from 'react';

interface NavbarProps {
  activeView: string;
  setView: (view: any) => void;
  onLogout: () => void;
  userName: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setView, onLogout, userName }) => {
  return (
    <nav className="bg-white border-b-2 border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <i className="fas fa-briefcase text-2xl"></i>
            </div>
            <span className="text-2xl font-black text-black tracking-tighter">Gerenciamento <span className="text-blue-600">Mei</span></span>
          </div>

          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => setView('dashboard')}
              className={`font-black text-sm uppercase tracking-widest transition-all ${activeView === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-black hover:text-blue-600'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setView('transactions')}
              className={`font-black text-sm uppercase tracking-widest transition-all ${activeView === 'transactions' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-black hover:text-blue-600'}`}
            >
              Lançamentos
            </button>
            <button 
              onClick={() => setView('reports')}
              className={`font-black text-sm uppercase tracking-widest transition-all ${activeView === 'reports' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-black hover:text-blue-600'}`}
            >
              Relatórios
            </button>
            <button 
              onClick={() => setView('accounts')}
              className={`font-black text-sm uppercase tracking-widest transition-all ${activeView === 'accounts' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-black hover:text-blue-600'}`}
            >
              Contas
            </button>
            <button 
              onClick={() => setView('settings')}
              className={`font-black text-sm uppercase tracking-widest transition-all ${activeView === 'settings' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-black hover:text-blue-600'}`}
            >
              Configurações
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={onLogout}
              className="text-black hover:text-red-700 transition-all hover:scale-110"
              title="Sair do sistema"
            >
              <i className="fas fa-sign-out-alt text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
