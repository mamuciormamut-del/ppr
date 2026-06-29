import { AlertTriangle, Ban, Cookie, X } from 'lucide-react';

export default function DisclaimerSection() {
  return (
    <section className="py-16 px-4 border-t border-zinc-800/50">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
            Regulamin
          </h2>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-300">
            Warunki świadczenia usług
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-5 border border-zinc-800 bg-zinc-900/20">
            <AlertTriangle className="h-5 w-5 text-amber-400 mb-3" />
            <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-300 mb-2">
              Wyłączenie odpowiedzialności
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Oferowane usługi i produkty służą wyłącznie do legalnej ochrony prywatności.
              Nie ponosimy odpowiedzialności za sposób ich wykorzystania przez klienta.
              Usługi nie mogą być wykorzystywane do łamania prawa.
            </p>
          </div>

          <div className="p-5 border border-zinc-800 bg-zinc-900/20">
            <Ban className="h-5 w-5 text-red-400 mb-3" />
            <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-300 mb-2">
              Polityka zwrotów
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Z uwagi na cyfrowy i anonimowy charakter usług, po weryfikacji płatności
              (kod PSC lub potwierdzenie BTC) nie przyjmujemy zwrotów.
              Przed zakupem upewnij się, że wybrałeś odpowiednią usługę. 
            </p>
          </div>

          <div className="p-5 border border-zinc-800 bg-zinc-900/20">
            <div className="relative inline-block mb-3">
              <Cookie className="h-5 w-5 text-neon-cyan" />
              <X className="h-4 w-4 text-red-400 absolute -top-1 -right-1" />
            </div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-300 mb-2">
              Prywatność danych
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Nie stosujemy cookies, trackingu ani analityki. Podany e-mail służy wyłącznie
              do realizacji zamówienia i nie jest przechowywany po zakończeniu usługi.
              Nie zbieramy danych osobowych.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
