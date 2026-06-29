import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import Layout from '../components/Layout';
import SchemaMarkup from '../components/SchemaMarkup';
import { FAQ_ITEMS, FAQItem } from '../data/faq';

export default function FAQListPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  const categories = [
    { id: 'general', label: 'Ogólne' },
    { id: 'sim', label: 'Karty SIM' },
    { id: 'vpn', label: 'VPN' },
    { id: 'voip', label: 'VoIP' },
    { id: 'grapheneos', label: 'GrapheneOS' },
  ];

  const filteredItems = FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <Layout>
      <SchemaMarkup type="FAQPage" data={{ items: FAQ_ITEMS }} />
      <Helmet>
        <title>FAQ - Częste Pytania | Prywaciarz</title>
        <meta
          name="description"
          content="Odpowiedzi na najczęściej zadawane pytania dotyczące kart SIM, VPN, VoIP i smartfonów GrapheneOS."
        />
        <meta name="keywords" content="FAQ, pytania, odpowiedzi, support" />
        <meta property="og:title" content="FAQ - Prywaciarz" />
        <meta property="og:description" content="Najczęściej zadawane pytania i odpowiedzi" />
      </Helmet>

      <div className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green mb-4">
              Wsparcie
            </h1>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Najczęściej <span className="text-neon-green">Zadawane</span> Pytania
            </h2>
            <p className="text-lg text-zinc-400">
              Znajdź odpowiedzi na Twoje pytania. Jeśli nie znalazłeś odpowiedzi, skontaktuj się z
              nami.
            </p>
          </div>

          <div className="mb-12 flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenId(null);
                }}
                className={`px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-neon-green text-black border border-neon-green'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-neon-green/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredItems.map((item: FAQItem) => (
              <div
                key={item.id}
                className="border border-zinc-800/50 bg-zinc-900/30 overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-900/50 transition-colors group"
                >
                  <h3 className="text-sm sm:text-base font-bold group-hover:text-neon-green transition-colors">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 text-neon-cyan shrink-0 transition-transform ${
                      openId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openId === item.id && (
                  <div className="px-4 py-4 border-t border-zinc-800/50 bg-zinc-900/10">
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t border-zinc-800/50 text-center">
            <h3 className="text-lg font-bold mb-4">Nie znalazłeś odpowiedzi?</h3>
            <p className="text-zinc-400 mb-6">
              Skontaktuj się z nami bezpośrednio. Nasz zespół jest dostępny 24/7.
            </p>
            <button className="btn-neon">
              Wyślij Wiadomość
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
