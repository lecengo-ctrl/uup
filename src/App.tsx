import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { AppDetail } from "./pages/AppDetail";
import { Upload } from "./pages/Upload";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { Preview } from "./pages/Preview";
import { useStore } from "./store";

export default function App() {
  const { _hasHydrated } = useStore();

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
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="app/:id" element={<AppDetail />} />
          <Route path="upload" element={<Upload />} />
          <Route path="edit/:id" element={<Upload />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
