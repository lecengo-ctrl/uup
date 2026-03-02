import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Heart, Edit, Trash2, ExternalLink, Settings, LayoutGrid, Bookmark, DollarSign, ArrowUpRight, Clock, CheckCircle, XCircle, Download, ShoppingCart, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { currentUser, apps, deleteApp, toggleBookmark, transactions, withdraw, bookmarks } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'apps' | 'bookmarks' | 'revenue' | 'settings'>('apps');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [appToDelete, setAppToDelete] = useState<{id: string, title: string} | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
  const myTransactions = transactions.filter(t => t.userId === currentUser.id).sort((a, b) => b.createdAt - a.createdAt);

  const handleDelete = (id: string, title: string) => {
    setAppToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (appToDelete) {
      deleteApp(appToDelete.id);
      showToast('应用已删除');
      setAppToDelete(null);
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount >= 50 && withdrawAmount <= currentUser.withdrawable) {
      withdraw(withdrawAmount);
      setWithdrawAmount(0);
      showToast('提现申请已提交，请等待审核');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto relative">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toastMessage}
        </div>
      )}
      
      {appToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">确认删除</h3>
            <p className="text-slate-600 mb-6">确定要删除应用 "{appToDelete.title}" 吗？此操作不可恢复。</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setAppToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
          <img src={currentUser.avatar} alt="avatar" className="w-20 h-20 rounded-full mx-auto mb-4 bg-slate-100 border-4 border-white shadow-md" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">{currentUser.nickname}</h2>
          <p className="text-sm text-slate-500 mb-4">Lv.{currentUser.level} {currentUser.role === 'admin' ? '平台管理员' : '创作者'}</p>
          
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
                {myApps.reduce((sum, app) => sum + (app.recognitions?.creative || 0) + (app.recognitions?.professional || 0) + (app.recognitions?.beautiful || 0), 0)}
              </div>
              <div className="text-xs">总认可</div>
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
            onClick={() => setActiveTab('revenue')}
            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left", activeTab === 'revenue' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50")}
          >
            <DollarSign className="w-5 h-5" /> 收益中心
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
                {myApps.map(app => {
                  const totalRec = (app.recognitions?.creative || 0) + (app.recognitions?.professional || 0) + (app.recognitions?.beautiful || 0);
                  return (
                    <div key={app.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors group">
                      <img src={app.coverUrl} alt={app.title} className="w-full sm:w-32 aspect-video object-cover rounded-lg bg-slate-100" />
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <Link to={`/app/${app.id}`} className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                              {app.title}
                            </Link>
                            <div className="flex gap-2 shrink-0">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                app.status === 'online' ? "bg-green-100 text-green-700" : 
                                app.status === 'review' ? "bg-yellow-100 text-yellow-700" : 
                                "bg-red-100 text-red-700"
                              )}>
                                {app.status === 'online' ? '已上线' : app.status === 'review' ? '审核中' : '已下架'}
                              </span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                {app.visibility === 'public' ? '公开' : '私有'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-1 mb-2">{app.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{formatDistanceToNow(app.createdAt, { addSuffix: true, locale: zhCN })}</span>
                            <span className="flex items-center gap-1" title="浏览"><Eye className="w-3.5 h-3.5" /> {app.views}</span>
                            <span className="flex items-center gap-1" title="认可"><Award className="w-3.5 h-3.5" /> {totalRec}</span>
                            {app.allowDownload && (
                              <span className="flex items-center gap-1" title={app.price > 0 ? "购买" : "下载"}>
                                {app.price > 0 ? <ShoppingCart className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />} 
                                {app.price > 0 ? app.purchases : app.downloads}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/app/${app.id}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" /> 查看
                          </Link>
                          <Link to={`/edit/${app.id}`} className="text-sm text-slate-600 hover:text-indigo-600 flex items-center gap-1">
                            <Edit className="w-4 h-4" /> 编辑
                          </Link>
                          <button 
                            onClick={() => handleDelete(app.id, app.title)}
                            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 ml-auto sm:ml-0"
                          >
                            <Trash2 className="w-4 h-4" /> 删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <div key={app.id} className="group flex flex-col bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-200 transition-all relative">
                    <img src={app.coverUrl} alt={app.title} className="w-full aspect-video object-cover" />
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 mb-1">{app.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{app.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                        <Link to={`/app/${app.id}`} className="text-sm text-indigo-600 font-medium hover:underline">
                          查看详情
                        </Link>
                        <button 
                          onClick={() => toggleBookmark(app.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          取消收藏
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">收益中心</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-indigo-100 text-sm font-medium mb-1">累计收益 (元)</p>
                <h3 className="text-3xl font-bold">￥{currentUser.balance.toFixed(2)}</h3>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm font-medium mb-1">可提现余额 (元)</p>
                <h3 className="text-3xl font-bold text-slate-900">￥{currentUser.withdrawable.toFixed(2)}</h3>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm font-medium mb-1">待结算 (元)</p>
                <h3 className="text-3xl font-bold text-slate-900">￥{(currentUser.balance - currentUser.withdrawable).toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">申请提现</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">￥</span>
                  <input 
                    type="number" 
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    placeholder="输入提现金额"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <button 
                  onClick={handleWithdraw}
                  disabled={withdrawAmount < 50 || withdrawAmount > currentUser.withdrawable}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  提现到微信
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                满 50 元可提现，预计 1-3 个工作日到账。
              </p>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-4">交易明细</h3>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {myTransactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">暂无交易记录</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myTransactions.map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          t.type === 'income' ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{t.description}</p>
                          <p className="text-xs text-slate-500">{formatDistanceToNow(t.createdAt, { addSuffix: true, locale: zhCN })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          t.type === 'income' ? "text-green-600" : "text-slate-900"
                        )}>
                          {t.type === 'income' ? '+' : '-'}￥{t.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-1">
                          {t.status === 'completed' && <><CheckCircle className="w-3 h-3 text-green-500" /> 已完成</>}
                          {t.status === 'pending' && <><Clock className="w-3 h-3 text-amber-500" /> 处理中</>}
                          {t.status === 'failed' && <><XCircle className="w-3 h-3 text-red-500" /> 失败</>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
