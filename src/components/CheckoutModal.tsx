import { useState, useEffect, useMemo } from 'react';
import {
  X, CreditCard, Bitcoin, Check, Loader2, AlertCircle,
  ChevronRight, ChevronLeft, Lock, Shield, Terminal, Server, Smartphone,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Product, VpnPreferences, VoipPreferences } from '../types';
import { createOrder } from '../lib/api';
import VpnConfigView from './VpnConfigView';
import VoipConfigView from './VoipConfigView';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
}

const BTC_ADDRESS = '148YMdCy8KSCtrwVMHPXQSxvrbh7eMVZBK';

type PaymentMethod = 'psc' | 'btc';
type Step = 'target_data' | 'vpn_config' | 'voip_config' | 'form' | 'success';

function getInitialStep(category: Product['category']): Step {
  if (category === 'osint') return 'target_data';
  if (category === 'vpn') return 'vpn_config';
  if (category === 'voip') return 'voip_config';
  return 'form';
}

function generateOrderRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

function mockEncrypt(plaintext: string): string {
  const encoded = btoa(unescape(encodeURIComponent(plaintext)));
  const chunks = encoded.match(/.{1,64}/g) || [];
  return [
    '-----BEGIN PGP MESSAGE-----',
    'Version: OpenPGP.js v4.10.10',
    'Hash: SHA512',
    '',
    ...chunks,
    '-----END PGP MESSAGE-----',
  ].join('\n');
}

function computeVpnSurcharge(prefs: VpnPreferences): number {
  let surcharge = 0;
  if (prefs.protocol === 'stealth') surcharge += 30;
  if (prefs.pihole) surcharge += 20;
  return surcharge;
}

function generatePscSchemes(total: number): number[][] {
  const denoms = [200, 100, 50, 30, 20, 10];
  const schemes: number[][] = [];

  const greedy: number[] = [];
  let remaining = total;
  for (const d of denoms) {
    while (remaining >= d) {
      greedy.push(d);
      remaining -= d;
    }
  }
  if (remaining === 0 && greedy.length > 0) schemes.push(greedy);

  if (total <= 200) {
    const single = [total];
    if (JSON.stringify(single) !== JSON.stringify(greedy)) schemes.push(single);
  } else {
    const half = Math.ceil(total / 2);
    const validDenom = (n: number) => denoms.some((d) => d === n);
    for (const d of denoms) {
      if (d >= half && d <= total) {
        const rest = total - d;
        if (rest === 0) {
          const s = [d];
          if (!schemes.some((x) => JSON.stringify(x) === JSON.stringify(s))) schemes.push(s);
        } else if (validDenom(rest)) {
          const s = [d, rest].sort((a, b) => b - a);
          if (!schemes.some((x) => JSON.stringify(x) === JSON.stringify(s))) schemes.push(s);
        }
      }
    }
  }

  return schemes.length > 0 ? schemes : [[total]];
}

const HEADER_TITLES: Record<Step, string> = {
  success: 'Zamówienie przyjęte',
  target_data: 'Dane audytu OSINT',
  vpn_config: 'Konfiguracja VPN',
  voip_config: 'Konfiguracja VoIP',
  form: 'Kup Anonimowo',
};

