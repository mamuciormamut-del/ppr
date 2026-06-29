import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, User, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import SchemaMarkup from '../components/SchemaMarkup';
import { fetchBlogPostBySlug, fetchBlogPosts } from '../lib/api';
import type { BlogPost } from '../types';

function renderContent(content: string) {
  return content.split('\n\n').map((paragraph, idx) => {
    if (paragraph.startsWith('# ')) {
      return (
        <h1 key={idx} className="text-2xl font-bold text-neon-green mt-8 mb-4">
          {paragraph.substring(2)}
        </h1>
      );
    }
    if (paragraph.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-xl font-bold text-neon-cyan mt-6 mb-3">
          {paragraph.substring(3)}
        </h2>
      );
    }
    if (paragraph.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-lg font-bold text-zinc-200 mt-4 mb-2">
          {paragraph.substring(4)}
        </h3>
      );
    }
    if (paragraph.startsWith('- ') || paragraph.split('\n').some((l) => l.startsWith('- '))) {
      const lines = paragraph.split('\n').filter((l) => l.startsWith('- '));
      if (lines.length > 0) {
        return (
          <ul key={idx} className="list-disc list-inside space-y-2">
            {lines.map((line, i) => (
              <li key={i} className="text-zinc-400">
                {line.substring(2).replace(/\*\*(.+?)\*\*/g, '$1')}
              </li>
            ))}
          </ul>
        );
      }
    }
    if (paragraph.startsWith('1. ') || paragraph.split('\n').some((l) => /^\d+\. /.test(l))) {
      const lines = paragraph.split('\n').filter((l) => /^\d+\. /.test(l));
      if (lines.length > 0) {
        return (
          <ol key={idx} className="list-decimal list-inside space-y-2">
            {lines.map((line, i) => (
              <li key={i} className="text-zinc-400">
                {line.replace(/^\d+\. /, '')}
              </li>
            ))}
          </ol>
        );
      }
    }
    if (paragraph.includes('|')) {
      const lines = paragraph.split('\n').filter((l) => l.includes('|') && !l.match(/^[\s|:-]+$/));
      if (lines.length > 0) {
        return (
          <div key={idx} className="overflow-x-auto">
            <table className="w-full border border-zinc-700 text-sm">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-zinc-700 even:bg-zinc-900/30">
                    {line.split('|').filter((cell) => cell.trim()).map((cell, j) => (
                      <td key={j} className="px-4 py-2 text-zinc-400 border-r border-zinc-700 last:border-r-0">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }
    const formatted = paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return (
      <p key={idx} className="text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
}

export default function BlogPostView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetchBlogPostBySlug(slug)
      .then((p) => setPost(p))
      .catch(() => setPost(null));
    fetchBlogPosts(true)
      .then((all) => setRelatedPosts(all.filter((p) => p.slug !== slug).slice(0, 3)))
      .catch(console.error);
  }, [slug]);

  if (post === undefined) {
    return (
      <Layout>
        <div className="py-20 flex justify-center">
          <Loader2 className="h-6 w-6 text-neon-green animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="py-20 px-4 text-center">
          <h1 className="text-2xl font-bold text-zinc-300 mb-4">Artykuł nie znaleziony</h1>
          <Link to="/blog" className="text-neon-green hover:text-neon-cyan transition-colors">
            Powrót do bloga
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SchemaMarkup
        type="BlogPosting"
        data={{
          title: post.title,
          description: post.description,
          publishedAt: post.published_at ?? post.created_at,
          author: post.author,
        }}
      />
      <Helmet>
        <title>{post.title} - Blog Prywaciarz</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords.join(', ')} />
        <meta name="author" content={post.author} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        {post.published_at && (
          <meta property="article:published_time" content={post.published_at} />
        )}
        <link rel="canonical" href={`https://prywaciarz.com/blog/${post.slug}`} />
      </Helmet>

      <div className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-green transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do bloga
          </button>

          <article>
            <header className="mb-8 pb-8 border-b border-zinc-800/50">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.published_at).toLocaleDateString('pl-PL')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time} min czytania</span>
                </div>
              </div>

              {post.keywords.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="text-[11px] uppercase tracking-wider px-2.5 py-1 bg-neon-green/10 text-neon-green border border-neon-green/20 font-mono"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="prose prose-invert max-w-none">
              <div className="text-zinc-300 leading-relaxed space-y-6">
                {renderContent(post.content)}
              </div>
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-zinc-800/50">
              <h3 className="font-mono text-sm uppercase tracking-wider text-neon-cyan mb-4">
                Powiązane artykuły
              </h3>
              <div className="grid gap-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="p-3 border border-zinc-800/50 hover:border-neon-green/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group"
                  >
                    <p className="text-sm group-hover:text-neon-green transition-colors">
                      {relatedPost.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
