import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ShieldAlert, Users, LayoutGrid, Activity, Search, Ban, CheckCircle, XCircle, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

export function Admin() {
  const { currentUser, apps, updateApp } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'users'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [appToOffline, setAppToOffline] = useState<{id: string, title: string} | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">无权限访问</h2>
        <p className="text-slate-500 mb-6">此页面仅限平台管理员访问</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium hover:underline">
          返回首页
        </button>
      </div>
    );
  }

  const handleStatusChange = (id: string, status: 'online' | 'offline' | 'review') => {
    updateApp(id, { status });
  };

  const filteredApps = apps.filter(app => 
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.id.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toastMessage}
        </div>
      )}
      
      {appToOffline && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">确认下架</h3>
            <p className="text-slate-600 mb-6">确定要下架应用 "{appToOffline.title}" 吗？下架后用户将无法访问。</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setAppToOffline(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  handleStatusChange(appToOffline.id, 'offline');
                  showToast('应用已下架');
                  setAppToOffline(null);
                }}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                确认下架
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-indigo-600" />
          管理后台
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'overview' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          数据概览
        </button>
        <button 
          onClick={() => setActiveTab('apps')}
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'apps' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          内容审核
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'users' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          用户管理
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">总注册用户</p>
              <h3 className="text-3xl font-bold text-slate-900">-</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">总应用数</p>
              <h3 className="text-3xl font-bold text-slate-900">{apps.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">总访问量 (PV)</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {apps.reduce((sum, app) => sum + app.views, 0)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索应用名称或ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">应用信息</th>
                  <th className="px-6 py-4 font-medium">创作者</th>
                  <th className="px-6 py-4 font-medium">数据</th>
                  <th className="px-6 py-4 font-medium">状态</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map(app => {
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={app.cover_url} alt="" className="w-12 h-12 rounded bg-slate-100 object-cover" />
                          <div>
                            <Link to={`/app/${app.id}`} className="font-medium text-slate-900 hover:text-indigo-600">{app.title}</Link>
                            <p className="text-xs text-slate-500 mt-0.5">ID: {app.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img src={app.profiles?.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span className="text-slate-700">{app.profiles?.nickname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div>PV: {app.views}</div>
                        <div>认可: {(app.recognitions?.creative || 0) + (app.recognitions?.professional || 0) + (app.recognitions?.beautiful || 0)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium",
                          app.status === 'online' ? "bg-green-100 text-green-700" : 
                          app.status === 'review' ? "bg-yellow-100 text-yellow-700" : 
                          "bg-red-100 text-red-700"
                        )}>
                          {app.status === 'online' ? '已上线' : app.status === 'review' ? '审核中' : '已下架'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            to={`/preview/${app.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="预览"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {app.status !== 'online' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'online')}
                              className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="通过审核/重新上线"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {app.status !== 'offline' && (
                            <button 
                              onClick={() => setAppToOffline({ id: app.id, title: app.title })}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="违规下架"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 text-center text-slate-500">
          <Ban className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">用户管理功能开发中</h3>
          <p>MVP版本暂不提供完整的用户封禁与管理界面。</p>
        </div>
      )}
    </div>
  );
}
