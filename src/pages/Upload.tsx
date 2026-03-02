import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { Upload as UploadIcon, FileCode, CheckCircle, AlertCircle, Link as LinkIcon, Image as ImageIcon, Code, Tag, Lock, Unlock, Download, DollarSign, Edit } from 'lucide-react';
import { cn } from '../lib/utils';

const PRESET_TAGS = [
  '效率工具', '小游戏', '简历模板', '表白页', 'AI 工具', '毕业设计', '办公助手',
  '开源免费', '付费商用', '个人自用',
  '创意 idea', '行业专业', '高颜值设计', '开箱即用'
];

export function Upload() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, apps, addApp, updateApp } = useStore();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const existingApp = isEditMode ? apps.find(a => a.id === id) : null;

  const [uploadMethod, setUploadMethod] = useState<'file' | 'code'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [htmlCode, setHtmlCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  
  // New fields
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [allowDownload, setAllowDownload] = useState(false);
  const [price, setPrice] = useState<number>(0);

  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (isEditMode && existingApp) {
      if (existingApp.authorId !== currentUser.id) {
        navigate('/'); // Not the author
        return;
      }
      setUploadMethod('code');
      setHtmlCode(existingApp.htmlContent || '');
      setTitle(existingApp.title);
      setDescription(existingApp.description);
      setCoverUrl(existingApp.coverUrl);
      setTags(existingApp.tags || []);
      setVisibility(existingApp.visibility || 'public');
      setAllowDownload(existingApp.allowDownload || false);
      setPrice(existingApp.price || 0);
    }
  }, [currentUser, navigate, isEditMode, existingApp]);

  // Mock auto-tagging based on content
  useEffect(() => {
    if (title || description || htmlCode) {
      const content = (title + ' ' + description + ' ' + htmlCode).toLowerCase();
      const newTags = new Set(tags);
      
      if (content.includes('游戏') || content.includes('game') || content.includes('canvas')) newTags.add('小游戏');
      if (content.includes('简历') || content.includes('resume')) newTags.add('简历模板');
      if (content.includes('ai') || content.includes('智能')) newTags.add('AI 工具');
      if (content.includes('工具') || content.includes('tool')) newTags.add('效率工具');
      if (content.includes('表白') || content.includes('love')) newTags.add('表白页');
      
      // Keep only up to 5 tags total
      const tagArray = Array.from(newTags).slice(0, 5);
      if (tagArray.join(',') !== tags.join(',')) {
        setTags(tagArray);
      }
    }
  }, [title, description, htmlCode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.html')) {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.replace('.html', ''));
        }
        setErrorMsg('');
      } else {
        setFile(null);
        setErrorMsg('仅支持 .html 格式文件');
      }
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      if (tags.length >= 5) {
        setErrorMsg('最多只能添加5个标签');
        return;
      }
      if (!tags.includes(customTag.trim())) {
        setTags([...tags, customTag.trim()]);
      }
      setCustomTag('');
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      if (tags.length >= 5) {
        setErrorMsg('最多只能添加5个标签');
        return;
      }
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (uploadMethod === 'file' && !file) {
      setErrorMsg('请选择要上传的 HTML 文件');
      return;
    }
    if (uploadMethod === 'code' && !htmlCode.trim()) {
      setErrorMsg('请粘贴 HTML 代码');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('请填写应用名称');
      return;
    }

    setStatus('uploading');
    
    // Simulate upload and deployment
    setTimeout(async () => {
      let finalHtmlCode = htmlCode;
      
      if (uploadMethod === 'file' && file) {
        try {
          finalHtmlCode = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
          });
        } catch (e) {
          console.error("Failed to read file", e);
          setStatus('error');
          return;
        }
      }

      let finalAppId = id;
      
      if (isEditMode && id) {
        updateApp(id, {
          title,
          description,
          htmlContent: finalHtmlCode,
          coverUrl: coverUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`,
          tags: tags.length > 0 ? tags : ['未分类'],
          visibility,
          allowDownload,
          price: allowDownload ? price : 0,
        });
      } else {
        finalAppId = addApp({
          title,
          description,
          authorId: currentUser.id,
          htmlContent: finalHtmlCode,
          coverUrl: coverUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`,
          tags: tags.length > 0 ? tags : ['未分类'],
          visibility,
          allowDownload,
          price: allowDownload ? price : 0,
        });
      }

      setStatus('success');
      setTimeout(() => {
        navigate(`/app/${finalAppId}`);
      }, 1500);
    }, 1500);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {isEditMode ? <Edit className="w-6 h-6 text-indigo-600" /> : <UploadIcon className="w-6 h-6 text-indigo-600" />}
            {isEditMode ? '编辑应用' : '发布新应用'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEditMode ? '更新您的应用代码或修改应用信息。' : '上传单页 HTML 文件或直接粘贴代码，一键生成专属在线链接。'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Upload Method Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-900">代码来源</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                  uploadMethod === 'file' 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                    : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-600"
                )}
              >
                <FileCode className="w-8 h-8 mb-2" />
                <span className="font-medium">上传 HTML 文件</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('code')}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                  uploadMethod === 'code' 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                    : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-600"
                )}
              >
                <Code className="w-8 h-8 mb-2" />
                <span className="font-medium">粘贴 HTML 代码</span>
              </button>
            </div>
          </div>

          {/* Source Input */}
          {uploadMethod === 'file' ? (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".html"
                className="hidden"
              />
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCode className="w-8 h-8" />
              </div>
              {file ? (
                <div>
                  <p className="text-lg font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-4 text-sm text-red-600 hover:underline"
                  >
                    重新选择
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-slate-900">点击或拖拽文件到此处</p>
                  <p className="text-sm text-slate-500 mt-2">仅支持单个 .html 文件</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">HTML 代码</label>
              <textarea 
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder="<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>"
                className="w-full h-64 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none font-mono text-sm resize-y"
              />
            </div>
          )}

          {/* App Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">应用名称 *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的应用起个响亮的名字"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">应用简介</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简单介绍一下你的应用功能和特色..."
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 封面图 URL (可选)
              </label>
              <input 
                type="url" 
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="输入图片链接，留空则自动生成随机封面"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
              {coverUrl && (
                <div className="mt-2 aspect-video w-48 rounded-lg overflow-hidden border border-slate-200">
                  <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" onError={() => setErrorMsg('封面图片加载失败，请检查链接')} />
                </div>
              )}
            </div>

            {/* Smart Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> 标签 (最多5个)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)} className="hover:text-indigo-900">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  placeholder="输入自定义标签并回车"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                      tags.includes(tag) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Publishing Permissions */}
            <div className="border-t border-slate-200 pt-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-900">发布设置</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visibility */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-900">可见性</label>
                  <div className="flex gap-4">
                    <label className={cn(
                      "flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors",
                      visibility === 'public' ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
                    )}>
                      <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="hidden" />
                      <Unlock className={cn("w-5 h-5", visibility === 'public' ? "text-indigo-600" : "text-slate-400")} />
                      <div>
                        <p className={cn("text-sm font-medium", visibility === 'public' ? "text-indigo-900" : "text-slate-700")}>公开</p>
                        <p className="text-xs text-slate-500">发布到广场</p>
                      </div>
                    </label>
                    <label className={cn(
                      "flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors",
                      visibility === 'private' ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
                    )}>
                      <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="hidden" />
                      <Lock className={cn("w-5 h-5", visibility === 'private' ? "text-indigo-600" : "text-slate-400")} />
                      <div>
                        <p className={cn("text-sm font-medium", visibility === 'private' ? "text-indigo-900" : "text-slate-700")}>私有</p>
                        <p className="text-xs text-slate-500">仅自己可见</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Download Permission */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-900">源码下载</label>
                  <div className="flex gap-4">
                    <label className={cn(
                      "flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors",
                      allowDownload ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
                    )}>
                      <input type="radio" name="download" checked={allowDownload} onChange={() => setAllowDownload(true)} className="hidden" />
                      <Download className={cn("w-5 h-5", allowDownload ? "text-indigo-600" : "text-slate-400")} />
                      <div>
                        <p className={cn("text-sm font-medium", allowDownload ? "text-indigo-900" : "text-slate-700")}>允许下载</p>
                      </div>
                    </label>
                    <label className={cn(
                      "flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors",
                      !allowDownload ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
                    )}>
                      <input type="radio" name="download" checked={!allowDownload} onChange={() => { setAllowDownload(false); setPrice(0); }} className="hidden" />
                      <Lock className={cn("w-5 h-5", !allowDownload ? "text-indigo-600" : "text-slate-400")} />
                      <div>
                        <p className={cn("text-sm font-medium", !allowDownload ? "text-indigo-900" : "text-slate-700")}>禁止下载</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Price Setting */}
              {allowDownload && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <label className="block text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> 下载价格 (元)
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-32 px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <span className="text-sm text-amber-700">
                      {price === 0 ? '免费下载' : `付费下载 (平台将收取 10% 手续费)`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={status === 'uploading' || status === 'success'}
              className={cn(
                "w-full py-3 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all",
                status === 'success' 
                  ? "bg-green-500 text-white" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              )}
            >
              {status === 'uploading' && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {status === 'success' && <CheckCircle className="w-5 h-5" />}
              {status === 'idle' && <UploadIcon className="w-5 h-5" />}
              
              {status === 'uploading' ? '正在部署...' : 
               status === 'success' ? (isEditMode ? '保存成功！正在跳转...' : '发布成功！正在跳转...') : 
               (isEditMode ? '保存修改' : '一键发布')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
