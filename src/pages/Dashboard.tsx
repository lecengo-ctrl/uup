import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Heart, Edit, Trash2, ExternalLink, Settings, LayoutGrid, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { currentUser, apps, deleteApp, bookmarks } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'apps' | 'bookmarks' | 'settings'>('apps');

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">需要登录</h2>
        <p className="text-slate-500 mb-6">请先登录后查看个人中心</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium hover:underline">
          返回首页
        </button>
      </div>
    );
  }

  const myApps = apps.filter(app => app.authorId === currentUser.id).sort((a, b) => b.createdAt - a.createdAt);
  const myBookmarks = apps.filter(app => (bookmarks[currentUser.id] || []).includes(app.id));

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`确定要删除应用 "${title}" 吗？此操作不可恢复。`)) {
      deleteApp(id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
          <img src={currentUser.avatar} alt="avatar" className="w-20 h-20 rounded-full mx-auto mb-4 bg-slate-100 border-4 border-white shadow-md" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">{currentUser.nickname}</h2>
          <p className="text-sm text-slate-500 mb-4">{currentUser.role === 'admin' ? '平台管理员' : '创作者'}</p>
          
          <div className="flex justify-center gap-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
            <div className="text-center">
              <div className="font-bold text-slate-900">{myApps.length}</div>
              <div className="text-xs">应用</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-900">
                {myApps.reduce((sum, app) => sum + app.views, 0)}
              </div>
              <div className="text-xs">总浏览</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-900">
                {myApps.reduce((sum, app) => sum + app.likes, 0)}
              </div>
              <div className="text-xs">获赞</div>
            </div>
          </div>
        </div>

        <nav className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('apps')}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left", activeTab === 'apps' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50")}
          >
            <LayoutGrid className="w-5 h-5" /> 我的应用
          </button>
          <button 
            onClick={() => setActiveTab('bookmarks')}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left", activeTab === 'bookmarks' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50")}
          >
            <Bookmark className="w-5 h-5" /> 我的收藏
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left", activeTab === 'settings' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50")}
          >
            <Settings className="w-5 h-5" /> 账号设置
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[600px]">
        {activeTab === 'apps' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">我的应用</h2>
              <Link to="/upload" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                发布新应用
              </Link>
            </div>

            {myApps.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="mb-4">你还没有发布过任何应用</p>
                <Link to="/upload" className="text-indigo-600 font-medium hover:underline">
                  去发布第一个应用
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApps.map(app => (
                  <div key={app.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors group">
                    <img src={app.coverUrl} alt={app.title} className="w-full sm:w-32 aspect-video object-cover rounded-lg bg-slate-100" />
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <Link to={`/app/${app.id}`} className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                            {app.title}
                          </Link>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                            app.status === 'online' ? "bg-green-100 text-green-700" : 
                            app.status === 'review' ? "bg-yellow-100 text-yellow-700" : 
                            "bg-red-100 text-red-700"
                          )}>
                            {app.status === 'online' ? '已上线' : app.status === 'review' ? '审核中' : '已下架'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1 mb-2">{app.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{formatDistanceToNow(app.createdAt, { addSuffix: true, locale: zhCN })}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {app.views}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {app.likes}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/app/${app.id}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" /> 查看
                        </Link>
                        <button className="text-sm text-slate-600 hover:text-indigo-600 flex items-center gap-1">
                          <Edit className="w-4 h-4" /> 编辑
                        </button>
                        <button 
                          onClick={() => handleDelete(app.id, app.title)}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 ml-auto sm:ml-0"
                        >
                          <Trash2 className="w-4 h-4" /> 删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">我的收藏</h2>
            {myBookmarks.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="mb-4">你还没有收藏过任何应用</p>
                <Link to="/" className="text-indigo-600 font-medium hover:underline">
                  去广场逛逛
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBookmarks.map(app => (
                  <Link key={app.id} to={`/app/${app.id}`} className="group flex flex-col bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-200 transition-all">
                    <img src={app.coverUrl} alt={app.title} className="w-full aspect-video object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 mb-1">{app.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{app.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">账号设置</h2>
            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">头像</label>
                <div className="flex items-center gap-4">
                  <img src={currentUser.avatar} alt="avatar" className="w-16 h-16 rounded-full bg-slate-100" />
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                    更换头像
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">昵称</label>
                <input 
                  type="text" 
                  defaultValue={currentUser.nickname}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
              
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                保存修改
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
