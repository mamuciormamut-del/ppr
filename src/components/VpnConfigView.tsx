import { Globe, Shield, Key, Server } from 'lucide-react';
import type { VpnPreferences } from '../types';

interface VpnConfigViewProps {
  preferences: VpnPreferences;
  onChange: (prefs: VpnPreferences) => void;
  onContinue: () => void;
}

const LOCATIONS = [
  {
    value: 'ch_is',
    label: 'Szwajcaria / Islandia',
    desc: 'Poza 14-Eyes, maksymalna prywatność',
    icon: Shield,
  },
  {
    value: 'ro',
    label: 'Rumunia',
    desc: 'Ignorowanie DMCA, brak logów',
    icon: Globe,
  },
  {
    value: 'se',
    label: 'Szwecja',
    desc: 'Idealny balans ping/prywatność dla Europy Środkowej',
    icon: Server,
  },
] as const;

const PROTOCOLS = [
  {
    value: 'wireguard',
    label: 'WireGuard',
    desc: 'Najszybszy, nowoczesna kryptografia, polecany',
  },
  {
    value: 'openvpn',
    label: 'OpenVPN',
    desc: 'Standard branżowy, wysoka kompatybilność',
  },
  {
    value: 'stealth',
    label: 'Stealth / Shadowsocks',
    desc: 'Omijanie głębokiej inspekcji pakietów (DPI) (+30 PLN)',
  },
] as const;

export default function VpnConfigView({ preferences, onChange, onContinue }: VpnConfigViewProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800">
        <Server className="h-4 w-4 text-neon-green shrink-0" />
        <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
          Skonfiguruj dedykowany serwer VPN. Wszystkie ustawienia można zmienić po zakupie.
        </p>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
          <Globe className="h-3 w-3 inline-block mr-1.5 -mt-0.5" />
          Jurysdykcja serwera
        </label>
        <div className="space-y-2">
          {LOCATIONS.map((loc) => {
            const Icon = loc.icon;
            const active = preferences.location === loc.value;
            return (
              <button
                key={loc.value}
                type="button"
                onClick={() => onChange({ ...preferences, location: loc.value })}
                className={`w-full flex items-start gap-3 px-4 py-3 border transition-all text-left ${
                  active
                    ? 'border-neon-green bg-neon-green/10'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
                }`}
              >
                <div className={`mt-0.5 h-3 w-3 rounded-full border-2 shrink-0 transition-colors ${
                  active ? 'border-neon-green bg-neon-green' : 'border-zinc-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-neon-green' : 'text-zinc-500'}`} />
                    <span className={`font-mono text-xs font-bold ${active ? 'text-neon-green' : 'text-zinc-200'}`}>
                      {loc.label}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500 mt-1 leading-relaxed">{loc.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
          <Shield className="h-3 w-3 inline-block mr-1.5 -mt-0.5" />
          Protokół
        </label>
        <div className="space-y-2">
          {PROTOCOLS.map((proto) => {
            const active = preferences.protocol === proto.value;
            return (
              <button
                key={proto.value}
                type="button"
                onClick={() => onChange({ ...preferences, protocol: proto.value })}
                className={`w-full flex items-start gap-3 px-4 py-3 border transition-all text-left ${
                  active
                    ? 'border-neon-green bg-neon-green/10'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
                }`}
              >
                <div className={`mt-0.5 h-3 w-3 rounded-full border-2 shrink-0 transition-colors ${
                  active ? 'border-neon-green bg-neon-green' : 'border-zinc-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className={`font-mono text-xs font-bold ${active ? 'text-neon-green' : 'text-zinc-200'}`}>
                    {proto.label}
                  </span>
                  <p className="font-mono text-[10px] text-zinc-500 mt-1 leading-relaxed">{proto.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
          <Server className="h-3 w-3 inline-block mr-1.5 -mt-0.5" />
          Moduły dodatkowe
        </label>
        <button
          type="button"
          onClick={() => onChange({ ...preferences, pihole: !preferences.pihole })}
          className={`w-full flex items-start gap-3 px-4 py-3 border transition-all text-left ${
            preferences.pihole
              ? 'border-neon-green bg-neon-green/10'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
          }`}
        >
          <div className={`mt-0.5 h-4 w-4 border-2 shrink-0 transition-colors flex items-center justify-center ${
            preferences.pihole ? 'border-neon-green bg-neon-green' : 'border-zinc-600'
          }`}>
            {preferences.pihole && (
              <svg className="h-2.5 w-2.5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`font-mono text-xs font-bold ${preferences.pihole ? 'text-neon-green' : 'text-zinc-200'}`}>
              Pi-hole / DNS Sinkhole
            </span>
            <p className="font-mono text-[10px] text-zinc-500 mt-1 leading-relaxed">
              Wycinanie reklam i trackerów na poziomie serwera DNS tunelu (+20 PLN)
            </p>
          </div>
        </button>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
          <Key className="h-3 w-3 inline-block mr-1.5 -mt-0.5" />
          Twój klucz publiczny PGP (Opcjonalnie)
        </label>
        <textarea
          value={preferences.pgpKey}
          onChange={(e) => onChange({ ...preferences, pgpKey: e.target.value })}
          placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----&#10;...&#10;-----END PGP PUBLIC KEY BLOCK-----"
          rows={4}
          className="input-dark font-mono text-[11px] resize-none leading-relaxed"
        />
        <p className="mt-1.5 font-mono text-[10px] text-zinc-600 leading-relaxed">
          Wklej swój klucz publiczny. Zaszyfrujemy nim paczkę z plikami konfiguracyjnymi, zanim wyślemy ją na Twój e-mail.
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="btn-neon-solid w-full flex items-center justify-center gap-2"
      >
        <Shield className="h-4 w-4" />
        <span>Zapisz konfigurację i przejdź do płatności</span>
      </button>
    </div>
  );
}
