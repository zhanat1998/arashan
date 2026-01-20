import type { Product, Shop, Category, Badge } from '@/data/types';

interface ApiProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  images: string[];
  video_url?: string;
  brand?: string;
  stock: number;
  sold_count: number;
  colors?: string[];
  sizes?: string[];
  rating: number;
  review_count?: number;
  views: number;
  likes: number;
  is_group_buy: boolean;
  group_buy_price?: number;
  group_buy_min_people?: number;
  is_flash_sale: boolean;
  flash_sale_ends_at?: string;
  has_freeship?: boolean;
  category_id: string;
  description?: string;
  specifications?: { key: string; value: string }[];
  features?: string[];
  created_at: string;
  shop?: {
    id: string;
    name: string;
    logo?: string;
    rating: number;
    is_verified: boolean;
    sales_count: number;
    location?: string;
    followers_count?: number;
    products_count?: number;
    response_rate?: number;
    response_time?: string;
    is_official_store?: boolean;
    created_at?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
}

interface ApiCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  image?: string;
  count?: number;
}

export function transformProduct(apiProduct: ApiProduct): Product {
  const badges: Badge[] = [];

  if (apiProduct.is_flash_sale) {
    badges.push({ text: 'FLASH', type: 'flash' });
  }
  if (apiProduct.is_group_buy) {
    badges.push({ text: 'БИРГЕ', type: 'groupbuy' });
  }
  if (apiProduct.has_freeship) {
    badges.push({ text: 'Акысыз', type: 'freeship' });
  }
  if (apiProduct.sold_count > 1000) {
    badges.push({ text: 'TOP', type: 'hot' });
  }

  const shop: Shop = apiProduct.shop ? {
    id: apiProduct.shop.id,
    name: apiProduct.shop.name,
    logo: apiProduct.shop.logo || '/placeholder-shop.png',
    rating: apiProduct.shop.rating || 4.5,
    salesCount: apiProduct.shop.sales_count || 0,
    followersCount: apiProduct.shop.followers_count || 0,
    productsCount: apiProduct.shop.products_count || 0,
    isVerified: apiProduct.shop.is_verified || false,
    isOfficialStore: apiProduct.shop.is_official_store || false,
    responseRate: apiProduct.shop.response_rate || 95,
    responseTime: apiProduct.shop.response_time || '< 1 саат',
    location: apiProduct.shop.location || 'Кыргызстан',
    createdAt: apiProduct.shop.created_at || new Date().toISOString(),
  } : {
    id: 'unknown',
    name: 'Дүкөн',
    logo: '/placeholder-shop.png',
    rating: 4.5,
    salesCount: 0,
    followersCount: 0,
    productsCount: 0,
    isVerified: false,
    isOfficialStore: false,
    responseRate: 95,
    responseTime: '< 1 саат',
    location: 'Кыргызстан',
    createdAt: new Date().toISOString(),
  };

  return {
    id: apiProduct.id,
    title: apiProduct.title,
    price: apiProduct.price,
    originalPrice: apiProduct.original_price,
    images: apiProduct.images || [],
    videoUrl: apiProduct.video_url,
    brand: apiProduct.brand,
    stock: apiProduct.stock,
    soldCount: apiProduct.sold_count || 0,
    colors: apiProduct.colors,
    sizes: apiProduct.sizes,
    rating: apiProduct.rating || 4.5,
    reviewCount: apiProduct.review_count || 0,
    views: apiProduct.views || 0,
    likes: apiProduct.likes || 0,
    isGroupBuy: apiProduct.is_group_buy,
    groupBuyPrice: apiProduct.group_buy_price,
    groupBuyMinPeople: apiProduct.group_buy_min_people,
    hasFreeship: apiProduct.has_freeship,
    isFlashSale: apiProduct.is_flash_sale,
    flashSaleEndsAt: apiProduct.flash_sale_ends_at,
    categoryId: apiProduct.category_id,
    description: apiProduct.description,
    specifications: apiProduct.specifications,
    features: apiProduct.features,
    createdAt: apiProduct.created_at,
    shop,
    badges,
  };
}

export function transformCategory(apiCategory: ApiCategory): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    icon: apiCategory.icon || '📦',
    color: apiCategory.color || '#f97316',
    image: apiCategory.image,
    count: apiCategory.count,
  };
}

export function transformProducts(apiProducts: ApiProduct[]): Product[] {
  return apiProducts.map(transformProduct);
}

export function transformCategories(apiCategories: ApiCategory[]): Category[] {
  return apiCategories.map(transformCategory);
}