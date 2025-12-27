
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (login: string, pass: string) => void;
  onRegister: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!login || !password) return;

    try {
      if (isLogin) {
        onLogin(login, password);
      } else {
        onRegister({ login, passwordHash: password });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError(null); // Очищаем ошибку при переключении
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="flex border-b">
        <button 
          className={`flex-1 py-5 font-bold text-xs uppercase tracking-[0.15em] transition-all ${isLogin ? 'text-blue-600 border-b-4 border-blue-600 bg-white' : 'text-gray-400 bg-gray-50'}`}
          onClick={() => toggleMode(true)}
        >
          Вход
        </button>
        <button 
          className={`flex-1 py-5 font-bold text-xs uppercase tracking-[0.15em] transition-all ${!isLogin ? 'text-blue-600 border-b-4 border-blue-600 bg-white' : 'text-gray-400 bg-gray-50'}`}
          onClick={() => toggleMode(false)}
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200 rotate-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Дневник тренировок</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium italic">Ваш путь к прогрессу под контролем</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-pulse">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            <p className="text-sm text-red-700 font-bold leading-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Логин</label>
            <input 
              type="text" 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-800"
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-800"
              placeholder="********"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transform active:scale-[0.97] transition-all uppercase tracking-widest text-sm mt-4"
        >
          {isLogin ? 'Войти в систему' : 'Создать аккаунт'}
        </button>

        {isLogin && (
          <p className="text-center text-xs text-gray-400 font-medium mt-4">
            Нет аккаунта? <button type="button" onClick={() => toggleMode(false)} className="text-blue-600 font-bold hover:underline">Зарегистрироваться</button>
          </p>
        )}
      </form>
    </div>
  );
};

export default Auth;
