import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      created_at,
      product:products(
        id,
        title,
        price,
        original_price,
        images,
        rating,
        sold_count,
        shop:shops(id, name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ wishlist: data });
}

// POST /api/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { product_id } = body;

  if (!product_id) {
    return NextResponse.json({ error: 'Product ID керек' }, { status: 400 });
  }

  // Check if product exists
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', product_id)
    .single();

  if (!product) {
    return NextResponse.json({ error: 'Товар табылган жок' }, { status: 404 });
  }

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Товар мурунтан эле сүйүктүүлөрдө' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      user_id: user.id,
      product_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/wishlist - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const product_id = searchParams.get('product_id');

  if (!product_id) {
    return NextResponse.json({ error: 'Product ID керек' }, { status: 400 });
  }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', product_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Сүйүктүүлөрдөн өчүрүлдү' });
}
