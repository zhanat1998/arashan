import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/flash-sale/[id]/buy - Purchase flash sale item
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

  const { quantity = 1 } = await request.json();

  // Get flash sale with lock (prevent overselling)
  const { data: flashSale, error: fsError } = await supabase
    .from('flash_sales')
    .select(`
      *,
      product:products(*, shop:shops(*))
    `)
    .eq('id', id)
    .eq('is_active', true)
    .gt('ends_at', new Date().toISOString())
    .single();

  if (fsError || !flashSale) {
    return NextResponse.json({ error: 'Flash sale табылган жок' }, { status: 404 });
  }

  // Check stock
  if (flashSale.stock < quantity) {
    return NextResponse.json({
      error: 'Товар жетишсиз',
      remainingStock: flashSale.stock
    }, { status: 400 });
  }

  // Update flash sale stock
  const { error: updateError } = await supabase
    .from('flash_sales')
    .update({
      stock: flashSale.stock - quantity,
      sold_count: flashSale.sold_count + quantity
    })
    .eq('id', id)
    .eq('stock', flashSale.stock); // Optimistic lock

  if (updateError) {
    return NextResponse.json({ error: 'Кайра аракет кылыңыз' }, { status: 409 });
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      shop_id: flashSale.product.shop.id,
      total_amount: flashSale.sale_price * quantity,
      discount_amount: (flashSale.original_price - flashSale.sale_price) * quantity,
      shipping_address: {}, // Will be updated at checkout
      status: 'pending'
    })
    .select()
    .single();

  if (orderError) {
    // Rollback stock
    await supabase
      .from('flash_sales')
      .update({
        stock: flashSale.stock,
        sold_count: flashSale.sold_count
      })
      .eq('id', id);

    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Create order item
  await supabase
    .from('order_items')
    .insert({
      order_id: order.id,
      product_id: flashSale.product_id,
      quantity,
      price: flashSale.sale_price
    });

  return NextResponse.json({
    success: true,
    order,
    message: 'Flash sale товары сатып алынды!'
  });
}