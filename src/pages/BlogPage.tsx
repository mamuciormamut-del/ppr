import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Calendar, Clock, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import SchemaMarkup from '../components/SchemaMarkup';
import { fetchBlogPosts } from '../lib/api';
import type { BlogPost } from '../types';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts(true)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <SchemaMarkup type="Organization" />
      <Helmet>
        <title>Blog Prywaciarz - Poradniki Prywatności i Bezpieczeństwa</title>
        <meta
          name="description"
          content="Blog o prywatności, bezpieczeństwie i anonimowości w Polsce. Poradniki o rejestracji kart SIM, prywatnym VPN, GrapheneOS i audytach OSINT."
        />
        <meta
          name="keywords"
          content="rejestracja kart SIM, anonimowa rejestracja kart SIM, prywatne urządzenia, prywatny VPN, audyty OSINT, incognito SIM, blog prywatność"
        />
        <meta property="og:title" content="Blog Prywaciarz - Prywatność i Bezpieczeństwo" />
        <meta
          property="og:description"
          content="Poradniki i artykuły o prywatności i bezpieczeństwie online — rejestracja kart SIM, VPN, GrapheneOS."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://prywaciarz.com/blog" />
      </Helmet>

      <div className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16">
            <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green mb-4">
              Knowledge Hub
            </h1>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Wszystko o <span className="text-neon-green">prywatności</span> i{' '}
              <span className="text-neon-cyan">bezpieczeństwie</span>
            </h2>
            <p className="text-lg text-zinc-400">
              Artykuły i poradniki o anonimowej rejestracji kart SIM, prywatnych urządzeniach, VPN i audytach OSINT.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 text-neon-green animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-zinc-500 font-mono text-sm text-center py-20">Brak opublikowanych wpisów.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group block p-6 border border-zinc-800/50 hover:border-neon-green/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-lg sm:text-xl font-bold group-hover:text-neon-green transition-colors flex-1">
                      {post.title}
                    </h2>
                    <ArrowRight className="h-5 w-5 text-neon-cyan shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <p className="text-zinc-400 mb-4">{post.description}</p>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {post.published_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.published_at).toLocaleDateString('pl-PL')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span>{post.read_time} min czytania</span>
                    </div>
                  </div>

                  {post.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="text-[10px] uppercase tracking-wider px-2 py-1 bg-neon-green/10 text-neon-green border border-neon-green/20"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
