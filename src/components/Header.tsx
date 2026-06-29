import { Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById('uslugi')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#uslugi');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 gap-6">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Shield className="h-6 w-6 text-neon-green transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
          <span className="font-mono text-lg font-bold tracking-tight text-zinc-100">
            prywaciarz<span className="text-neon-green">.com</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-xs tracking-widest uppercase">
          <a
            href="/#uslugi"
            onClick={handleServicesClick}
            className="text-zinc-400 hover:text-neon-green transition-colors duration-200 cursor-pointer"
          >
            Usługi
          </a>
          <Link
            to="/blog"
            className="text-zinc-400 hover:text-neon-green transition-colors duration-200"
          >
            Blog
          </Link>
          <Link
            to="/faq"
            className="text-zinc-400 hover:text-neon-green transition-colors duration-200"
          >
            FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
}
