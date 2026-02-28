import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';

export function Preview() {
  const { id } = useParams<{ id: string }>();
  const { apps } = useStore();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    const app = apps.find(a => a.id === id);
    if (app) {
      setHtmlContent(app.htmlContent);
    } else {
      setHtmlContent('<!DOCTYPE html><html><body><h1>404 - App Not Found</h1></body></html>');
    }
  }, [id, apps]);

  if (htmlContent === null) {
    return <div>Loading...</div>;
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
