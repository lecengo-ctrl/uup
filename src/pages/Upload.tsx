import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Upload as UploadIcon, FileCode, CheckCircle2, Loader2, Link as LinkIcon, Code } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ['AI生成', '小游戏', '效率工具', '趣味测试', '个人简历', '其他'];

export function Upload() {
  const { currentUser, addApp } = useStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [fileContent, setFileContent] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    coverUrl: ''
  });
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedId, setDeployedId] = useState<string | null>(null);

  useEffect(() => {
    if (step === 2 && !formData.coverUrl) {
      setFormData(prev => ({
        ...prev,
        coverUrl: `https://picsum.photos/seed/${Date.now()}/400/300`
      }));
    }
  }, [step]);

  // Redirect if not logged in
  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">需要登录</h2>
        <p className="text-slate-500 mb-6">请先登录后再发布应用</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium hover:underline">
          返回首页
        </button>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.html')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
        setStep(2);
      };
      reader.readAsText(file);
    } else {
      alert('仅支持 .html 文件');
    }
  };

  const handlePasteSubmit = () => {
    if (!fileContent.trim()) {
      alert('请输入 HTML 代码');
      return;
    }
    setStep(2);
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag].slice(0, 3) // Max 3 tags
    }));
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.tags.length === 0) {
      alert('请填写应用名称并至少选择一个标签');
      return;
    }

    setIsDeploying(true);
    setStep(3);

    // Mock deployment delay
    setTimeout(() => {
      const id = addApp({
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        coverUrl: formData.coverUrl || `https://picsum.photos/seed/${Date.now()}/400/300`,
        authorId: currentUser.id,
        htmlContent: fileContent
      });
      setDeployedId(id);
      setIsDeploying(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">发布新应用</h1>
        <p className="text-slate-500">将你的本地HTML单页一键部署到云端，与世界分享。</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500", 
          step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"
        )}></div>
        
        {[
          { num: 1, label: '上传文件' },
          { num: 2, label: '填写信息' },
          { num: 3, label: '完成部署' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2",
              step >= s.num ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-400"
            )}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={cn("text-sm font-medium", step >= s.num ? "text-slate-900" : "text-slate-400")}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setUploadMethod('file')}
                className={cn("flex-1 py-3 rounded-xl font-medium transition-colors border", uploadMethod === 'file' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
              >
                上传 HTML 文件
              </button>
              <button
                onClick={() => setUploadMethod('paste')}
                className={cn("flex-1 py-3 rounded-xl font-medium transition-colors border", uploadMethod === 'paste' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}
              >
                粘贴 HTML 代码
              </button>
            </div>

            {uploadMethod === 'file' ? (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:bg-slate-50 hover:border-indigo-400 transition-colors relative cursor-pointer group">
                <input 
                  type="file" 
                  accept=".html" 
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                    <UploadIcon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">点击或拖拽文件到此处上传</h3>
                <p className="text-slate-500 text-sm mb-6">仅支持 .html 单文件 (最大5MB)</p>
                
                <div className="flex justify-center gap-8 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-400" /> 单HTML文件
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  placeholder="在此处粘贴你的 HTML 代码 (例如由 AI 生成的代码)..."
                  className="w-full h-64 p-4 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none bg-slate-50"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePasteSubmit}
                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleDeploy} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                {uploadMethod === 'file' ? <FileCode className="w-6 h-6 text-indigo-600" /> : <Code className="w-6 h-6 text-indigo-600" />}
                <div>
                  <p className="font-medium text-slate-900">{uploadMethod === 'file' ? '已选择文件' : '已输入代码'}</p>
                  <p className="text-xs text-slate-500">准备部署为静态应用</p>
                </div>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-indigo-600 hover:underline">重新上传</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">应用名称 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                maxLength={30}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                placeholder="给你的应用起个响亮的名字"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">应用简介</label>
              <textarea 
                maxLength={200}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none h-24"
                placeholder="简单介绍一下这个应用的功能和特色（选填，限200字）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">分类标签 <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(最多选3个)</span></label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      formData.tags.includes(tag)
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">封面图 URL</label>
              <input 
                type="url" 
                value={formData.coverUrl}
                onChange={e => setFormData({...formData, coverUrl: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                placeholder="输入图片链接，或使用默认随机图片"
              />
              <p className="text-xs text-slate-500 mt-1">由于浏览器安全限制，暂不支持自动网页截图，您可以手动填入图片链接。</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="px-6 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                上一步
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                确认发布
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            {isDeploying ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <h3 className="text-xl font-bold text-slate-900">正在部署到云端...</h3>
                <p className="text-slate-500">正在解析文件并分配静态托管资源，请稍候</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">部署成功！</h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full max-w-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <LinkIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate text-sm font-mono">
                      {window.location.origin}/#/app/{deployedId}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/#/app/${deployedId}`);
                      alert('已复制');
                    }}
                    className="text-indigo-600 text-sm font-medium hover:underline shrink-0 ml-4"
                  >
                    复制
                  </button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setStep(1);
                      setFileContent('');
                      setFormData({title: '', description: '', tags: [], coverUrl: ''});
                    }}
                    className="px-6 py-2 rounded-xl font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    继续发布
                  </button>
                  <button 
                    onClick={() => navigate(`/app/${deployedId}`)}
                    className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    去查看
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
