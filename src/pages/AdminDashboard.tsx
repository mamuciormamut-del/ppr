import { useState, useEffect, useCallback } from 'react';
import {
  LogOut, RefreshCw, Loader2, Check, Clock, Filter,
  PenSquare, Trash2, Eye, EyeOff, Plus, ChevronLeft, AlertCircle,
} from 'lucide-react';
import { fetchOrders, updateOrderStatus, adminLogout, fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Order, BlogPost, BlogPostInsert } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

type StatusFilter = 'all' | 'pending' | 'completed';
type ActiveTab = 'orders' | 'blog';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');

  const handleLogout = async () => {
    await adminLogout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/90 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-bold text-zinc-100">
              prywaciarz<span className="text-neon-green">.admin</span>
            </span>
            <nav className="flex items-center gap-1">
              {(['orders', 'blog'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                    activeTab === tab
                      ? 'border-neon-green bg-neon-green/10 text-neon-green'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'orders' ? 'Zamówienia' : 'Blog'}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {activeTab === 'orders' ? <OrdersTab /> : <BlogTab />}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const handleToggleStatus = async (order: Order) => {
    const newStatus = order.status === 'pending' ? 'completed' : 'pending';
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-zinc-500" />
        {(['all', 'pending', 'completed'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
              filter === f
                ? 'border-neon-green bg-neon-green/10 text-neon-green'
                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {f === 'all' ? 'Wszystkie' : f === 'pending' ? 'Oczekujące' : 'Zrealizowane'}
          </button>
        ))}
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 bg-neon-green/10 border border-neon-green/30 font-mono text-[10px] text-neon-green">
            {pendingCount} oczekujących
          </span>
        )}
        <button onClick={loadOrders} className="ml-auto p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
        <span className="font-mono text-[10px] text-zinc-600">
          {filtered.length} zamówień
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 text-neon-green animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-sm text-zinc-500">Brak zamówień</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Nr zamówienia', 'Produkt', 'Email', 'Telefon', 'Paczkomat', 'Płatność', 'Kody PSC', 'Status', 'Data'].map((h) => (
                  <th key={h} className="py-3 px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  updating={updatingId === order.id}
                  onToggle={() => handleToggleStatus(order)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, updating, onToggle }: { order: Order; updating: boolean; onToggle: () => void }) {
  const productName = order.products?.name || '---';
  const date = new Date(order.created_at).toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
      <td className="py-3 px-3 font-mono text-xs text-neon-green">{order.order_number}</td>
      <td className="py-3 px-3 text-xs text-zinc-300">{productName}</td>
      <td className="py-3 px-3 font-mono text-xs text-zinc-400">{order.email}</td>
      <td className="py-3 px-3 font-mono text-xs text-zinc-400">{order.phone_number || '---'}</td>
      <td className="py-3 px-3 font-mono text-xs text-zinc-400">{order.paczkomat_code || '---'}</td>
      <td className="py-3 px-3">
        <span className={`font-mono text-[10px] uppercase tracking-wider ${
          order.payment_method === 'btc' ? 'text-amber-400' : 'text-blue-400'
        }`}>
          {order.payment_method === 'btc' ? 'BTC' : 'PSC'}
        </span>
      </td>
      <td className="py-3 px-3 font-mono text-[10px] text-zinc-500 max-w-[140px] truncate">
        {order.psc_codes?.join(', ') || '---'}
      </td>
      <td className="py-3 px-3">
        <button
          onClick={onToggle}
          disabled={updating}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] uppercase tracking-wider transition-all ${
            order.status === 'completed'
              ? 'border-neon-green/30 bg-neon-green/10 text-neon-green'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:border-amber-500/50'
          }`}
        >
          {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : order.status === 'completed' ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {order.status === 'completed' ? 'Zrealizowane' : 'Oczekujące'}
        </button>
      </td>
      <td className="py-3 px-3 font-mono text-[10px] text-zinc-600 whitespace-nowrap">{date}</td>
    </tr>
  );
}

type BlogView = 'list' | 'edit' | 'create';

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<BlogView>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogPosts(false);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setView('edit');
  };

  const handleCreate = () => {
    setEditingPost(null);
    setView('create');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    try {
      await deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    try {
      const updated = await updateBlogPost(post.id, { published: !post.published });
      setPosts((prev) => prev.map((p) => p.id === post.id ? updated : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (data: BlogPostInsert) => {
    try {
      if (view === 'create') {
        const created = await createBlogPost(data);
        setPosts((prev) => [created, ...prev]);
      } else if (editingPost) {
        const updated = await updateBlogPost(editingPost.id, data);
        setPosts((prev) => prev.map((p) => p.id === editingPost.id ? updated : p));
      }
      setView('list');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  if (view === 'create' || view === 'edit') {
    return (
      <BlogPostForm
        post={editingPost}
        onSave={handleSave}
        onCancel={() => setView('list')}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-sm font-bold text-zinc-100">Wpisy na blogu</h2>
          <span className="font-mono text-[10px] text-zinc-600">{posts.length} wpisów</span>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 btn-neon-solid px-4 py-2 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Nowy wpis
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 text-neon-green animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-sm text-zinc-500">Brak wpisów. Utwórz pierwszy!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <BlogPostRow
              key={post.id}
              post={post}
              onEdit={() => handleEdit(post)}
              onDelete={() => handleDelete(post.id)}
              onTogglePublished={() => handleTogglePublished(post)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogPostRow({
  post, onEdit, onDelete, onTogglePublished,
}: {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublished: () => void;
}) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-mono text-[10px] px-1.5 py-0.5 border ${
            post.published
              ? 'border-neon-green/30 bg-neon-green/10 text-neon-green'
              : 'border-zinc-700 text-zinc-500'
          }`}>
            {post.published ? 'Opublikowany' : 'Szkic'}
          </span>
          <span className="font-mono text-[10px] text-zinc-600">{date}</span>
          <span className="font-mono text-[10px] text-zinc-600">{post.read_time} min</span>
        </div>
        <p className="text-sm text-zinc-200 font-medium truncate">{post.title}</p>
        <p className="font-mono text-[10px] text-zinc-500 truncate">/blog/{post.slug}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onTogglePublished}
          title={post.published ? 'Ukryj' : 'Opublikuj'}
          className="p-2 text-zinc-500 hover:text-neon-green transition-colors"
        >
          {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button onClick={onEdit} className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
          <PenSquare className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BlogPostForm({
  post,
  onSave,
  onCancel,
}: {
  post: BlogPost | null;
  onSave: (data: BlogPostInsert) => Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [description, setDescription] = useState(post?.description ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [author, setAuthor] = useState(post?.author ?? 'Zespół Prywaciarz');
  const [keywords, setKeywords] = useState((post?.keywords ?? []).join(', '));
  const [readTime, setReadTime] = useState(post?.read_time ?? 5);
  const [published, setPublished] = useState(post?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generateSlug = (t: string) => {
    return t
      .toLowerCase()
      .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
      .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (t: string) => {
    setTitle(t);
    if (!isEdit || !post?.slug) {
      setSlug(generateSlug(t));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('Tytuł, slug i treść są wymagane.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        content: content.trim(),
        author: author.trim() || 'Zespół Prywaciarz',
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        read_time: readTime,
        published,
      });
    } catch {
      setError('Błąd podczas zapisywania. Sprawdź, czy slug jest unikalny.');
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-neon-green transition-colors mb-6"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Powrót do listy
      </button>

      <h2 className="font-mono text-sm font-bold text-zinc-100 mb-6 uppercase tracking-widest">
        {isEdit ? 'Edytuj wpis' : 'Nowy wpis na blogu'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Tytuł *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Tytuł artykułu"
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Slug (URL) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tytul-artykulu"
              className="input-dark"
              required
            />
            <p className="mt-1 font-mono text-[10px] text-zinc-600">/blog/{slug || '...'}</p>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Czas czytania (min)</label>
            <input
              type="number"
              value={readTime}
              onChange={(e) => setReadTime(Number(e.target.value))}
              min={1}
              max={60}
              className="input-dark"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Opis (meta description)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Krótki opis dla wyszukiwarek (max 160 znaków)"
            maxLength={160}
            className="input-dark"
          />
          <p className="mt-1 font-mono text-[10px] text-zinc-600">{description.length}/160</p>
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Słowa kluczowe (oddzielone przecinkami)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="rejestracja kart sim, anonimowa karta SIM, prywatny VPN"
            className="input-dark"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Autor</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Zespół Prywaciarz"
            className="input-dark"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
            Treść (Markdown) *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="# Tytuł artykułu&#10;&#10;## Sekcja&#10;&#10;Treść artykułu..."
            className="input-dark font-mono text-xs resize-y leading-relaxed"
            required
          />
          <p className="mt-1 font-mono text-[10px] text-zinc-600">
            Obsługiwany Markdown: # nagłówki, **pogrubienie**, listy, tabele
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 border border-zinc-800 bg-zinc-900/30">
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className={`relative w-10 h-5 rounded-full transition-colors ${published ? 'bg-neon-green' : 'bg-zinc-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${published ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <div>
            <p className="font-mono text-xs text-zinc-200">{published ? 'Opublikowany' : 'Szkic'}</p>
            <p className="font-mono text-[10px] text-zinc-600">
              {published ? 'Wpis jest widoczny na stronie' : 'Wpis nie jest widoczny dla odwiedzających'}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 font-mono">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-neon-solid flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isEdit ? 'Zapisz zmiany' : 'Utwórz wpis'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-neon px-4 py-3 text-xs"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}
