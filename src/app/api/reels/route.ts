import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/reels - Fetch products with videos for the Reels feed
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  try {
    // Fetch products that have videos (videos array is not empty or video_url exists)
    const { data, error, count } = await supabase
      .from('products')
      .select(`
        *,
        shop:shops(id, name, logo, is_verified, location)
      `, { count: 'exact' })
      .or('videos.neq.{},video_url.neq.null')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Reels fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform products to Video format for VideoFeed component
    const reels = (data || []).flatMap((product: any) => {
      const videos = product.videos || [];
      const videoUrl = product.video_url;

      // Collect all video URLs
      const allVideoUrls: string[] = [...videos];
      if (videoUrl && !videos.includes(videoUrl)) {
        allVideoUrls.push(videoUrl);
      }

      if (allVideoUrls.length === 0) return [];

      // Create a reel entry for each video
      return allVideoUrls.map((url: string, index: number) => ({
        id: `${product.id}-video-${index}`,
        videoUrl: url,
        thumbnailUrl: product.images?.[0] || '',
        productId: product.id,
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.original_price || undefined,
          images: product.images || [],
          brand: product.brand || '',
          stock: product.stock || 0,
          soldCount: product.sold_count || 0,
          colors: product.colors || [],
          sizes: product.sizes || [],
          shop: product.shop ? {
            id: product.shop.id,
            name: product.shop.name,
            logo: product.shop.logo || '',
            rating: 4.5,
            salesCount: 0,
            followersCount: 0,
            productsCount: 0,
            isVerified: product.shop.is_verified || false,
            isOfficialStore: false,
            responseRate: 95,
            responseTime: '15 мин',
            location: product.shop.location || 'Бишкек',
            createdAt: ''
          } : {
            id: 'default',
            name: 'Дүкөн',
            logo: '',
            rating: 4.5,
            salesCount: 0,
            followersCount: 0,
            productsCount: 0,
            isVerified: false,
            isOfficialStore: false,
            responseRate: 95,
            responseTime: '15 мин',
            location: 'Бишкек',
            createdAt: ''
          },
          rating: product.rating || 4.5,
          reviewCount: product.review_count || 0,
          views: product.views || 0,
          likes: product.likes || 0,
          badges: [],
          isGroupBuy: product.is_group_buy || false,
          groupBuyPrice: product.group_buy_price || undefined,
          groupBuyMinPeople: product.group_buy_min_people || undefined,
          hasFreeship: product.has_freeship || false,
          isFlashSale: product.is_flash_sale || false,
          flashSaleEndsAt: product.flash_sale_ends_at || undefined,
          categoryId: product.category_id || '1',
          description: product.description || '',
          specifications: [],
          features: [],
          createdAt: product.created_at || ''
        },
        likes: Math.floor(Math.random() * 10000) + 500,
        comments: Math.floor(Math.random() * 1000) + 50,
        shares: Math.floor(Math.random() * 500) + 20,
        duration: Math.floor(Math.random() * 60) + 15,
        isLive: false,
      }));
    });

    return NextResponse.json({
      reels,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Reels API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Видеолорду жүктөөдө ката кетти' },
      { status: 500 }
    );
  }
}