import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store";

export function Preview() {
  const { id } = useParams<{ id: string }>();
  const { apps } = useStore();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    const app = apps.find((a) => a.id === id);
    if (app) {
      setHtmlContent(app.htmlContent);
    } else {
      setHtmlContent(
        "<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#f8fafc;color:#64748b;font-family:sans-serif;}</style></head><body><h1>404 - App Not Found</h1></body></html>",
      );
    }
  }, [id, apps]);

  if (htmlContent === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // Inject the raw HTML content directly into the document
  // This is a simplified mock for MVP. In a real app, this would be served from a static URL (OSS).
  return (
    <iframe
      srcDoc={htmlContent}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin"
      title="Preview"
    />
  );
}
