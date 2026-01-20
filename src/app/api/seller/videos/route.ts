import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/seller/videos - Get seller's videos
export async function GET(request: NextRequest) {
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

  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      product:products(id, title, images, price)
    `)
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Videos fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    videos: data || []
  });
}
