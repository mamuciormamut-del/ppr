import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import BlogPage from './pages/BlogPage';
import BlogPostView from './pages/BlogPostView';
import FAQListPage from './pages/FAQListPage';
import AffiliatePage from './pages/AffiliatePage';
import AffiliateDashboard from './pages/AffiliateDashboard';

function RefCapture({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      sessionStorage.setItem('referrer_id', ref);
    }
  }, [searchParams]);
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <RefCapture>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostView />} />
        <Route path="/faq" element={<FAQListPage />} />
        <Route path="/partner" element={<AffiliatePage />} />
        <Route path="/partner/:secret_token" element={<AffiliateDashboard />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </RefCapture>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
