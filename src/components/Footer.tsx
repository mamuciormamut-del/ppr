import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const TELEGRAM_USERNAME = '@prywaciarzcom';
const BTC_ADDRESS = '148YMdCy8KSCtrwVMHPXQSxvrbh7eMVZBK';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-neon-green" />
              <span className="font-mono text-sm font-bold text-zinc-100">
                prywaciarz<span className="text-neon-green">.com</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Prywatność to prawo, nie przywilej.
              Zero cookies. Zero śledzenia.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-zinc-400">
                <Lock className="h-3 w-3 text-neon-green/60" />
                <span className="font-mono text-xs">E-mail: prywaciarz.com@proton.me</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <Lock className="h-3 w-3 text-neon-green/60" />
                <span className="font-mono text-xs">Telegram: {TELEGRAM_USERNAME}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-4">BTC</h4>
            <p className="font-mono text-[10px] text-zinc-500 break-all leading-relaxed">
              {BTC_ADDRESS}
            </p>
          </div>
        </div>

        <div className="mt-8 px-2">
          <p className="text-[10px] leading-relaxed text-zinc-600">
            Prywaciarz.com to zaufany serwis oferujący zaawansowane usługi prywatności cyfrowej.
            Specjalizujemy się w takich usługach jak anonimowa rejestracja kart sim, sprzedaż
            zarejestrowanych kart prepaid (Orange, Plus, Play, T-Mobile), konfiguracja telefonów
            GrapheneOS oraz audyty bezpieczeństwa OSINT. Gwarantujemy pełną dyskrecję i akceptujemy
            anonimowe płatności (Paysafecard, Krypto). Oferujemy również wirtualne numery VoIP do
            weryfikacji SMS oraz dedykowane serwery VPN.
          </p>
        </div>

        <div className="mt-10 border-t border-zinc-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Brak cookies &middot; Brak logowania &middot; Brak śledzenia
          </p>
          <Link
            to="/partner"
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-neon-green transition-colors duration-200"
          >
            Program Partnerski →
          </Link>
        </div>
      </div>
    </footer>
  );
}
