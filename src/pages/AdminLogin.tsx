import { useState } from 'react';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { adminLogin } from '../lib/api';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(login, password);
      onSuccess();
    } catch {
      setError('Błędny login lub hasło.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Shield className="h-10 w-10 text-neon-green mx-auto mb-4" />
          <h1 className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-400">
            Panel Administracyjny
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-zinc-800 bg-zinc-950/80">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Login
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin"
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wprowadź hasło"
              className="input-dark"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-400 font-mono">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon-solid w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Zaloguj'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
