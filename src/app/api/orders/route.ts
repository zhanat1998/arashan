import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/orders - List user's orders
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');

  let query = supabase
    .from('orders')
    .select(`
      *,
      shop:shops(id, name, logo),
      items:order_items(
        *,
        product:products(id, title, images, price)
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { items, shippingAddress, couponCode, groupBuyId } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Себет бош' }, { status: 400 });
  }

  if (!shippingAddress) {
    return NextResponse.json({ error: 'Жеткирүү дареги керек' }, { status: 400 });
  }

  // Calculate totals and verify products
  let totalAmount = 0;
  let discountAmount = 0;
  const orderItems: {
    product_id: string;
    quantity: number;
    price: number;
    selected_color?: string;
    selected_size?: string;
  }[] = [];

  // Group items by shop
  const shopItems: Record<string, typeof items> = {};

  for (const item of items) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, shop:shops(id)')
      .eq('id', item.productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json({
        error: `Продукт табылган жок: ${item.productId}`
      }, { status: 400 });
    }

    // Check stock
    if (product.stock < item.quantity) {
      return NextResponse.json({
        error: `"${product.title}" товары жетишсиз. Калды: ${product.stock}`,
        productId: product.id
      }, { status: 400 });
    }

    // Calculate price (check for group buy, flash sale)
    let itemPrice = product.price;

    if (groupBuyId && product.is_group_buy && product.group_buy_price) {
      itemPrice = product.group_buy_price;
    } else if (product.is_flash_sale && product.flash_sale_price) {
      itemPrice = product.flash_sale_price;
    }

    totalAmount += itemPrice * item.quantity;

    if (product.original_price) {
      discountAmount += (product.original_price - itemPrice) * item.quantity;
    }

    // Group by shop
    const shopId = product.shop.id;
    if (!shopItems[shopId]) {
      shopItems[shopId] = [];
    }
    shopItems[shopId].push({
      ...item,
      product,
      price: itemPrice
    });

    orderItems.push({
      product_id: item.productId,
      quantity: item.quantity,
      price: itemPrice,
      selected_color: item.color,
      selected_size: item.size
    });
  }

  // Apply coupon if provided
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (coupon && totalAmount >= coupon.min_purchase) {
      // Check if user has this coupon
      const { data: userCoupon } = await supabase
        .from('user_coupons')
        .select('*')
        .eq('user_id', user.id)
        .eq('coupon_id', coupon.id)
        .eq('is_used', false)
        .single();

      if (userCoupon) {
        let couponDiscount = 0;

        if (coupon.type === 'percentage') {
          couponDiscount = totalAmount * (coupon.value / 100);
          if (coupon.max_discount) {
            couponDiscount = Math.min(couponDiscount, coupon.max_discount);
          }
        } else {
          couponDiscount = coupon.value;
        }

        discountAmount += couponDiscount;
        totalAmount -= couponDiscount;

        // Mark coupon as used
        await supabase
          .from('user_coupons')
          .update({
            is_used: true,
            used_at: new Date().toISOString()
          })
          .eq('id', userCoupon.id);
      }
    }
  }

  // Calculate shipping
  const shippingFee = totalAmount >= 2000 ? 0 : 150; // Free shipping over 2000
  totalAmount += shippingFee;

  // Create order (one per shop)
  const orders = [];

  for (const [shopId, shopOrderItems] of Object.entries(shopItems)) {
    const shopTotal = (shopOrderItems as any[]).reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        shop_id: shopId,
        total_amount: shopTotal + (shippingFee / Object.keys(shopItems).length),
        discount_amount: discountAmount / Object.keys(shopItems).length,
        shipping_fee: shippingFee / Object.keys(shopItems).length,
        shipping_address: shippingAddress,
        group_buy_id: groupBuyId
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items
    const itemsToInsert = (shopOrderItems as any[]).map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      selected_color: item.color,
      selected_size: item.size
    }));

    await supabase.from('order_items').insert(itemsToInsert);

    orders.push(order);
  }

  return NextResponse.json({
    orders,
    totalAmount,
    discountAmount,
    shippingFee,
    message: 'Буйрутма түзүлдү! Төлөмгө өтүңүз.'
  }, { status: 201 });
}