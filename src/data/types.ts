export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  videoUrl?: string;
  videos?: string[];

  // Product details
  brand?: string;
  sku?: string;
  stock: number;
  soldCount: number;

  // Variations
  colors?: string[];
  sizes?: string[];

  // Shop info
  shop: Shop;

  // Stats
  views: number;
  likes: number;
  rating: number;
  reviewCount: number;

  // Features
  badges: Badge[];
  isGroupBuy?: boolean;
  groupBuyPrice?: number;
  groupBuyMinPeople?: number;
  hasFreeship?: boolean;
  isFlashSale?: boolean;
  flashSaleEndsAt?: string;

  // Category
  categoryId: string;

  // Description
  description?: string;
  specifications?: { key: string; value: string }[];
  features?: string[];

  // Dates
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  logo: string;
  rating: number;
  salesCount: number;
  followersCount: number;
  productsCount: number;
  isVerified: boolean;
  isOfficialStore?: boolean;
  responseRate: number;
  responseTime: string;
  location: string;
  createdAt: string;
}

export interface Badge {
  text: string;
  type: 'hot' | 'new' | 'sale' | 'premium' | 'verified' | 'top' | 'groupbuy' | 'freeship' | 'flash';
}

export interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  productId: string;
  product: Product;
  likes: number;
  comments: number;
  shares: number;
  duration: number;
  isLive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  image?: string;
  count?: number;
  subcategories?: Category[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface GroupBuy {
  id: string;
  product: Product;
  currentPeople: number;
  requiredPeople: number;
  endsAt: string;
  participants: { avatar: string; name: string }[];
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  images?: string[];
  likes: number;
  isVerifiedPurchase: boolean;
  selectedColor?: string;
  selectedSize?: string;
  createdAt: string;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  isShopOwner: boolean;
  createdAt: string;
}

// Legacy alias for compatibility
export type Livestock = Product;
export type Seller = Shop;