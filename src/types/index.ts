export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'grapheneos' | 'osint' | 'voip' | 'vpn' | 'sim';
  description: string;
  price_pln: number;
  old_price_pln: number | null;
  discount_percent: number | null;
  is_physical: boolean;
  requires_phone_number: boolean;
  psc_amounts: number[];
  psc_schemes: number[][];
  stock: number | null;
  sort_order: number;
  created_at: string;
}

export interface RecentActivity {
  id: string;
  product_name: string;
  city: string;
  created_at: string;
}

export interface VpnPreferences {
  location: string;
  protocol: string;
  pihole: boolean;
  pgpKey: string;
}

export interface VoipPreferences {
  region: string;
  purpose: string;
  deliveryMethod: string;
}

export interface Order {
  id: string;
  order_number: string;
  product_id: string;
  email: string;
  phone_number: string | null;
  paczkomat_code: string | null;
  payment_method: 'psc' | 'btc';
  psc_codes: string[] | null;
  encrypted_target_data: string | null;
  config_data: Record<string, unknown> | null;
  status: 'pending' | 'completed';
  created_at: string;
  products?: Product;
}

export interface OrderInsert {
  product_id: string;
  email: string;
  phone_number?: string;
  paczkomat_code?: string;
  payment_method: 'psc' | 'btc';
  psc_codes?: string[];
  encrypted_target_data?: string;
  config_data?: Record<string, unknown>;
  referrer_id?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  keywords: string[];
  read_time: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInsert {
  slug: string;
  title: string;
  description: string;
  content: string;
  author?: string;
  keywords?: string[];
  read_time?: number;
  published?: boolean;
  published_at?: string | null;
}
