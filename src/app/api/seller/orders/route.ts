import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/seller/orders - Get seller's orders (or all orders for MVP)
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Get user's shop (optional for MVP)
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');

  const offset = (page - 1) * limit;

  let query = supabase
    .from('orders')
    .select(`
      *,
      user:users(id, full_name, phone, avatar_url),
      items:order_items(
        *,
        product:products(id, title, images)
      )
    `, { count: 'exact' });

  // If user has a shop, show shop orders; otherwise show all orders (MVP mode)
  if (shop) {
    query = query.eq('shop_id', shop.id);
  }
  // For MVP: if no shop, show all orders (admin-like view)

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}

// PUT /api/seller/orders - Update order status
export async function PUT(request: NextRequest) {
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
  const { orderId, status, trackingNumber } = body;

  if (!orderId || !status) {
    return NextResponse.json({ error: 'Order ID жана статус керек' }, { status: 400 });
  }

  // Verify order belongs to this shop
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('shop_id', shop.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Буйрутма табылган жок' }, { status: 404 });
  }

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Туура эмес статус' }, { status: 400 });
  }

  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString()
  };

  if (trackingNumber) {
    updates.tracking_number = trackingNumber;
  }

  if (status === 'shipped') {
    updates.shipped_at = new Date().toISOString();
  } else if (status === 'delivered') {
    updates.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
