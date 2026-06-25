export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'classic' | 'signature' | 'brewed' | 'desserts';
  strength: number; // 1-5
  milkRatio?: string; // e.g., "70% Milk, 30% Espresso"
  volume: string; // e.g., "340 ml"
  tags: string[];
  color: string; // hex color or tailwind name representing liquid
}

export interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  process: string;
  roastLevel: 'light' | 'medium' | 'dark';
  notes: string[];
  price: number;
  weight: string;
  altitude: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  date: string;
  avatarColor: string;
  skew: number; // For polaroid rotatation offset
  deviceId?: string;
}

export interface CartItem {
  id: string;
  type: 'menu' | 'custom' | 'beans';
  name: string;
  price: number;
  quantity: number;
  details: string;
  category?: string;
}

