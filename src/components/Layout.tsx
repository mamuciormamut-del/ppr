import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Helmet>
        <title>Prywaciarz - Anonimowa Rejestracja Kart SIM &amp; Bezpieczeństwo OSINT</title>
        <meta
          name="description"
          content="Kup gotowe, zarejestrowane polskie karty SIM. Szybka, zdalna i w pełni anonimowa rejestracja kart SIM. Płatności Paysafecard i Bitcoin. Zadbaj o prywatność w sieci."
        />
        <meta
          name="keywords"
          content="anonimowa rejestracja kart sim, zarejestrowane karty sim, kupno zarejestrowanej karty sim, prywatny VPN, audyt OSINT, anonimowe numery VoIP"
        />
      </Helmet>
      <div className="scanline fixed inset-0 z-[1] pointer-events-none" />
      <Header />
      <main className="flex-1 pt-16 relative z-[2]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
