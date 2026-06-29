import { ShieldCheck, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative grid-bg min-h-[90vh] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 pointer-events-none" />

      <div className="relative z-10 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-neon-green/20 bg-neon-green/5">
          <ShieldCheck className="h-4 w-4 text-neon-green" />
          <span className="font-mono text-xs uppercase tracking-widest text-neon-green">
            Twoja prywatność. Twoje zasady.
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Znikasz z sieci.
          <br />
          <span className="text-neon-green">Na Twoich warunkach.</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
          Anonimowe telefony, karty SIM, serwery VPN i audyty OSINT.
          Płatność Paysafecard lub Bitcoin. Bez danych osobowych. Bez śladu.
        </p>

        <a href="#uslugi" className="btn-neon-solid inline-flex items-center gap-2">
          <span>Zobacz usługi</span>
          <ChevronDown className="h-4 w-4" />
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-5 w-5 text-zinc-600" />
      </div>
    </section>
  );
}
