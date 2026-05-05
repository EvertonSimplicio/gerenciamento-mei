
import React, { useState } from 'react';
import { User } from '../types';
import { signInWithGoogle } from '../lib/firebase';
import { firebaseService } from '../lib/firebaseService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const fbUser = await signInWithGoogle();
      if (!fbUser) throw new Error("Falha ao obter usuário do Firebase");
      // App.tsx handles profile loading
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError('O pop-up de login foi bloqueado pelo seu navegador. Por favor, permita pop-ups ou abra o app em uma nova aba.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Este domínio não está autorizado no console do Firebase. Verifique as configurações de domínios autorizados.');
      } else {
        setError(err.message || 'Ocorreu um erro ao entrar com o Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Decorações de fundo para profundidade */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl shadow-blue-500/40 mb-6">
            <i className="fas fa-store text-white text-3xl absolute -top-1 -right-1 bg-emerald-500 p-2 rounded-lg shadow-lg"></i>
            <i className="fas fa-user-tie text-white text-5xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Gerenciamento <span className="text-blue-500">Mei</span></h1>
          <p className="text-slate-300 mt-2 font-bold uppercase tracking-widest text-xs">Portal do Empreendedor</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-b-8 border-blue-600">
          <h2 className="text-3xl font-black text-black mb-8 text-center uppercase tracking-tighter">
            Entrar no Painel
          </h2>

          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-5 bg-white border-2 border-slate-200 hover:bg-slate-50 text-black rounded-2xl font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-3"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              {loading ? 'CARREGANDO...' : 'ENTRAR COM GOOGLE'}
            </button>

            {error && (
              <p className="text-rose-600 text-[10px] font-black uppercase text-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                {error}
              </p>
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
          </div>
          
          <p className="mt-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Acesso Seguro via Google
          </p>
        </div>

        <p className="text-center text-slate-400 text-sm mt-10 font-bold">
          &copy; 2024 Gerenciamento Mei Digital. <br/>
          <span className="text-blue-500/60 uppercase text-[10px] tracking-widest font-black">Organização & Crescimento</span>
        </p>
      </div>
    </div>
  );
};


export default Login;
