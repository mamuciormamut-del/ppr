import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bitcoin, Shield, AlertTriangle, Copy, Check, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { createAffiliate } from '../lib/api';

export default function AffiliatePage() {
  const [btcAddress, setBtcAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ referralLink: string; dashboardLink: string } | null>(null);
  const [copied, setCopied] = useState<'ref' | 'dash' | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!btcAddress.trim()) {
      setError('Podaj adres Bitcoin.');
      return;
    }
    if (btcAddress.length < 26 || btcAddress.length > 62) {
      setError('Nieprawidłowy adres Bitcoin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const affiliate = await createAffiliate(btcAddress.trim());
      const base = window.location.origin;
      setResult({
        referralLink: `${base}/?ref=${affiliate.id}`,
        dashboardLink: `${base}/partner/${affiliate.secret_token}`,
      });
    } catch {
      setError('Błąd podczas rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'ref' | 'dash') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Layout>
      <Helmet>
        <title>Program Partnerski - Prywaciarz</title>
        <meta name="description" content="Dołącz do programu partnerskiego Prywaciarz. Zarabiaj Bitcoin za każde polecenie." />
      </Helmet>

      <div className="py-20 px-4">
        <div className="mx-auto max-w-xl">
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan mb-4">
              Program Partnerski
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Zarabiaj <span className="text-neon-green">anonimowo</span>
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Polecaj nasze usługi i zarabiaj Bitcoin. Bez rejestracji, bez maila, bez danych osobowych.
              Tylko adres BTC i Twój unikalny link.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-neon-green/20 p-6 mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-neon-green font-mono text-xl font-bold shrink-0">01</div>
              <div>
                <p className="font-bold text-zinc-100">Dołącz w 30 sekund</p>
                <p className="text-sm text-zinc-400 mt-1">Tylko adres Bitcoin potrzebny. Zero e-maila, zero danych.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-neon-green font-mono text-xl font-bold shrink-0">02</div>
              <div>
                <p className="font-bold text-zinc-100">Udostępnij link</p>
                <p className="text-sm text-zinc-400 mt-1">Twój unikalny link polecający. Każde kliknięcie śledzone w sesji.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-neon-green font-mono text-xl font-bold shrink-0">03</div>
              <div>
                <p className="font-bold text-zinc-100">Zarabiaj 200 PLN za 20 zamówień</p>
                <p className="text-sm text-zinc-400 mt-1">Za każde 20 osób, które dokona zakupu przez Twój link – otrzymasz 200 PLN w BTC lub PSC.</p>
              </div>
            </div>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  Adres Bitcoin (wypłata prowizji)
                </label>
                <div className="relative">
                  <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <input
                    type="text"
                    value={btcAddress}
                    onChange={(e) => setBtcAddress(e.target.value)}
                    placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf..."
                    className="input-dark pl-10 font-mono text-sm"
                    required
                  />
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
                  Na ten adres zostaną wysłane prowizje. Upewnij się, że jest prawidłowy.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-mono">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-neon w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Dołącz do programu'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-sm font-bold text-amber-400 mb-1">
                      Zapisz swój Sekretny Link!
                    </p>
                    <p className="font-mono text-[11px] text-amber-400/80 leading-relaxed">
                      Jeśli go zgubisz, stracisz dostęp do statystyk. Nie przechowujemy Twoich danych.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    Twój link polecający
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-zinc-900 border border-zinc-800 font-mono text-xs text-neon-green break-all">
                      {result.referralLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.referralLink, 'ref')}
                      className="shrink-0 p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                    >
                      {copied === 'ref' ? (
                        <Check className="h-4 w-4 text-neon-green" />
                      ) : (
                        <Copy className="h-4 w-4 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    Sekretny link do panelu statystyk
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-zinc-900 border border-amber-500/30 font-mono text-xs text-amber-400 break-all">
                      {result.dashboardLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.dashboardLink, 'dash')}
                      className="shrink-0 p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                    >
                      {copied === 'dash' ? (
                        <Check className="h-4 w-4 text-neon-green" />
                      ) : (
                        <Copy className="h-4 w-4 text-zinc-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
                    Ten link to Twój prywatny panel. Zachowaj go w bezpiecznym miejscu.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(result.dashboardLink.replace(window.location.origin, ''))}
                className="btn-neon w-full"
              >
                Otwórz Panel Statystyk
              </button>

              <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800">
                <Shield className="h-4 w-4 text-neon-green shrink-0" />
                <p className="font-mono text-[10px] text-zinc-500">
                  Zero danych osobowych. Zero cookies. Tylko Twój sekretny token.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
