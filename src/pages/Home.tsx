import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Heart, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ['全部', 'AI生成', '小游戏', '效率工具', '趣味测试'];

export function Home() {
  const { apps, users } = useStore();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<'latest' | 'hottest'>('latest');

  const filteredApps = apps
    .filter(app => app.status === 'online')
    .filter(app => activeCategory === '全部' || app.tags.includes(activeCategory))
    .sort((a, b) => {
      if (sortBy === 'latest') return b.createdAt - a.createdAt;
      return (b.views + b.likes * 2) - (a.views + a.likes * 2);
    });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 bg-gradient-to-b from-indigo-50 to-white rounded-3xl border border-indigo-100/50 shadow-sm">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          发现有趣的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">单页应用</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          零门槛部署你的HTML作品，与社区分享创意。无需服务器，一键生成专属链接。
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/upload" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            立即发布
          </Link>
          <button className="bg-white text-slate-700 px-8 py-3 rounded-full font-medium border border-slate-200 hover:border-slate-300 transition-all">
            随便逛逛
          </button>
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
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button 
            onClick={() => setSortBy('latest')}
            className={cn("text-sm font-medium px-3 py-1.5 rounded-md transition-colors", sortBy === 'latest' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-100")}
          >
            最新发布
          </button>
          <button 
            onClick={() => setSortBy('hottest')}
            className={cn("text-sm font-medium px-3 py-1.5 rounded-md transition-colors", sortBy === 'hottest' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-100")}
          >
            最多热门
          </button>
        </div>
      </section>

      {/* App Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredApps.map(app => {
          const author = users[app.authorId];
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
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {app.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> {app.likes}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
      
      {filteredApps.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p>暂无相关应用，快来发布第一个吧！</p>
        </div>
      )}
    </div>
  );
}
