import { Helmet } from 'react-helmet-async';

interface SchemaMarkupProps {
  type: 'Organization' | 'Service' | 'FAQPage' | 'BlogPosting';
  data?: Record<string, unknown>;
}

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  let schema: Record<string, unknown> = {};

  switch (type) {
    case 'Organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Prywaciarz',
        url: 'https://prywaciarz.com',
        logo: 'https://prywaciarz.com/logo.png',
        description: 'Anonimowe karty SIM, VPN, VoIP i smartfony GrapheneOS',
        sameAs: [],
        contact: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'support@prywaciarz.com',
        },
      };
      break;

    case 'Service':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: data?.name || 'Usługa',
        description: data?.description || '',
        provider: {
          '@type': 'Organization',
          name: 'Prywaciarz',
          url: 'https://prywaciarz.com',
        },
        ...(data?.price && {
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'PLN',
            availability: data?.stock ? 'InStock' : 'OutOfStock',
          },
        }),
      };
      break;

    case 'FAQPage':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data?.items?.map((item: Record<string, unknown>) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })) || [],
      };
      break;

    case 'BlogPosting':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data?.title || '',
        description: data?.description || '',
        image: data?.image || 'https://prywaciarz.com/default-image.png',
        datePublished: data?.publishedAt || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: data?.author || 'Prywaciarz',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Prywaciarz',
          logo: {
            '@type': 'ImageObject',
            url: 'https://prywaciarz.com/logo.png',
          },
        },
      };
      break;

    default:
      schema = {};
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
