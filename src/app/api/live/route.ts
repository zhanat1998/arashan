import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/live - Бардык live жана scheduled стримдерди алуу
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status') || 'live'; // live, scheduled, ended, all
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('livestreams')
    .select(`
      id, title, description, thumbnail_url, status,
      scheduled_at, started_at, ended_at,
      viewer_count, peak_viewers, total_likes,
      shop:shops(id, name, logo, owner_id),
      host:users!host_id(id, full_name, avatar_url)
    `)
    .order('started_at', { ascending: false, nullsFirst: false });

  // Filter by status
  if (status === 'live') {
    query = query.eq('status', 'live');
  } else if (status === 'scheduled') {
    query = query.eq('status', 'scheduled').order('scheduled_at', { ascending: true });
  } else if (status === 'ended') {
    query = query.eq('status', 'ended');
  } else if (status !== 'all') {
    query = query.in('status', ['live', 'scheduled']);
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    livestreams: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (data?.length || 0) === limit,
    },
  });
}