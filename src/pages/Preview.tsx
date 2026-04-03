import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store";

export function Preview() {
  const { id } = useParams<{ id: string }>();
  const { currentApp, fetchAppDetail } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchAppDetail(id).finally(() => setLoading(false));
    }
  }, [id, fetchAppDetail]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!currentApp) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">404 - App Not Found</h1>
          <p>应用不存在或已下架</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={currentApp.html_content}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin"
      title="Preview"
    />
  );
}
