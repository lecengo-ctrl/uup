import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Eye, Heart, Share2, ExternalLink, MessageSquare, Bookmark, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

export function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const { apps, users, currentUser, incrementViews, toggleLike, toggleBookmark, likes, bookmarks, comments, addComment } = useStore();
  const [commentText, setCommentText] = useState('');
  
  const app = apps.find(a => a.id === id);
  const author = app ? users[app.authorId] : null;
  
  const isLiked = currentUser && app ? (likes[currentUser.id] || []).includes(app.id) : false;
  const isBookmarked = currentUser && app ? (bookmarks[currentUser.id] || []).includes(app.id) : false;
  
  const appComments = comments.filter(c => c.appId === id).sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    if (id) {
      incrementViews(id);
    }
  }, [id, incrementViews]);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <AlertCircle className="w-12 h-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">应用不存在或已下架</h2>
        <Link to="/" className="mt-4 text-indigo-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/app/${app.id}`;
    navigator.clipboard.writeText(url);
    alert('链接已复制到剪贴板！');
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    if (commentText.trim()) {
      addComment(app.id, commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <img 
          src={app.coverUrl} 
          alt={app.title} 
          className="w-full md:w-48 aspect-video md:aspect-square object-cover rounded-xl bg-slate-100"
          referrerPolicy="no-referrer"
        />
        
        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{app.title}</h1>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <img src={author?.avatar} alt={author?.nickname} className="w-5 h-5 rounded-full" />
                  <span className="font-medium text-slate-700">{author?.nickname}</span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(app.createdAt, { addSuffix: true, locale: zhCN })}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {app.views}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => currentUser ? toggleLike(app.id) : alert('请先登录')}
                className={cn("p-2 rounded-full border transition-colors", isLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}
                title="点赞"
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              </button>
              <button 
                onClick={() => currentUser ? toggleBookmark(app.id) : alert('请先登录')}
                className={cn("p-2 rounded-full border transition-colors", isBookmarked ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}
                title="收藏"
              >
                <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
              </button>
              <button 
                onClick={handleCopyLink}
                className="p-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                title="分享"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <p className="text-slate-600 leading-relaxed">{app.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {app.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full">
            sandbox-preview
          </div>
          <Link 
            to={`/preview/${app.id}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md transition-colors"
          >
            全屏运行 <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-white relative">
          <iframe
            src={`#/preview/${app.id}`}
            className="w-full h-full border-0 absolute inset-0"
            sandbox="allow-scripts allow-same-origin"
            title={app.title}
          />
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> 评论 ({appComments.length})
        </h3>
        
        <form onSubmit={handleComment} className="mb-8 flex gap-4">
          <img 
            src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'} 
            alt="avatar" 
            className="w-10 h-10 rounded-full bg-slate-100" 
          />
          <div className="flex-1 flex flex-col items-end gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={currentUser ? "说点什么吧..." : "请先登录后再评论"}
              disabled={!currentUser}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none h-24 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={!currentUser || !commentText.trim()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发表评论
            </button>
          </div>
        </form>
        
        <div className="space-y-6">
          {appComments.length === 0 ? (
            <p className="text-center text-slate-500 py-4">暂无评论，快来抢沙发！</p>
          ) : (
            appComments.map(comment => {
              const commentAuthor = users[comment.authorId];
              return (
                <div key={comment.id} className="flex gap-4">
                  <img src={commentAuthor?.avatar} alt={commentAuthor?.nickname} className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-slate-900">{commentAuthor?.nickname}</span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: zhCN })}
                      </span>
                    </div>
                    <p className="text-slate-700">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
