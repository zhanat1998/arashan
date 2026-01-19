export interface Livestock {
  id: string;
  title: string;
  breed: string;
  price: number;
  originalPrice?: number;
  images: string[];
  videoUrl?: string;

  // Animal details
  age: string;
  weight: string;
  gender: 'male' | 'female';
  color: string;

  // Parent lineage / Ата-эне тектүүлүгү
  lineage?: {
    father?: {
      name: string;
      breed: string;
      photo?: string;
      achievements?: string;
    };
    mother?: {
      name: string;
      breed: string;
      photo?: string;
      achievements?: string;
    };
    pedigreeInfo?: string;
  };

  // Document photos / Документ сүрөттөрү
  documentPhotos?: string[];

  // Location & Seller
  location: string;
  region: string;
  seller: Seller;

  // Stats
  views: number;
  likes: number;
  rating: number;
  reviewCount: number;

  // Features
  badges: Badge[];
  isVerified?: boolean;
  hasDocuments?: boolean;
  hasDelivery?: boolean;
  isNegotiable?: boolean;
  isUrgent?: boolean;
  isPremium?: boolean;

  // Category
  categoryId: string;

  // Description
  description?: string;
  features?: string[];

  // Dates
  createdAt: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  salesCount: number;
  isVerified: boolean;
  location: string;
  memberSince: string;
}

export interface Badge {
  text: string;
  type: 'hot' | 'new' | 'sale' | 'premium' | 'verified' | 'top' | 'urgent';
}

export interface Video {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  livestockId: string;
  livestock: Livestock;
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
}

// Legacy alias for compatibility
export type Product = Livestock;