import { Smartphone, Search, Phone, Server, Nfc } from 'lucide-react';
import type { Product } from '../types';
import ServiceCard from './ServiceCard';

interface ServicesGridProps {
  products: Product[];
  onBuy: (product: Product) => void;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  sim: {
    label: 'Karty SIM',
    icon: <Nfc className="h-5 w-5" />,
    description: 'Zarejestrowane polskie karty SIM prepaid. Orange, Plus, T-mobile, Play i wiele innych.',
  },
  grapheneos: {
    label: 'Telefony GrapheneOS',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Prywatność z pudełka. Gotowe do użycia anonimowe smartfony.',
  },
  osint: {
    label: 'Audyt OSINT',
    icon: <Search className="h-5 w-5" />,
    description: 'Biały wywiad. Sprawdź co internet wie o Tobie.',
  },
  voip: {
    label: 'Wirtualny Numer VoIP',
    icon: <Phone className="h-5 w-5" />,
    description: 'Zagraniczny numer do odbioru SMS weryfikacyjnych.',
  },
  vpn: {
    label: 'Prywatny Serwer VPN',
    icon: <Server className="h-5 w-5" />,
    description: 'Dedykowany serwer VPN. Zero logów. Pełna kontrola.',
  },
};

const CATEGORY_ORDER = ['sim', 'grapheneos', 'osint', 'voip', 'vpn'];

export default function ServicesGrid({ products, onBuy }: ServicesGridProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    meta: CATEGORY_META[cat],
    items: products.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="uslugi" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green mb-4">
            Usługi
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight">
            Wybierz swój <span className="text-neon-green">poziom prywatności</span>
          </p>
        </div>

        <div className="space-y-16">
          {grouped.map(({ category, meta, items }) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50">
                <div className="text-neon-green">{meta.icon}</div>
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-100">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{meta.description}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((product) => (
                  <ServiceCard key={product.id} product={product} onBuy={onBuy} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
