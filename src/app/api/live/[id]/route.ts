import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/live/[id] - Конкреттүү стримди алуу
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  // Get current user (optional)
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch livestream with all related data in parallel
  const [livestreamResult, productsResult, messagesResult] = await Promise.all([
    // Livestream details
    supabase
      .from('livestreams')
      .select(`
        *,
        shop:shops(id, name, logo, description, owner_id),
        host:users!host_id(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single(),

    // Products
    supabase
      .from('livestream_products')
      .select(`
        *,
        product:products(id, name, price, images, stock_quantity)
      `)
      .eq('livestream_id', id)
      .order('display_order', { ascending: true }),

    // Recent messages (last 50)
    supabase
      .from('livestream_messages')
      .select(`
        id, message, message_type, metadata, is_pinned, created_at,
        user:users(id, full_name, avatar_url)
      `)
      .eq('livestream_id', id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (livestreamResult.error) {
    return NextResponse.json(
      { error: 'Стрим табылган жок' },
      { status: 404 }
    );
  }

  // Track viewer if user is logged in
  if (user && livestreamResult.data.status === 'live') {
    // Non-blocking viewer tracking
    supabase
      .from('livestream_viewers')
      .upsert({
        livestream_id: id,
        user_id: user.id,
        joined_at: new Date().toISOString(),
      }, { onConflict: 'livestream_id,user_id' })
      .then(() => {});
  }

  return NextResponse.json({
    livestream: livestreamResult.data,
    products: productsResult.data || [],
    messages: (messagesResult.data || []).reverse(), // Oldest first
  });
}

// POST /api/live/[id] - Лайк же комментарий жөнөтүү
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { type, message, emoji } = body;

  // Check if livestream is live
  const { data: livestream } = await supabase
    .from('livestreams')
    .select('status')
    .eq('id', id)
    .single();

  if (!livestream || livestream.status !== 'live') {
    return NextResponse.json(
      { error: 'Стрим активдүү эмес' },
      { status: 400 }
    );
  }

  if (type === 'message') {
    // Send chat message
    const { data: newMessage, error } = await supabase
      .from('livestream_messages')
      .insert({
        livestream_id: id,
        user_id: user.id,
        message: message?.trim().slice(0, 500),
        message_type: 'text',
      })
      .select(`
        id, message, message_type, created_at,
        user:users(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: newMessage });
  }

  if (type === 'like') {
    // Send like
    const { error } = await supabase
      .from('livestream_likes')
      .insert({
        livestream_id: id,
        user_id: user.id,
        emoji: emoji || '❤️',
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Белгисиз тип' }, { status: 400 });
}

// PATCH /api/live/[id] - Viewer leave tracking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === 'leave') {
    // Update viewer record
    await supabase
      .from('livestream_viewers')
      .update({
        left_at: new Date().toISOString(),
      })
      .eq('livestream_id', id)
      .eq('user_id', user.id)
      .is('left_at', null);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Белгисиз аракет' }, { status: 400 });
}