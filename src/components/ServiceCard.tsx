import { Package } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../types';
import ProductDetailsModal from './ProductDetailsModal';

interface ServiceCardProps {
  product: Product;
  onBuy: (product: Product) => void;
}

export default function ServiceCard({ product, onBuy }: ServiceCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hasDetails = product.category === 'grapheneos';
  const showBestsellerLabel = product.slug === 'rejestracja-karty-sim';
  const hasDiscount = product.old_price_pln && product.discount_percent;

  return (
    <>
      <div className="card-dark flex flex-col p-6 group relative overflow-hidden">
        {hasDiscount && (
          <div className={`absolute top-0 right-0 font-mono text-[11px] font-bold px-3 py-1 tracking-wider ${
            showBestsellerLabel
              ? 'bg-yellow-600 text-yellow-100'
              : 'bg-red-500 text-white'
          }`}>
            {showBestsellerLabel ? 'BESTSELLER' : `-${product.discount_percent}%`}
          </div>
        )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="font-mono text-lg font-bold text-zinc-100 group-hover:text-neon-green transition-colors">
          {product.name}
        </h3>
        <div className="shrink-0 text-right">
          {hasDiscount && (
            <span className="block font-mono text-xs text-zinc-500 line-through mb-0.5">
              {product.old_price_pln} PLN
            </span>
          )}
          <div className="px-3 py-1 bg-neon-green/10 border border-neon-green/30">
            <span className="font-mono text-sm font-bold text-neon-green whitespace-nowrap">
              {product.price_pln} PLN
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed mb-6 flex-1">
        {product.description}
      </p>

      {product.is_physical && (
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5">
            <Package className="h-3 w-3 text-neon-cyan" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan">
              Wysyłka InPost Paczkomat
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 pl-[18px]">
            Przesyłka zostanie nadana na dostarczony numer telefonu.
          </p>
        </div>
      )}

      {product.stock != null && (
        <div className="flex items-center gap-1.5 mb-4">
          <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
          <span className={`font-mono text-[10px] uppercase tracking-widest ${product.stock > 0 ? 'text-neon-green' : 'text-red-400'}`}>
            {product.stock > 0 ? `Dostępne: ${product.stock} szt` : 'Brak na stanie'}
          </span>
        </div>
      )}

      {product.requires_phone_number && (
        <div className="flex items-center gap-1.5 mb-4">
          <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-neon-green">
            Realizacja w 10 minut
          </span>
        </div>
      )}

      {hasDetails ? (
        <div className="flex gap-3">
          <button
            onClick={() => setShowDetails(true)}
            className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-neon-cyan/50 text-neon-cyan font-mono text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Szczegóły
          </button>
          <button
            onClick={() => onBuy(product)}
            disabled={product.stock != null && product.stock <= 0}
            className="flex-1 btn-neon disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.stock != null && product.stock <= 0 ? 'Niedostępne' : 'Kup Teraz'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => onBuy(product)}
          disabled={product.stock != null && product.stock <= 0}
          className="btn-neon w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {product.stock != null && product.stock <= 0
            ? 'Niedostępne'
            : product.category === 'vpn'
            ? 'Kup Teraz'
            : 'Kup Anonimowo'}
        </button>
      )}
    </div>

    {showDetails && (
      <ProductDetailsModal
        product={product}
        onClose={() => setShowDetails(false)}
        onBuy={onBuy}
      />
    )}
    </>
  );
}
