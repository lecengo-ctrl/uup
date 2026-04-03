import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { AppDetail } from "./pages/AppDetail";
import { Upload } from "./pages/Upload";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { Preview } from "./pages/Preview";
import { Login } from "./pages/Login";
import { useStore } from "./store";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { _hasHydrated, init } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  if (!_hasHydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="app/:id" element={<AppDetail />} />
          <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="edit/:id" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
