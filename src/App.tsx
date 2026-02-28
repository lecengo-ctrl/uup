import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AppDetail } from './pages/AppDetail';
import { Upload } from './pages/Upload';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Preview } from './pages/Preview';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="app/:id" element={<AppDetail />} />
          <Route path="upload" element={<Upload />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
