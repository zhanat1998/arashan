import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const isGroupBuy = searchParams.get('groupBuy') === 'true';
  const isFlashSale = searchParams.get('flashSale') === 'true';

  const offset = (page - 1) * limit;

  let query = supabase
    .from('products')
    .select(`
      *,
      shop:shops(*),
      category:categories(*)
    `, { count: 'exact' })
    .eq('is_active', true);

  // Apply filters
  if (category && category !== 'all') {
    query = query.eq('category_id', category);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }

  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }

  if (isGroupBuy) {
    query = query.eq('is_group_buy', true);
  }

  if (isFlashSale) {
    query = query.eq('is_flash_sale', true)
      .gt('flash_sale_ends_at', new Date().toISOString());
  }

  // Apply sorting
  const validSorts = ['created_at', 'price', 'sold_count', 'rating', 'views'];
  const sortField = validSorts.includes(sort) ? sort : 'created_at';
  query = query.order(sortField, { ascending: order === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Verify shop ownership
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...body,
      shop_id: shop.id
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update shop products count
  await supabase.rpc('increment_shop_products', { shop_id: shop.id });

  return NextResponse.json(data, { status: 201 });
}