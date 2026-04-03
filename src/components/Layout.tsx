import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Cloud, Upload, User, LogOut, LayoutDashboard, ShieldAlert, Bell } from 'lucide-react';
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function Layout() {
  const { currentUser, login, logout, notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
    setShowLogin(false);
  };

  const myNotifs = notifications;
  const unreadCount = myNotifs.filter(n => !n.is_read).length;

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
                
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="text-slate-600 hover:text-indigo-600 p-2 relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-900">通知中心</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllNotificationsRead} className="text-xs text-indigo-600 hover:underline">
                            全部已读
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {myNotifs.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">暂无通知</div>
                        ) : (
                          myNotifs.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => markNotificationRead(n.id)}
                              className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                            >
                              <p className="text-sm text-slate-800 mb-1">{n.content}</p>
                              <p className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: zhCN })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                      <p className="text-xs text-slate-500 truncate">Lv.{currentUser.level} {currentUser.role === 'admin' ? '管理员' : '创作者'}</p>
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
            <p className="text-slate-500 mb-6">登录后即可发布、收藏应用，并管理您的收益。</p>
            
            <button 
              onClick={() => { navigate('/login'); setShowLogin(false); }}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              去登录 / 注册
            </button>
            
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
