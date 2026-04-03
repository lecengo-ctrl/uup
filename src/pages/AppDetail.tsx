import { useParams, Link } from "react-router-dom";
import { useStore } from "../store";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Eye,
  Share2,
  ExternalLink,
  MessageSquare,
  Bookmark,
  AlertCircle,
  Download,
  ShoppingCart,
  Award,
  Zap,
  Briefcase,
  Palette,
  Trash2,
  Pin,
  Reply,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    currentApp: app,
    currentUser,
    fetchAppDetail,
    toggleBookmark,
    bookmarks,
    comments,
    addComment,
    toggleRecognition,
    purchaseApp,
  } = useStore();

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    nickname: string;
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "purchase" | "deleteComment";
    payload?: any;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const author = app?.profiles;

  const isBookmarked =
    currentUser && app
      ? bookmarks.includes(app.id)
      : false;
  
  // Recognition logic needs to be updated to check if user has recognized
  const myRecs: string[] = []; // This would need a separate API call or be part of app detail

  const appComments = comments
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  useEffect(() => {
    if (id) {
      fetchAppDetail(id);
    }
  }, [id, fetchAppDetail]);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <AlertCircle className="w-12 h-12 mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">应用不存在或已下架</h2>
        <Link to="/" className="mt-4 text-indigo-600 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/app/${app.id}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          showToast("链接已复制到剪贴板！");
        })
        .catch((err) => {
          console.error("复制失败:", err);
          fallbackCopyTextToClipboard(url);
        });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        showToast("链接已复制到剪贴板！");
      } else {
        showToast("复制失败，请手动复制链接: " + text);
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      showToast("复制失败，请手动复制链接: " + text);
    }

    document.body.removeChild(textArea);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("请先登录");
      return;
    }
    if (commentText.trim()) {
      addComment(app.id, commentText.trim(), replyTo?.id);
      setCommentText("");
      setReplyTo(null);
    }
  };

  const handleDownload = () => {
    if (!currentUser) {
      showToast("请先登录");
      return;
    }

    const triggerDownload = () => {
      const blob = new Blob([app.html_content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${app.title || "app"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if (app.price > 0) {
      setConfirmAction({ type: "purchase" });
    } else {
      // downloadApp(app.id); // No direct downloadApp in store anymore, handled by detail increment or separate log
      triggerDownload();
      showToast("已开始下载。");
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "purchase") {
      try {
        await purchaseApp(app.id);
        const blob = new Blob([app.html_content], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${app.title || "app"}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("购买成功！已开始下载。");
      } catch (err: any) {
        showToast(err.message || "购买失败");
      }
    } else if (
      confirmAction.type === "deleteComment" &&
      confirmAction.payload
    ) {
      // deleteComment(confirmAction.payload); // Need to implement deleteComment in store if needed
      showToast("评论已删除");
    }

    setConfirmAction(null);
  };

  const isAuthor = currentUser?.id === app.user_id;

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toastMessage}
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {confirmAction.type === "purchase" ? "确认购买" : "确认删除"}
            </h3>
            <p className="text-slate-600 mb-6">
              {confirmAction.type === "purchase"
                ? `该应用需要付费 ￥${app.price}，确认购买吗？`
                : "确定删除这条评论？此操作不可恢复。"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeConfirmAction}
                className={cn(
                  "px-4 py-2 text-white rounded-lg transition-colors",
                  confirmAction.type === "purchase"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-red-500 hover:bg-red-600",
                )}
              >
                {confirmAction.type === "purchase" ? "确认购买" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <img
            src={app.cover_url}
            alt={app.title}
            className="w-full aspect-video md:aspect-square object-cover rounded-xl bg-slate-100 border border-slate-200"
            referrerPolicy="no-referrer"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                currentUser ? toggleBookmark(app.id) : showToast("请先登录")
              }
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors border",
                isBookmarked
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              <Bookmark
                className={cn("w-4 h-4", isBookmarked && "fill-current")}
              />
              {isBookmarked ? "已收藏" : "收藏"}
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>

            {app.allow_download && (
              <button
                onClick={handleDownload}
                className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                {app.price > 0 ? (
                  <>
                    <ShoppingCart className="w-5 h-5" /> 付费下载 (￥{app.price}
                    )
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> 免费下载源码
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              {app.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <img
                  src={author?.avatar}
                  alt={author?.nickname}
                  className="w-6 h-6 rounded-full bg-slate-100"
                />
                <span className="font-medium text-slate-700">
                  {author?.nickname}
                </span>
              </div>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(app.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5" title="浏览量">
                <Eye className="w-4 h-4" /> {app.views}
              </span>
              {app.allow_download && (
                <>
                  <span>•</span>
                  <span
                    className="flex items-center gap-1.5"
                    title={app.price > 0 ? "购买量" : "下载量"}
                  >
                    {app.price > 0 ? (
                      <ShoppingCart className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {app.price > 0 ? app.purchases : app.downloads}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {app.description || "作者很懒，没有留下简介。"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Recognition System */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" /> 认可这部作品
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  currentUser
                    ? toggleRecognition(app.id, "creative")
                    : showToast("请先登录")
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                  myRecs.includes("creative")
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <Zap
                  className={cn(
                    "w-4 h-4",
                    myRecs.includes("creative") && "fill-current",
                  )}
                />
                <span className="font-medium">创意拉满</span>
                <span className="bg-white/50 px-1.5 rounded text-xs">
                  {app.recognitions?.creative || 0}
                </span>
              </button>

              <button
                onClick={() =>
                  currentUser
                    ? toggleRecognition(app.id, "professional")
                    : showToast("请先登录")
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                  myRecs.includes("professional")
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <Briefcase
                  className={cn(
                    "w-4 h-4",
                    myRecs.includes("professional") && "fill-current",
                  )}
                />
                <span className="font-medium">专业实用</span>
                <span className="bg-white/50 px-1.5 rounded text-xs">
                  {app.recognitions?.professional || 0}
                </span>
              </button>

              <button
                onClick={() =>
                  currentUser
                    ? toggleRecognition(app.id, "beautiful")
                    : showToast("请先登录")
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                  myRecs.includes("beautiful")
                    ? "bg-pink-50 border-pink-200 text-pink-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <Palette
                  className={cn(
                    "w-4 h-4",
                    myRecs.includes("beautiful") && "fill-current",
                  )}
                />
                <span className="font-medium">颜值超高</span>
                <span className="bg-white/50 px-1.5 rounded text-xs">
                  {app.recognitions?.beautiful || 0}
                </span>
              </button>
            </div>
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
            src={
              currentUser?.avatar ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"
            }
            alt="avatar"
            className="w-10 h-10 rounded-full bg-slate-100"
          />
          <div className="flex-1 flex flex-col items-end gap-2">
            {replyTo && (
              <div className="w-full flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-600">
                <span>
                  回复 <strong>@{replyTo.nickname}</strong> :
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  取消
                </button>
              </div>
            )}
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
            <p className="text-center text-slate-500 py-4">
              暂无评论，快来抢沙发！
            </p>
          ) : (
            appComments.map((comment) => {
              const commentAuthor = comment.profiles;
              const replyToUser = comment.reply_to_id
                ? comments.find((c) => c.id === comment.reply_to_id)?.profiles
                : null;

              return (
                <div
                  key={comment.id}
                  className={cn(
                    "flex gap-4 p-4 rounded-xl transition-colors",
                    comment.is_pinned
                      ? "bg-amber-50/50 border border-amber-100"
                      : "hover:bg-slate-50",
                  )}
                >
                  <img
                    src={commentAuthor?.avatar}
                    alt={commentAuthor?.nickname}
                    className="w-10 h-10 rounded-full bg-slate-100"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-slate-900">
                          {commentAuthor?.nickname}
                        </span>
                        {comment.user_id === app.user_id && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            作者
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                        {comment.is_pinned && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium ml-2">
                            <Pin className="w-3 h-3" /> 已置顶
                          </span>
                        )}
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            setReplyTo({
                              id: comment.id,
                              nickname: commentAuthor?.nickname || "",
                            })
                          }
                          className="text-slate-400 hover:text-indigo-600 p-1"
                          title="回复"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        {isAuthor && (
                          <button
                            onClick={() =>
                              {} // pinComment(comment.id, !comment.is_pinned)
                            }
                            className={cn(
                              "p-1",
                              comment.is_pinned
                                ? "text-amber-500"
                                : "text-slate-400 hover:text-amber-500",
                            )}
                            title={comment.is_pinned ? "取消置顶" : "置顶"}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                        )}
                        {(isAuthor ||
                          currentUser?.id === comment.user_id ||
                          currentUser?.role === "admin") && (
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: "deleteComment",
                                payload: comment.id,
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-700 mt-1">
                      {replyToUser && (
                        <span className="text-indigo-600 mr-2">
                          @{replyToUser.nickname}
                        </span>
                      )}
                      {comment.content}
                    </p>
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
