import { supabase } from './supabase';
import type { Product, Order, OrderInsert, RecentActivity, BlogPost, BlogPostInsert } from '../types';

export interface AffiliateStats {
  affiliate: {
    id: string;
    btc_payout_address: string;
    secret_token: string;
    created_at: string;
  };
  totalReferrals: number;
  completedReferrals: number;
  totalEarned: number;
  recentOrders: {
    product_name: string;
    price_pln: number;
    created_at: string;
  }[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createOrder(order: OrderInsert): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      product_id: order.product_id,
      email: order.email,
      phone_number: order.phone_number ?? null,
      paczkomat_code: order.paczkomat_code ?? null,
      payment_method: order.payment_method,
      psc_codes: order.psc_codes ?? null,
      encrypted_target_data: order.encrypted_target_data ?? null,
      config_data: order.config_data ?? null,
      referrer_id: order.referrer_id ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, products(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'completed'
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

export async function adminLogin(login: string, password: string): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Konfiguracja nie jest prawidłowa.');
  }

  const apiUrl = `${supabaseUrl}/functions/v1/admin-login`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ login, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Błąd logowania');
  }

  if (data.session) {
    await supabase.auth.setSession(data.session);
  }
}

export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function fetchRecentActivity(): Promise<RecentActivity[]> {
  const { data, error } = await supabase
    .from('recent_activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function createAffiliate(btcPayoutAddress: string): Promise<{ id: string; secret_token: string }> {
  const { data, error } = await supabase
    .from('affiliates')
    .insert({ btc_payout_address: btcPayoutAddress })
    .select('id, secret_token')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchAffiliateByToken(secretToken: string): Promise<AffiliateStats['affiliate'] | null> {
  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .eq('secret_token', secretToken)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchAffiliateStats(affiliateId: string): Promise<AffiliateStats | null> {
  const { data: affiliate, error: affError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .maybeSingle();

  if (affError || !affiliate) return null;

  const { data: referredOrders, error: ordersError } = await supabase
    .from('orders')
    .select('*, products(name, price_pln)')
    .eq('referrer_id', affiliateId)
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;

  const orders = referredOrders ?? [];
  const completed = orders.filter((o) => o.status === 'completed');

  return {
    affiliate,
    totalReferrals: orders.length,
    completedReferrals: completed.length,
    totalEarned: Math.floor(completed.length / 20) * 200,
    recentOrders: orders.slice(0, 5).map((o) => ({
      product_name: (o.products as { name: string; price_pln: number } | null)?.name ?? 'Produkt',
      price_pln: (o.products as { name: string; price_pln: number } | null)?.price_pln ?? 0,
      created_at: o.created_at,
    })),
  };
}

export async function fetchBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (publishedOnly) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createBlogPost(post: BlogPostInsert): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...post,
      published_at: post.published ? (post.published_at ?? new Date().toISOString()) : null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateBlogPost(id: string, post: Partial<BlogPostInsert>): Promise<BlogPost> {
  const updates: Partial<BlogPostInsert> & { published_at?: string | null } = { ...post };
  if (post.published === true && !post.published_at) {
    updates.published_at = new Date().toISOString();
  }
  if (post.published === false) {
    updates.published_at = null;
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
