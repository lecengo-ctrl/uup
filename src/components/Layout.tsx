import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Cloud, Upload, User, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';

export function Layout() {
  const { currentUser, login, logout } = useStore();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 4) {
      login(phone, phone === 'admin' ? 'admin' : 'user');
      setShowLogin(false);
      setPhone('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600">
            <Cloud className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight">轻页云</span>
          </Link>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <Link 
                  to="/upload" 
                  className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  发布应用
                </Link>
                
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-indigo-600 p-2">
                    <ShieldAlert className="w-5 h-5" />
                  </Link>
                )}
                
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 p-2">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>

                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">{currentUser.nickname}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.role === 'admin' ? '管理员' : '创作者'}</p>
                    </div>
                    <button 
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4" />
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">欢迎来到轻页云</h2>
            <p className="text-slate-500 mb-6">输入手机号快速登录或注册 (MVP演示: 输入任意4位以上字符，输入admin登录管理员)</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">手机号</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  placeholder="请输入手机号"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                disabled={phone.length < 4}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                获取验证码并登录
              </button>
            </form>
            
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
