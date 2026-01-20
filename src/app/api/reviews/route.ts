import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/reviews - Пикирлерди алуу
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const productId = searchParams.get('product_id');
  const videoId = searchParams.get('video_id');
  const rating = searchParams.get('rating');
  const withImages = searchParams.get('with_images') === 'true';
  const sortBy = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('reviews')
    .select(`
      *,
      user:users(id, name, avatar),
      replies:review_replies(
        id,
        content,
        created_at,
        shop:shops(id, name, logo)
      )
    `, { count: 'exact' })
    .eq('is_visible', true);

  // Фильтрлөө
  if (productId) {
    query = query.eq('product_id', productId);
  } else if (videoId) {
    query = query.eq('video_id', videoId);
  }

  if (rating) {
    query = query.eq('rating', parseInt(rating));
  }

  if (withImages) {
    query = query.not('images', 'eq', '{}');
  }

  // Сорттоо
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest':
      query = query.order('rating', { ascending: true });
      break;
    case 'helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Пагинация
  query = query.range(offset, offset + limit - 1);

  const { data: reviews, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Рейтинг статистикасын алуу
  let stats = null;
  if (productId || videoId) {
    const targetField = productId ? 'product_id' : 'video_id';
    const targetId = productId || videoId;

    const { data: statsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq(targetField, targetId)
      .eq('is_visible', true);

    if (statsData) {
      const total = statsData.length;
      const distribution = [0, 0, 0, 0, 0]; // 1-5 жылдыздар
      let sum = 0;

      statsData.forEach(r => {
        distribution[r.rating - 1]++;
        sum += r.rating;
      });

      stats = {
        total,
        average: total > 0 ? (sum / total).toFixed(1) : '0',
        distribution: distribution.map((count, i) => ({
          rating: i + 1,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
      };
    }
  }

  return NextResponse.json({
    reviews,
    stats,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}

// POST /api/reviews - Жаңы пикир кошуу
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const {
    product_id,
    video_id,
    order_id,
    order_item_id,
    rating,
    content,
    images,
    selected_options,
    is_anonymous
  } = body;

  // Валидация
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Рейтинг 1-5 ортосунда болушу керек' }, { status: 400 });
  }

  if (!product_id && !video_id) {
    return NextResponse.json({ error: 'Товар же видео тандалышы керек' }, { status: 400 });
  }

  // Мурунтан пикир бар-жогун текшерүү
  const existingQuery = supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id);

  if (product_id) {
    existingQuery.eq('product_id', product_id);
  } else {
    existingQuery.eq('video_id', video_id);
  }

  const { data: existing } = await existingQuery.single();
  if (existing) {
    return NextResponse.json({ error: 'Сиз буга мурунтан пикир жазгансыз' }, { status: 400 });
  }

  // Сатып алууну текшерүү (товар үчүн)
  let isVerifiedPurchase = false;
  if (product_id && order_id) {
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', order_id)
      .eq('product_id', product_id)
      .single();

    isVerifiedPurchase = !!orderItem;
  }

  // Пикир түзүү
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id: product_id || null,
      video_id: video_id || null,
      order_id: order_id || null,
      order_item_id: order_item_id || null,
      rating,
      content: content || null,
      images: images || [],
      selected_options: selected_options || {},
      is_anonymous: is_anonymous || false,
      is_verified_purchase: isVerifiedPurchase
    })
    .select(`
      *,
      user:users(id, name, avatar)
    `)
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review }, { status: 201 });
}
