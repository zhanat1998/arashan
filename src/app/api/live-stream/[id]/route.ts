import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/live-stream/[id] - Get stream details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('live_streams')
    .select(`
      *,
      shop:shops(*),
      host:users(id, full_name, avatar_url),
      stream_products:products(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Түз эфир табылган жок' }, { status: 404 });
  }

  // Increment viewer count if live
  if (data.status === 'live') {
    await supabase
      .from('live_streams')
      .update({
        viewer_count: data.viewer_count + 1,
        peak_viewers: Math.max(data.peak_viewers, data.viewer_count + 1)
      })
      .eq('id', id);
  }

  return NextResponse.json(data);
}

// PATCH /api/live-stream/[id] - Update stream (end, like, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const body = await request.json();
  const { action } = body;

  if (action === 'like') {
    // Anyone can like
    await supabase
      .from('live_streams')
      .update({
        likes_count: supabase.rpc('increment', { x: 1 })
      })
      .eq('id', id);

    const { data } = await supabase
      .from('live_streams')
      .select('likes_count')
      .eq('id', id)
      .single();

    await supabase
      .from('live_streams')
      .update({ likes_count: (data?.likes_count || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ success: true });
  }

  if (action === 'end') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: stream } = await supabase
      .from('live_streams')
      .select('host_id')
      .eq('id', id)
      .single();

    if (stream?.host_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('live_streams')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  if (action === 'leave') {
    // Decrement viewer count
    const { data } = await supabase
      .from('live_streams')
      .select('viewer_count')
      .eq('id', id)
      .single();

    await supabase
      .from('live_streams')
      .update({ viewer_count: Math.max(0, (data?.viewer_count || 1) - 1) })
      .eq('id', id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}