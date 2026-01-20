import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/flash-sale - Get active flash sales
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get('limit') || '20');
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('flash_sales')
    .select(`
      *,
      product:products(
        *,
        shop:shops(id, name, logo, is_verified)
      )
    `)
    .eq('is_active', true)
    .lte('starts_at', now)
    .gt('ends_at', now)
    .gt('stock', 0)
    .order('ends_at', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate remaining time and percentage sold for each item
  const flashSales = data?.map(sale => ({
    ...sale,
    remainingTime: new Date(sale.ends_at).getTime() - Date.now(),
    percentSold: Math.round((sale.sold_count / (sale.stock + sale.sold_count)) * 100),
    remainingStock: sale.stock
  }));

  return NextResponse.json(flashSales);
}

// POST /api/flash-sale - Create flash sale (admin/seller)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { productId, salePrice, stock, startsAt, endsAt } = body;

  // Verify product ownership
  const { data: product } = await supabase
    .from('products')
    .select('*, shop:shops!inner(owner_id)')
    .eq('id', productId)
    .single();

  if (!product || product.shop.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Create flash sale
  const { data, error } = await supabase
    .from('flash_sales')
    .insert({
      product_id: productId,
      sale_price: salePrice,
      original_price: product.price,
      stock,
      starts_at: startsAt,
      ends_at: endsAt
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update product flash sale status
  await supabase
    .from('products')
    .update({
      is_flash_sale: true,
      flash_sale_price: salePrice,
      flash_sale_ends_at: endsAt
    })
    .eq('id', productId);

  return NextResponse.json(data, { status: 201 });
}