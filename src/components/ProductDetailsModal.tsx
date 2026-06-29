import { X } from 'lucide-react';
import type { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onBuy: (product: Product) => void;
}

const PRODUCT_DETAILS: Record<string, { description: string; images: string[] }> = {
  'duch-basic': {
    description: 'Duch Basic to najlepszy wybór dla tych, którzy szukają solidnego anonimowego urządzenia. Smartfon z zainstalowanym GrapheneOS oferuje maksymalną prywatność i bezpieczeństwo. Wszystkie dane pozostają wyłącznie u Ciebie.',
    images: [
  '/images/pixel-8-przod.png', 
  '/images/pixel-8-tyl.png'
],
  },
  'twierdza-pro': {
    description: 'Twierdza PRO to flagowy model dla najwymagających użytkowników. Zaawansowana konfiguracja GrapheneOS, rozszerzane opcje zabezpieczeń i pełna kontrola nad urządzeniem. Perfekcyjny do poufnych operacji i maksymalnej ochrony danych.',
    images: [
  '/images/pixel-8-pro-przod.png', 
  '/images/pixel-8-pro-tyl.png'
    ],
  },
};

export default function ProductDetailsModal({
  product,
  onClose,
  onBuy,
}: ProductDetailsModalProps) {
  const details = PRODUCT_DETAILS[product.slug];

  if (!details) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-neon-green/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-neon-green/30 flex items-center justify-between p-6">
          <h2 className="font-mono text-xl font-bold text-neon-green">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-neon-green transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-mono text-sm uppercase tracking-wider text-neon-cyan">
              Opis
            </h3>
            <p className="text-zinc-300 leading-relaxed">{details.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {details.images.map((image, idx) => (
              <div
                key={idx}
                className="aspect-square bg-zinc-800 border border-neon-green/20 overflow-hidden"
              >
                <img
                  src={image}
                  alt={`${product.name} - obraz ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="bg-zinc-800/50 border border-neon-green/20 p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-zinc-400">Cena:</span>
              <div className="text-right">
                {product.old_price_pln && (
                  <div className="font-mono text-xs text-zinc-500 line-through mb-1">
                    {product.old_price_pln} PLN
                  </div>
                )}
                <div className="font-mono text-2xl font-bold text-neon-green">
                  {product.price_pln} PLN
                </div>
              </div>
            </div>
            {product.discount_percent && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-400">Oszczędzasz:</span>
                <span className="font-mono text-neon-cyan font-bold">
                  {product.discount_percent}%
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                onBuy(product);
                onClose();
              }}
              className="btn-neon flex-1"
            >
              Kup Teraz
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 font-mono text-sm font-bold uppercase tracking-wider transition-colors"
            >
              Wróć
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
