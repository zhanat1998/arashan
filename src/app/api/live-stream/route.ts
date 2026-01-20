import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/live-stream - List live streams
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status') || 'live';
  const limit = parseInt(searchParams.get('limit') || '20');

  const { data, error } = await supabase
    .from('live_streams')
    .select(`
      *,
      shop:shops(id, name, logo, is_verified, followers_count),
      host:users(id, full_name, avatar_url)
    `)
    .eq('status', status)
    .order(status === 'live' ? 'viewer_count' : 'scheduled_at', {
      ascending: status !== 'live'
    })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/live-stream - Create/Start live stream
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
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, thumbnailUrl, scheduledAt, products } = body;

  // Generate unique stream key
  const streamKey = `live_${user.id}_${Date.now()}`;

  const { data, error } = await supabase
    .from('live_streams')
    .insert({
      shop_id: shop.id,
      host_id: user.id,
      title,
      description,
      thumbnail_url: thumbnailUrl,
      stream_key: streamKey,
      scheduled_at: scheduledAt,
      products: products || [],
      status: scheduledAt ? 'scheduled' : 'live',
      started_at: scheduledAt ? null : new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...data,
    // RTMP URL for OBS/streaming software
    rtmpUrl: `rtmp://your-rtmp-server.com/live`,
    streamKey: streamKey
  }, { status: 201 });
}