export default function CheckoutModal({ product, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>(() => getInitialStep(product.category));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('psc');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paczkomatCode, setPaczkomatCode] = useState('');
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);
  const [pscCodes, setPscCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [btcOrderRef] = useState(() => generateOrderRef());
  const [includeSim, setIncludeSim] = useState(false);

  const [targetInput, setTargetInput] = useState('');
  const [encryptedTargetData, setEncryptedTargetData] = useState('');
  const [encrypting, setEncrypting] = useState(false);

  const [vpnPreferences, setVpnPreferences] = useState<VpnPreferences>({
    location: 'ch_is',
    protocol: 'wireguard',
    pihole: false,
    pgpKey: '',
  });

  const [voipPreferences, setVoipPreferences] = useState<VoipPreferences>({
    region: 'eu',
    purpose: 'messengers',
    deliveryMethod: 'telegram',
  });

  const vpnSurcharge = product.category === 'vpn' ? computeVpnSurcharge(vpnPreferences) : 0;
  const totalPrice = product.price_pln + vpnSurcharge;
  const isBtcOnly = totalPrice > 1000;

  useEffect(() => {
    if (isBtcOnly) setPaymentMethod('btc');
  }, [isBtcOnly]);

  const effectiveSchemes = useMemo(() => {
    if (product.category === 'vpn' && vpnSurcharge > 0) {
      return generatePscSchemes(totalPrice);
    }
    const schemes = product.psc_schemes ?? [];
    return schemes.length > 0 ? schemes : [product.psc_amounts];
  }, [product, vpnSurcharge, totalPrice]);

  const activeScheme = effectiveSchemes[selectedSchemeIndex] ?? effectiveSchemes[0] ?? [totalPrice];

  useEffect(() => {
    setSelectedSchemeIndex(0);
  }, [effectiveSchemes]);

  useEffect(() => {
    setPscCodes(activeScheme.map(() => ''));
  }, [activeScheme]);

  const handlePscCodeChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const updated = [...pscCodes];
    updated[index] = cleaned;
    setPscCodes(updated);
  };

  const formatPscDisplay = (code: string) => {
    return code.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const validate = (): string | null => {
    if (!email || !email.includes('@')) return 'Podaj prawidłowy adres e-mail.';
    if (product.requires_phone_number && !phoneNumber.trim()) return 'Podaj numer telefonu do rejestracji.';
    if (product.is_physical && !paczkomatCode.trim()) return 'Podaj kod Paczkomatu InPost.';
    if (paymentMethod === 'psc') {
      for (let i = 0; i < pscCodes.length; i++) {
        if (pscCodes[i].length !== 16) return `Kod Paysafecard #${i + 1} musi mieć 16 cyfr.`;
      }
    }
    return null;
  };

  const handleEncryptAndContinue = async () => {
    if (!targetInput.trim()) {
      setError('Podaj co najmniej jeden cel audytu.');
      return;
    }
    setError('');
    setEncrypting(true);
    await new Promise((r) => setTimeout(r, 800));
    const encrypted = mockEncrypt(targetInput);
    setEncryptedTargetData(encrypted);
    setEncrypting(false);
    setStep('form');
  };

  const buildConfigData = (): Record<string, unknown> | undefined => {
    if (product.category === 'vpn') {
      return {
        vpn_preferences: vpnPreferences,
        vpn_surcharge: vpnSurcharge,
        total_price: totalPrice,
      };
    }
    if (product.category === 'voip') return { voip_preferences: voipPreferences };
    if (product.category === 'grapheneos') return { include_registered_sim: includeSim };
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const referrerId = sessionStorage.getItem('referrer_id') || undefined;
      const order = await createOrder({
        product_id: product.id,
        email,
        phone_number: product.requires_phone_number ? phoneNumber : undefined,
        paczkomat_code: product.is_physical ? paczkomatCode : undefined,
        payment_method: paymentMethod,
        psc_codes: paymentMethod === 'psc' ? pscCodes : undefined,
        encrypted_target_data: encryptedTargetData || undefined,
        config_data: buildConfigData(),
        referrer_id: referrerId,
      });
      setOrderNumber(order.order_number);
      setStep('success');
    } catch {
      setError('Błąd podczas składania zamówienia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const goBackFromForm = () => {
    if (product.category === 'vpn') setStep('vpn_config');
    else if (product.category === 'voip') setStep('voip_config');
    else if (product.category === 'osint') setStep('target_data');
  };

  const canGoBack = step === 'form' && (
    product.category === 'vpn' || product.category === 'voip' || product.category === 'osint'
  );

  const configSummary = step === 'form' && (product.category === 'vpn' || product.category === 'voip');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div>
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neon-green">
              {HEADER_TITLES[step]}
            </h2>
            {step !== 'success' && (
              <p className="text-xs text-zinc-500 mt-1">
                {product.name} &mdash; {totalPrice} PLN
                {vpnSurcharge > 0 && (
                  <span className="text-amber-400 ml-1">(+{vpnSurcharge} dopłata)</span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'success' && (
          <SuccessView
            orderNumber={orderNumber}
            isPhysical={product.is_physical}
            paymentMethod={paymentMethod}
            btcOrderRef={btcOrderRef}
          />
        )}

        {step === 'target_data' && (
          <TargetDataView
            targetInput={targetInput}
            onTargetInputChange={setTargetInput}
            encrypting={encrypting}
            error={error}
            onEncrypt={handleEncryptAndContinue}
          />
        )}

        {step === 'vpn_config' && (
          <VpnConfigView
            preferences={vpnPreferences}
            onChange={setVpnPreferences}
            onContinue={() => setStep('form')}
          />
        )}

        {step === 'voip_config' && (
          <VoipConfigView
            preferences={voipPreferences}
            onChange={setVoipPreferences}
            onContinue={() => setStep('form')}
          />
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {canGoBack && (
              <button
                type="button"
                onClick={goBackFromForm}
                className="flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-neon-green transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Wstecz do konfiguracji
              </button>
            )}

            {product.category === 'osint' && encryptedTargetData && (
              <div className="flex items-center gap-2 p-3 bg-neon-green/5 border border-neon-green/20">
                <Shield className="h-4 w-4 text-neon-green shrink-0" />
                <p className="font-mono text-[10px] text-neon-green">
                  Cele audytu zaszyfrowane (RSA-4096). Gotowe do przesłania.
                </p>
              </div>
            )}

            {configSummary && product.category === 'vpn' && (
              <ConfigBadge
                icon={<Server className="h-4 w-4 text-neon-green shrink-0" />}
                text={`Serwer: ${vpnPreferences.location.toUpperCase()} | ${vpnPreferences.protocol}${vpnPreferences.pihole ? ' + Pi-hole' : ''}${vpnSurcharge > 0 ? ` | +${vpnSurcharge} PLN` : ''}`}
              />
            )}

            {configSummary && product.category === 'voip' && (
              <ConfigBadge
                icon={<Smartphone className="h-4 w-4 text-neon-green shrink-0" />}
                text={`Region: ${voipPreferences.region.toUpperCase()} | ${voipPreferences.purpose} | SMS: ${voipPreferences.deliveryMethod}`}
              />
            )}

            {product.category === 'grapheneos' && (
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
                  Opcje dodatkowe
                </label>
                <button
                  type="button"
                  onClick={() => setIncludeSim(!includeSim)}
                  className={`w-full flex items-start gap-3 px-4 py-3 border transition-all text-left ${
                    includeSim
                      ? 'border-neon-green bg-neon-green/10'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
                  }`}
                >
                  <div className={`mt-0.5 h-4 w-4 border-2 shrink-0 transition-colors flex items-center justify-center ${
                    includeSim ? 'border-neon-green bg-neon-green' : 'border-zinc-600'
                  }`}>
                    {includeSim && (
                      <svg className="h-2.5 w-2.5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold ${includeSim ? 'text-neon-green' : 'text-zinc-200'}`}>
                        Wsadzona zarejestrowana karta SIM
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-neon-green/20 text-neon-green border border-neon-green/30">
                        0 PLN
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-500 mt-1 leading-relaxed">
                      Telefon zostanie wysłany z włożoną, aktywną i zarejestrowaną polską kartą SIM prepaid.
                    </p>
                  </div>
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twoj@protonmail.com"
                  className="input-dark"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-600 font-mono">
                  Zalecamy ProtonMail lub Tuta dla maksymalnej prywatności
                </p>
              </div>

              {product.requires_phone_number && (
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    Numer telefonu do rejestracji
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+48 XXX XXX XXX"
                    className="input-dark"
                    required
                  />
                </div>
              )}

              {product.is_physical && (
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                    Kod Paczkomatu InPost
                  </label>
                  <input
                    type="text"
                    value={paczkomatCode}
                    onChange={(e) => setPaczkomatCode(e.target.value.toUpperCase())}
                    placeholder="np. KRA04A"
                    className="input-dark"
                    required
                  />
                  <p className="mt-1 text-[10px] text-zinc-600 font-mono">
                    Brak adresu domowego. Tylko Paczkomat. Przesyłka nadana na dostarczony numer telefonu.
                  </p>
                </div>
              )}
            </div>

            {isBtcOnly ? (
              <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30">
                <Bitcoin className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="font-mono text-xs text-amber-400">
                  Zamówienia powyżej 1000 PLN realizowane wyłącznie przez Bitcoin.
                </p>
              </div>
            ) : (
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
                  Metoda płatności
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('psc')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border font-mono text-xs uppercase tracking-wider transition-all ${
                      paymentMethod === 'psc'
                        ? 'border-neon-green bg-neon-green/10 text-neon-green'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Paysafecard
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('btc')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border font-mono text-xs uppercase tracking-wider transition-all ${
                      paymentMethod === 'btc'
                        ? 'border-neon-green bg-neon-green/10 text-neon-green'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <Bitcoin className="h-4 w-4" />
                    Bitcoin
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'psc' && !isBtcOnly && (
              <PaysafecardSection
                schemes={effectiveSchemes}
                selectedSchemeIndex={selectedSchemeIndex}
                onSelectScheme={setSelectedSchemeIndex}
                pscCodes={pscCodes}
                onCodeChange={handlePscCodeChange}
                formatDisplay={formatPscDisplay}
                activeScheme={activeScheme}
                totalPrice={totalPrice}
              />
            )}

            {paymentMethod === 'btc' && (
              <BitcoinPayment totalPrice={totalPrice} orderRef={btcOrderRef} />
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon-solid w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Złóż zamówienie &mdash; {totalPrice} PLN</span>
              )}
            </button>

            {paymentMethod === 'btc' && (
              <p className="text-[10px] text-zinc-600 font-mono text-center -mt-2">
                Kliknij "Złóż zamówienie" po wysłaniu BTC — kod <span className="text-amber-400">{btcOrderRef}</span> identyfikuje Twoją płatność.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function ConfigBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-neon-green/5 border border-neon-green/20">
      {icon}
      <p className="font-mono text-[10px] text-neon-green">{text}</p>
    </div>
  );
}

function TargetDataView({
  targetInput,
  onTargetInputChange,
  encrypting,
  error,
  onEncrypt,
}: {
  targetInput: string;
  onTargetInputChange: (v: string) => void;
  encrypting: boolean;
  error: string;
  onEncrypt: () => void;
}) {
  return (
    <div className="p-4 space-y-5">
      <div className="p-4 border border-zinc-700 bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-neon-green" />
          <span className="font-mono text-xs uppercase tracking-widest text-neon-green font-bold">
            Zero-Knowledge Data Input
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Terminal className="h-3 w-3 text-zinc-500 shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-zinc-400 leading-relaxed">
              Jesteśmy tylko pośrednikiem. Twoje dane są szyfrowane lokalnie w przeglądarce kluczem publicznym (RSA-4096) docelowego systemu audytującego przed wysłaniem na nasze serwery. Nie mamy technicznej możliwości odczytania Twoich celów.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-3 w-3 text-zinc-500 shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
              Szyfrowanie: RSA-4096 + AES-256-GCM | Klucz publiczny audytora: <span className="text-zinc-400">0xA7F3...9E2B</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
          Cele audytu
        </label>
        <textarea
          value={targetInput}
          onChange={(e) => onTargetInputChange(e.target.value)}
          placeholder={"jan.kowalski@email.com\n+48 600 123 456\n@nick_na_forum\nhttps://profil.example.com/janek"}
          rows={6}
          className="input-dark font-mono text-sm resize-none leading-relaxed"
        />
        <p className="mt-1.5 font-mono text-[10px] text-zinc-600 leading-relaxed">
          Wpisz adresy e-mail, numery telefonów, pseudonimy, linki do profili — każdy cel w nowej linii.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 font-mono">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onEncrypt}
        disabled={encrypting}
        className="btn-neon-solid w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {encrypting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-mono text-xs">Szyfrowanie ładunku...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Zaszyfruj i przejdź do płatności</span>
          </>
        )}
      </button>

      {!encrypting && (
        <div className="p-3 bg-zinc-900/30 border border-zinc-800/50">
          <p className="font-mono text-[10px] text-zinc-600 text-center leading-relaxed">
            Po kliknięciu dane zostaną zaszyfrowane lokalnie w Twojej przeglądarce.
            Nasz serwer otrzyma wyłącznie szyfrogram niemożliwy do odczytania.
          </p>
        </div>
      )}
    </div>
  );
}

function PaysafecardSection({
  schemes,
  selectedSchemeIndex,
  onSelectScheme,
  pscCodes,
  onCodeChange,
  formatDisplay,
  activeScheme,
  totalPrice,
}: {
  schemes: number[][];
  selectedSchemeIndex: number;
  onSelectScheme: (i: number) => void;
  pscCodes: string[];
  onCodeChange: (i: number, v: string) => void;
  formatDisplay: (code: string) => string;
  activeScheme: number[];
  totalPrice: number;
}) {
  return (
    <div className="space-y-4">
      {schemes.length > 1 && (
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3">
            Wybierz schemat kart Paysafecard
          </label>
          <div className="space-y-2">
            {schemes.map((scheme, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectScheme(i)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 border transition-all text-left ${
                  selectedSchemeIndex === i
                    ? 'border-neon-green bg-neon-green/5'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full border-2 shrink-0 transition-colors ${
                    selectedSchemeIndex === i ? 'border-neon-green bg-neon-green' : 'border-zinc-600'
                  }`} />
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {scheme.map((amount, j) => (
                      <span key={j} className="flex items-center gap-1">
                        {j > 0 && <span className="text-zinc-600 text-xs">+</span>}
                        <span className={`font-mono text-xs px-2 py-0.5 border ${
                          selectedSchemeIndex === i
                            ? 'border-neon-green/40 text-neon-green bg-neon-green/10'
                            : 'border-zinc-700 text-zinc-400'
                        }`}>
                          {amount} PLN
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-zinc-500">
                    {scheme.length}&nbsp;{scheme.length === 1 ? 'karta' : scheme.length < 5 ? 'karty' : 'kart'}
                  </span>
                  {selectedSchemeIndex === i && (
                    <ChevronRight className="h-3 w-3 text-neon-green" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            Kody Paysafecard
          </span>
          <span className="font-mono text-xs text-zinc-500">
            Łącznie: <span className="text-neon-green">{totalPrice} PLN</span>
          </span>
        </div>
        {activeScheme.map((amount, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] text-zinc-400">Karta {i + 1} &mdash;</span>
              <span className="font-mono text-[11px] text-neon-green font-bold">{amount} PLN</span>
            </div>
            <input
              type="text"
              value={formatDisplay(pscCodes[i] || '')}
              onChange={(e) => onCodeChange(i, e.target.value.replace(/\s/g, ''))}
              placeholder="XXXX XXXX XXXX XXXX"
              maxLength={19}
              className="input-dark tracking-[0.15em]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BitcoinPayment({ totalPrice, orderRef }: { totalPrice: number; orderRef: string }) {
  const btcUri = `bitcoin:${BTC_ADDRESS}?label=${orderRef}`;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-500/5 border border-amber-500/20">
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-2">
          Twój unikalny kod referencyjny
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-2xl font-bold text-amber-400 tracking-[0.25em]">
            {orderRef}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(orderRef)}
            className="font-mono text-[10px] uppercase tracking-widest text-amber-400/70 hover:text-amber-400 transition-colors border border-amber-500/30 px-2 py-1 shrink-0"
          >
            Kopiuj
          </button>
        </div>
        <p className="text-[10px] text-amber-400/60 font-mono mt-2 leading-relaxed">
          Podaj ten kod w opisie transakcji BTC lub wyślij go e-mailem razem z TX ID po wysłaniu płatności. Gwarantuje przypisanie płatności do Twojego zamówienia.
        </p>
      </div>

      <div className="p-4 bg-zinc-900 border border-zinc-800 text-center">
        <p className="font-mono text-xs text-zinc-400 mb-1">
          Wyślij równowartość <span className="text-neon-green font-bold">{totalPrice} PLN</span> w BTC na adres:
        </p>
        <p className="font-mono text-[10px] text-zinc-600 mb-4">
          Ref: <span className="text-amber-400 tracking-wider">{orderRef}</span>
        </p>
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white inline-block">
            <QRCodeSVG
              value={btcUri}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
        </div>
        <p className="font-mono text-[10px] text-zinc-500 mb-1">Adres Bitcoin:</p>
        <p className="font-mono text-[11px] text-zinc-300 break-all select-all leading-relaxed">
          {BTC_ADDRESS}
        </p>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(BTC_ADDRESS)}
          className="mt-3 font-mono text-[10px] uppercase tracking-widest text-neon-green hover:text-neon-green/80 transition-colors"
        >
          Kopiuj adres BTC
        </button>
      </div>

      <div className="p-3 bg-zinc-900/50 border border-zinc-800">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Instrukcja płatności</p>
        <ol className="space-y-1.5">
          {[
            'Wyślij BTC na powyższy adres',
            `W opisie/notatce transakcji wpisz kod: ${orderRef}`,
            'Kliknij "Złóż zamówienie" poniżej aby zapisać zamówienie',
            'Opcjonalnie: wyślij TX ID e-mailem dla szybszej weryfikacji',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-mono text-[10px] text-neon-green shrink-0">{i + 1}.</span>
              <span className="font-mono text-[10px] text-zinc-500 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SuccessView({
  orderNumber,
  isPhysical,
  paymentMethod,
  btcOrderRef,
}: {
  orderNumber: string;
  isPhysical: boolean;
  paymentMethod: PaymentMethod;
  btcOrderRef: string;
}) {
  return (
    <div className="p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-6 border-2 border-neon-green bg-neon-green/10">
        <Check className="h-8 w-8 text-neon-green" />
      </div>
      <h3 className="font-mono text-lg font-bold text-zinc-100 mb-2">
        Zamówienie przyjęte
      </h3>
      <p className="font-mono text-xs text-zinc-400 mb-2">
        Numer zamówienia: <span className="text-neon-green">{orderNumber}</span>
      </p>
      {paymentMethod === 'btc' && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 inline-block">
          <p className="font-mono text-[10px] text-amber-400/70 uppercase tracking-widest mb-1">Kod referencyjny BTC</p>
          <p className="font-mono text-lg font-bold text-amber-400 tracking-[0.2em]">{btcOrderRef}</p>
          <p className="font-mono text-[10px] text-amber-400/50 mt-1">Zachowaj ten kod — identyfikuje Twoją płatność</p>
        </div>
      )}
      <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto mt-4">
        Realizacja w ciągu <span className="text-zinc-100 font-medium">24 godzin</span>.
        {isPhysical
          ? ' Przesyłka zostanie nadana na podany numer telefonu.'
          : ' Sprawdzaj bezpieczną skrzynkę e-mail.'}
      </p>
    </div>
  );
}
