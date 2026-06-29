import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import RecentSalesTicker from '../components/RecentSalesTicker';
import HeroSection from '../components/HeroSection';
import ServicesGrid from '../components/ServicesGrid';
import SEOContentSection from '../components/SEOContentSection';
import FaqSection from '../components/FaqSection';
import DisclaimerSection from '../components/DisclaimerSection';
import CheckoutModal from '../components/CheckoutModal';
import SchemaMarkup from '../components/SchemaMarkup';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.hash === '#uslugi') {
      setTimeout(() => {
        document.getElementById('uslugi')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <Layout>
      <Helmet>
        <title>Prywaciarz.com — Anonimowa Rejestracja Kart SIM, Prywatny VPN, GrapheneOS</title>
        <meta
          name="description"
          content="Rejestracja kart SIM bez danych osobowych, anonimowe karty SIM incognito, prywatne urządzenia GrapheneOS, prywatny VPN, audyty OSINT i usługi VoIP. Pełna prywatność i bezpieczeństwo cyfrowe."
        />
        <meta
          name="keywords"
          content="rejestracja kart SIM, anonimowa rejestracja kart SIM, anonimowa karta SIM, incognito SIM, prywatne urządzenia, prywatny VPN, audyty OSINT, VoIP anonimowy, GrapheneOS Polska, karta SIM bez dowodu, starter GSM anonimowy, anonimowość online"
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="pl" />
        <meta property="og:title" content="Prywaciarz.com — Anonimowa Rejestracja Kart SIM, Prywatny VPN, GrapheneOS" />
        <meta
          property="og:description"
          content="Anonimowa rejestracja kart SIM, prywatne urządzenia GrapheneOS, prywatny VPN i audyty OSINT. Pełna prywatność i anonimowość online."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prywaciarz.com" />
        <meta property="og:locale" content="pl_PL" />
        <link rel="canonical" href="https://prywaciarz.com" />
      </Helmet>
      <SchemaMarkup type="Organization" />

      <RecentSalesTicker />
      <HeroSection />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 text-neon-green animate-spin" />
        </div>
      ) : (
        <ServicesGrid products={products} onBuy={setSelectedProduct} />
      )}

      <SEOContentSection />
      <FaqSection />
      <DisclaimerSection />

      {selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </Layout>
  );
}
