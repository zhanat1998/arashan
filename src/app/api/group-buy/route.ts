import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/group-buy - List active group buys
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const productId = searchParams.get('productId');
  const status = searchParams.get('status') || 'active';
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('group_buys')
    .select(`
      *,
      product:products(*),
      initiator:users(id, full_name, avatar_url),
      participants:group_buy_participants(
        user:users(id, full_name, avatar_url)
      )
    `)
    .eq('status', status)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/group-buy - Start a new group buy
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { productId } = await request.json();

  // Get product info
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_group_buy', true)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'Продукт табылган жок' }, { status: 404 });
  }

  // Check if user already has active group buy for this product
  const { data: existing } = await supabase
    .from('group_buy_participants')
    .select('group_buy_id, group_buys!inner(id, product_id, status)')
    .eq('user_id', user.id)
    .eq('group_buys.product_id', productId)
    .eq('group_buys.status', 'active')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      error: 'Сиз мурунтан эле бул продуктка катышып жатасыз',
      groupBuyId: existing.group_buy_id
    }, { status: 400 });
  }

  // Create group buy (expires in 24 hours)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const { data: groupBuy, error: createError } = await supabase
    .from('group_buys')
    .insert({
      product_id: productId,
      initiator_id: user.id,
      required_people: product.group_buy_min_people || 2,
      group_price: product.group_buy_price || product.price,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Add initiator as first participant
  await supabase
    .from('group_buy_participants')
    .insert({
      group_buy_id: groupBuy.id,
      user_id: user.id
    });

  return NextResponse.json(groupBuy, { status: 201 });
}