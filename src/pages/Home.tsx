import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Search, Filter, Download, ShoppingCart, Award } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ['全部', '效率工具', '小游戏', '简历模板', '表白页', 'AI 工具', '毕业设计', '办公助手'];

export function Home() {
  const { apps, users } = useStore();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<'heat' | 'latest' | 'recognition' | 'revenue'>('heat');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    return apps
      .filter(app => app.status === 'online' && app.visibility === 'public')
      .filter(app => activeCategory === '全部' || app.tags.includes(activeCategory))
      .filter(app => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const author = users[app.authorId];
        return (
          app.title.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.tags.some(t => t.toLowerCase().includes(query)) ||
          (author && author.nickname.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return b.createdAt - a.createdAt;
        if (sortBy === 'recognition') {
          const recA = (a.recognitions?.creative || 0) + (a.recognitions?.professional || 0) + (a.recognitions?.beautiful || 0);
          const recB = (b.recognitions?.creative || 0) + (b.recognitions?.professional || 0) + (b.recognitions?.beautiful || 0);
          return recB - recA;
        }
        if (sortBy === 'revenue') {
          return (b.purchases * b.price) - (a.purchases * a.price);
        }
        // heat
        const heatA = a.views + ((a.recognitions?.creative || 0) + (a.recognitions?.professional || 0) + (a.recognitions?.beautiful || 0)) * 2 + a.downloads * 3 + a.purchases * 5;
        const heatB = b.views + ((b.recognitions?.creative || 0) + (b.recognitions?.professional || 0) + (b.recognitions?.beautiful || 0)) * 2 + b.downloads * 3 + b.purchases * 5;
        return heatB - heatA;
      });
  }, [apps, activeCategory, sortBy, searchQuery, users]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 bg-gradient-to-b from-indigo-50 to-white rounded-3xl border border-indigo-100/50 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/pattern/1920/1080')] opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
            发现有趣的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">单页应用</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            零门槛部署你的HTML作品，与社区分享创意。无需服务器，一键生成专属链接。
          </p>
          
          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索应用名称、作者、标签或简介..."
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-lg shadow-lg shadow-indigo-500/5 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Sort */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-16 bg-slate-50/80 backdrop-blur-md py-4 z-40">
        <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto gap-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === cat 
                  ? "bg-slate-900 text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto scrollbar-hide">
          {[
            { id: 'heat', label: '综合热度' },
            { id: 'latest', label: '最新发布' },
            { id: 'recognition', label: '最多认可' },
            { id: 'revenue', label: '最高收益' }
          ].map(sort => (
            <button 
              key={sort.id}
              onClick={() => setSortBy(sort.id as any)}
              className={cn(
                "text-sm font-medium px-3 py-1.5 rounded-md transition-colors whitespace-nowrap", 
                sortBy === sort.id ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </section>

      {/* App Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredApps.map(app => {
          const author = users[app.authorId];
          const totalRec = (app.recognitions?.creative || 0) + (app.recognitions?.professional || 0) + (app.recognitions?.beautiful || 0);
          
          return (
            <Link key={app.id} to={`/app/${app.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                <img 
                  src={app.coverUrl} 
                  alt={app.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {app.price > 0 && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                    ￥{app.price}
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {app.title}
                  </h3>
                </div>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {app.description || '暂无简介'}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src={author?.avatar} alt={author?.nickname} className="w-6 h-6 rounded-full bg-slate-200" />
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[80px]">
                      {author?.nickname || '匿名用户'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1" title="浏览量">
                      <Eye className="w-3.5 h-3.5" /> {app.views}
                    </span>
                    <span className="flex items-center gap-1" title="认可数">
                      <Award className="w-3.5 h-3.5" /> {totalRec}
                    </span>
                    {app.allowDownload && (
                      <span className="flex items-center gap-1" title={app.price > 0 ? "购买量" : "下载量"}>
                        {app.price > 0 ? <ShoppingCart className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        {app.price > 0 ? app.purchases : app.downloads}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
      
      {filteredApps.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p>没有找到匹配的应用，换个关键词试试吧！</p>
        </div>
      )}
    </div>
  );
}
