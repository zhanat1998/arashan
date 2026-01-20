import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      shop:shops(*),
      category:categories(*),
      reviews:reviews(
        *,
        user:users(id, full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Increment views
  await supabase
    .from('products')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', id);

  return NextResponse.json(data);
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Verify ownership
  const { data: product } = await supabase
    .from('products')
    .select('shop:shops!inner(owner_id)')
    .eq('id', id)
    .single() as { data: { shop: { owner_id: string } } | null };

  if (!product || product.shop.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('products')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: product } = await supabase
    .from('products')
    .select('shop:shops!inner(owner_id, id)')
    .eq('id', id)
    .single() as { data: { shop: { owner_id: string; id: string } } | null };

  if (!product || product.shop.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}