import { Globe, MessageSquare, Smartphone, Shield } from 'lucide-react';
import type { VoipPreferences } from '../types';

interface VoipConfigViewProps {
  preferences: VoipPreferences;
  onChange: (prefs: VoipPreferences) => void;
  onContinue: () => void;
}

const REGIONS = [
  {
    value: 'eu',
    label: 'Unia Europejska (np. Holandia, Szwecja)',
    desc: 'Najwyższa skuteczność, omija większość blokad antyspamowych',
    icon: Globe,
  },
  {
    value: 'us_ca',
    label: 'USA / Kanada',
    desc: 'Standardowe numery VoIP, idealne do globalnych serwisów',
    icon: Smartphone,
  },
  {
    value: 'offshore',
    label: 'Egzotyczne / Offshore',
    desc: 'Numery z jurysdykcji o luźnym prawie telekomunikacyjnym',
    icon: Shield,
  },
] as const;

const PURPOSES = [
  {
    value: 'messengers',
    label: 'Komunikatory (Telegram, Signal, WhatsApp)',
    desc: 'Czyste numery, nieoflagowane przez systemy anty-bot',
    icon: MessageSquare,
  },
  {
    value: 'social_otp',
    label: 'Social Media & Portale (X, Google, OpenAI)',
    desc: 'Odbiór kodów OTP do serwisów webowych',
    icon: Globe,
  },
  {
    value: 'universal',
    label: 'Uniwersalne (Wszystko)',
    desc: 'Numer do dowolnych zastosowań przez 30 dni',
    icon: Smartphone,
  },
] as const;

const DELIVERY_METHODS = [
  {
    value: 'telegram',
    label: 'Telegram Bot',
    desc: 'SMS-y automatycznie forwardowane na Twoje anonimowe konto Telegram. Szybko i bezpiecznie.',
    icon: MessageSquare,
  },
  {
    value: 'web_panel',
    label: 'Bezpieczny Panel WWW',
    desc: 'Dostęp do prywatnego linku, gdzie wiadomości pojawiają się w przeglądarce. Zero śladów w aplikacjach.',
    icon: Shield,
  },
] as const;

export default function VoipConfigView({ preferences, onChange, onContinue }: VoipConfigViewProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800">
        <Smartphone className="h-4 w-4 text-neon-green shrink-0" />
        <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
          Skonfiguruj swój wirtualny numer VoIP. Wybierz region, przeznaczenie i sposób odbioru SMS.
        </p>
      </div>

      <RadioSection
        label="Region numeru"
        icon={<Globe className="h-3 w-3 inline-block mr-1.5 -mt-0.5" />}
        options={REGIONS}
        value={preferences.region}
        onSelect={(v) => onChange({ ...preferences, region: v })}
      />

      <RadioSection
        label="Przeznaczenie"
        icon={<MessageSquare className="h-3 w-3 inline-block mr-1.5 -mt-0.5" />}
        options={PURPOSES}
        value={preferences.purpose}
        onSelect={(v) => onChange({ ...preferences, purpose: v })}
      />

      <RadioSection
        label="Odbiór SMS"
        icon={<Smartphone className="h-3 w-3 inline-block mr-1.5 -mt-0.5" />}
        options={DELIVERY_METHODS}
        value={preferences.deliveryMethod}
        onSelect={(v) => onChange({ ...preferences, deliveryMethod: v })}
      />

      <button
        type="button"
        onClick={onContinue}
        className="btn-neon-solid w-full flex items-center justify-center gap-2"
      >
        <Smartphone className="h-4 w-4" />
        <span>Zapisz preferencje i przejdź do płatności</span>
      </button>
    </div>
  );
}

function RadioSection({
  label,
  icon,
  options,
  value,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  options: ReadonlyArray<{
    value: string;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
        {icon}
        {label}
      </label>
      <div className="space-y-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
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
                    {opt.label}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-zinc-500 mt-1 leading-relaxed">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
