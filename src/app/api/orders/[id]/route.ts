import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      shop:shops(*),
      items:order_items(
        *,
        product:products(*)
      ),
      payment:payments(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Буйрутма табылган жок' }, { status: 404 });
  }

  // Verify user owns this order or is shop owner
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', data.shop_id)
    .single();

  if (data.user_id !== user.id && shop?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(data);
}

// PATCH /api/orders/[id] - Update order status
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
  const { status, notes } = body;

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, shop:shops(owner_id)')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Буйрутма табылган жок' }, { status: 404 });
  }

  // Validate status transitions
  const allowedTransitions: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'cancelled', 'refunded'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };

  // Check permissions
  const isShopOwner = order.shop.owner_id === user.id;
  const isOrderOwner = order.user_id === user.id;

  if (status === 'cancelled' && !isOrderOwner && !isShopOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (['shipped', 'refunded'].includes(status) && !isShopOwner) {
    return NextResponse.json({ error: 'Сатуучу гана өзгөртө алат' }, { status: 403 });
  }

  if (status === 'delivered' && !isOrderOwner) {
    return NextResponse.json({ error: 'Сатып алуучу гана ырастай алат' }, { status: 403 });
  }

  if (!allowedTransitions[order.status]?.includes(status)) {
    return NextResponse.json({
      error: `"${order.status}" статусунан "${status}" статусуна өтүү мүмкүн эмес`
    }, { status: 400 });
  }

  // Update order
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      notes: notes || order.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Handle refund
  if (status === 'refunded' && order.payment_id) {
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('id', order.payment_id);

    // Restore stock
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id);

    if (items) {
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock, sold_count')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({
              stock: product.stock + item.quantity,
              sold_count: Math.max(0, product.sold_count - item.quantity)
            })
            .eq('id', item.product_id);
        }
      }
    }
  }

  return NextResponse.json(data);
}