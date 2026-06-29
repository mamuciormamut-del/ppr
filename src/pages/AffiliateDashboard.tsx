import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Copy, Check, Loader2, AlertTriangle, Users, TrendingUp, Bitcoin, CreditCard, Shield,
} from 'lucide-react';
import Layout from '../components/Layout';
import { fetchAffiliateByToken, fetchAffiliateStats } from '../lib/api';
import type { AffiliateStats } from '../lib/api';

export default function AffiliateDashboard() {
  const { secret_token } = useParams<{ secret_token: string }>();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'btc' | 'psc'>('btc');

  useEffect(() => {
    if (!secret_token) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const affiliate = await fetchAffiliateByToken(secret_token);
        if (!affiliate) {
          setNotFound(true);
          return;
        }
        const data = await fetchAffiliateStats(affiliate.id);
        setStats(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [secret_token]);

  const referralLink = stats
    ? `${window.location.origin}/?ref=${stats.affiliate.id}`
    : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextPayout = stats ? 20 - (stats.completedReferrals % 20) : 20;
  const currentCycle = stats ? stats.completedReferrals % 20 : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 text-neon-green animate-spin" />
        </div>
      </Layout>
    );
  }

  if (notFound || !stats) {
    return (
      <Layout>
        <div className="py-40 px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-zinc-300 mb-3">Panel nie znaleziony</h1>
          <p className="text-zinc-500 font-mono text-sm">
            Nieprawidłowy lub wygasły token. Sprawdź swój sekretny link.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Panel Partnera - Prywaciarz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2">
                Panel Partnera
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Twoje <span className="text-neon-green">statystyki</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-900 border border-amber-500/30">
              <Shield className="h-3 w-3 text-amber-400" />
              <span className="font-mono text-[10px] text-amber-400/70">Prywatny panel</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-neon-cyan" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Wszystkich poleceń
                </span>
              </div>
              <p className="font-mono text-3xl font-bold text-zinc-100">{stats.totalReferrals}</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-neon-green" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Zrealizowanych
                </span>
              </div>
              <p className="font-mono text-3xl font-bold text-neon-green">{stats.completedReferrals}</p>
            </div>

            <div className="bg-zinc-900/50 border border-neon-green/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bitcoin className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Zarobione
                </span>
              </div>
              <p className="font-mono text-3xl font-bold text-amber-400">{stats.totalEarned} PLN</p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-neon-green/20 p-6 mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-1">
                  Postęp do następnej wypłaty
                </p>
                <p className="text-sm text-zinc-300">
                  Brakuje <span className="text-neon-green font-bold">{nextPayout}</span> zakupów do
                  wypłaty <span className="text-amber-400 font-bold">200 PLN</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-2xl font-bold text-zinc-100">{currentCycle}/20</p>
              </div>
            </div>
            <div className="w-full bg-zinc-800 h-2">
              <div
                className="h-2 bg-neon-green transition-all duration-500"
                style={{ width: `${(currentCycle / 20) * 100}%` }}
              />
            </div>
            <p className="mt-3 font-mono text-[10px] text-zinc-500 leading-relaxed">
              Za każde 20 osób, które dokona zakupu przez Twój link, otrzymasz 200 PLN. Wypłata
              odbywa się ręcznie po kontakcie przez Telegram lub e-mail.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-6 mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-4">
              Metoda wypłaty
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setPayoutMethod('btc')}
                className={`flex items-center justify-center gap-2 py-3 px-4 border font-mono text-xs uppercase tracking-wider transition-all ${
                  payoutMethod === 'btc'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <Bitcoin className="h-4 w-4" />
                Bitcoin
              </button>
              <button
                onClick={() => setPayoutMethod('psc')}
                className={`flex items-center justify-center gap-2 py-3 px-4 border font-mono text-xs uppercase tracking-wider transition-all ${
                  payoutMethod === 'psc'
                    ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Paysafecard
              </button>
            </div>
            {payoutMethod === 'btc' ? (
              <div className="p-3 bg-zinc-800/50 border border-zinc-700">
                <p className="font-mono text-[10px] text-zinc-400 mb-1">Twój adres BTC:</p>
                <p className="font-mono text-xs text-amber-400 break-all">{stats.affiliate.btc_payout_address}</p>
              </div>
            ) : (
              <div className="p-3 bg-zinc-800/50 border border-zinc-700">
                <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                  Kody Paysafecard zostaną dostarczone na Twój e-mail po osiągnięciu progu.
                  Skontaktuj się przez Telegram: <span className="text-neon-cyan">@prywaciarzcom</span>
                </p>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-6 mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-3">
              Twój link polecający
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-zinc-900 border border-zinc-800 font-mono text-xs text-neon-green break-all">
                {referralLink}
              </div>
              <button
                onClick={copyLink}
                className="shrink-0 p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-neon-green" />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {stats.recentOrders.length > 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-4">
                Ostatnie polecenia
              </p>
              <div className="space-y-2">
                {stats.recentOrders.map((order, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 p-3 bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <span className="font-mono text-sm text-zinc-300">{order.product_name}</span>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-sm text-neon-green">{order.price_pln} PLN</span>
                      <span className="font-mono text-[10px] text-zinc-600">
                        {new Date(order.created_at).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-zinc-900/30 border border-zinc-800/50 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
              Zapisz swój Sekretny Link. Jeśli go zgubisz, stracisz dostęp do statystyk. Nie
              przechowujemy Twoich danych.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
