import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/reviews/[id] - Бир пикирди алуу
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: review, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users(id, name, avatar),
      replies:review_replies(
        id,
        content,
        created_at,
        shop:shops(id, name, logo)
      )
    `)
    .eq('id', id)
    .eq('is_visible', true)
    .single();

  if (error || !review) {
    return NextResponse.json({ error: 'Пикир табылган жок' }, { status: 404 });
  }

  return NextResponse.json({ review });
}

// PUT /api/reviews/[id] - Пикирди жаңыртуу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Пикир ээсин текшерүү
  const { data: existing } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Уруксат жок' }, { status: 403 });
  }

  const body = await request.json();
  const { rating, content, images, is_anonymous } = body;

  const updateData: any = { updated_at: new Date().toISOString() };
  if (rating !== undefined) updateData.rating = rating;
  if (content !== undefined) updateData.content = content;
  if (images !== undefined) updateData.images = images;
  if (is_anonymous !== undefined) updateData.is_anonymous = is_anonymous;

  const { data: review, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      user:users(id, name, avatar)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review });
}

// DELETE /api/reviews/[id] - Пикирди өчүрүү
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Пикир ээсин текшерүү
  const { data: existing } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Уруксат жок' }, { status: 403 });
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Пикир өчүрүлдү' });
}
