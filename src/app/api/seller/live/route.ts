import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

// GET /api/seller/live - Сатуучунун стримдерин алуу
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

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

  const { data: livestreams, error } = await supabase
    .from('livestreams')
    .select(`
      id, title, description, thumbnail_url, status,
      scheduled_at, started_at, ended_at,
      viewer_count, peak_viewers, total_likes, total_comments,
      total_orders, total_revenue
    `)
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ livestreams: livestreams || [] });
}

// POST /api/seller/live - Жаңы стрим түзүү
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

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
  const { title, description, thumbnail_url, scheduled_at, product_ids } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Аталышы керек' }, { status: 400 });
  }

  // Generate unique stream key
  const streamKey = nanoid(32);

  // Create livestream
  const { data: livestream, error } = await supabase
    .from('livestreams')
    .insert({
      shop_id: shop.id,
      host_id: user.id,
      title: title.trim(),
      description: description?.trim(),
      thumbnail_url,
      scheduled_at: scheduled_at || null,
      status: scheduled_at ? 'scheduled' : 'live',
      started_at: scheduled_at ? null : new Date().toISOString(),
      stream_key: streamKey,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add products if provided
  if (product_ids?.length > 0) {
    const productInserts = product_ids.map((productId: string, index: number) => ({
      livestream_id: livestream.id,
      product_id: productId,
      display_order: index,
    }));

    await supabase
      .from('livestream_products')
      .insert(productInserts);
  }

  return NextResponse.json({ livestream }, { status: 201 });
}

// PATCH /api/seller/live - Стрим статусун өзгөртүү
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { livestream_id, action, product_id } = body;

  // Verify ownership
  const { data: livestream } = await supabase
    .from('livestreams')
    .select('id, status, shop_id')
    .eq('id', livestream_id)
    .eq('host_id', user.id)
    .single();

  if (!livestream) {
    return NextResponse.json({ error: 'Стрим табылган жок' }, { status: 404 });
  }

  switch (action) {
    case 'start':
      // Start scheduled stream
      if (livestream.status !== 'scheduled') {
        return NextResponse.json({ error: 'Бул стрим баштоого мүмкүн эмес' }, { status: 400 });
      }
      await supabase
        .from('livestreams')
        .update({
          status: 'live',
          started_at: new Date().toISOString(),
        })
        .eq('id', livestream_id);
      break;

    case 'end':
      // End live stream
      if (livestream.status !== 'live') {
        return NextResponse.json({ error: 'Бул стрим активдүү эмес' }, { status: 400 });
      }
      await supabase
        .from('livestreams')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', livestream_id);

      // Mark all viewers as left
      await supabase
        .from('livestream_viewers')
        .update({ left_at: new Date().toISOString() })
        .eq('livestream_id', livestream_id)
        .is('left_at', null);
      break;

    case 'cancel':
      // Cancel scheduled stream
      if (livestream.status !== 'scheduled') {
        return NextResponse.json({ error: 'Бул стрим жокко чыгарууга мүмкүн эмес' }, { status: 400 });
      }
      await supabase
        .from('livestreams')
        .update({ status: 'cancelled' })
        .eq('id', livestream_id);
      break;

    case 'feature_product':
      // Feature a product
      if (!product_id) {
        return NextResponse.json({ error: 'Продукт ID керек' }, { status: 400 });
      }
      // Unfeature all products first
      await supabase
        .from('livestream_products')
        .update({ is_featured: false, featured_at: null })
        .eq('livestream_id', livestream_id);
      // Feature selected product
      await supabase
        .from('livestream_products')
        .update({
          is_featured: true,
          featured_at: new Date().toISOString(),
        })
        .eq('livestream_id', livestream_id)
        .eq('product_id', product_id);
      break;

    default:
      return NextResponse.json({ error: 'Белгисиз аракет' }, { status: 400 });
  }

  // Return updated livestream
  const { data: updated } = await supabase
    .from('livestreams')
    .select('*')
    .eq('id', livestream_id)
    .single();

  return NextResponse.json({ livestream: updated });
}