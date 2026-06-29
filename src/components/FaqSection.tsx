import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Ile trwa realizacja zamówienia?',
    answer:
      'Kody Paysafecard weryfikujemy ręcznie. Standardowy czas realizacji to 12-24 godziny. W przypadku płatności BTC, realizacja następuje po potwierdzeniu transakcji w sieci Bitcoin (zazwyczaj 1-3 potwierdzenia).',
  },
  {
    question: 'Jak otrzymam instrukcje / produkt?',
    answer:
      'Wszystkie informacje, instrukcje konfiguracyjne oraz dane dostępowe wysyłamy na podany przez Ciebie adres e-mail. Dlatego zalecamy korzystanie z szyfrowanych skrzynek jak ProtonMail lub Tuta.',
  },
  {
    question: 'Co jeśli mój kod Paysafecard nie zadziała?',
    answer:
      'Jeśli kod PSC jest nieprawidłowy lub już wykorzystany, skontaktuj się z nami przez Telegram lub e-mail podając numer zamówienia. Zweryfikujemy kod i ustalimy rozwiązanie.',
  },
  {
    question: 'Czy mogę dostać zwrot pieniędzy?',
    answer:
      'Z uwagi na cyfrowy i anonimowy charakter usług, po weryfikacji płatności nie przyjmujemy zwrotów. Przed zakupem upewnij się, że wybrałeś odpowiednią usługę.',
  },
  {
    question: 'Jakie dane ode mnie potrzebujecie?',
    answer:
      'Absolutne minimum. Dla usług cyfrowych wymagamy tylko adres e-mail. Dla produktów fizycznych (telefony, karty SIM z dostawą) potrzebujemy dodatkowo kod Paczkomatu InPost. Nie zbieramy imion, nazwisk, ani adresów domowych.',
  },
  {
    question: 'Czy to legalne?',
    answer:
      'Wszystkie nasze usługi są zgodne z prawem. Oferujemy narzędzia do ochrony prywatności, które mają wiele legalnych zastosowań. Klient ponosi odpowiedzialność za sposób ich wykorzystania.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green mb-4">
            FAQ
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">
            Najczęściej zadawane <span className="text-neon-green">pytania</span>
          </p>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border border-zinc-800 bg-zinc-900/30">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left group"
              >
                <span className="text-sm font-medium text-zinc-200 group-hover:text-neon-green transition-colors pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180 text-neon-green' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
