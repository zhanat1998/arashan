import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/videos - List all videos
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('videos')
    .select(`
      *,
      shop:shops(id, name, logo),
      product:products(id, title, images, price)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    videos: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}

// POST /api/videos - Create a new video
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Get user's shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, video_url, thumbnail_url, product_id } = body;

  if (!video_url) {
    return NextResponse.json({ error: 'Видео URL керек' }, { status: 400 });
  }

  const videoData: any = {
    shop_id: shop.id,
    title: title || 'Видео',
    description: description || '',
    video_url,
    thumbnail_url: thumbnail_url || null,
    is_active: true,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
  };

  if (product_id) {
    // Verify product belongs to this shop
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .eq('shop_id', shop.id)
      .single();

    if (product) {
      videoData.product_id = product_id;
    }
  }

  const { data, error } = await supabase
    .from('videos')
    .insert(videoData)
    .select()
    .single();

  if (error) {
    console.error('Video creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
