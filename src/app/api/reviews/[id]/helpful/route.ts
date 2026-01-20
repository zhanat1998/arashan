import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/reviews/[id]/helpful - Пикирге "пайдалуу" басуу
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

  // Мурунтан бар-жогун текшерүү
  const { data: existing } = await supabase
    .from('review_helpful')
    .select('id')
    .eq('review_id', id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Сиз буга мурунтан басканыз' }, { status: 400 });
  }

  const { error } = await supabase
    .from('review_helpful')
    .insert({
      review_id: id,
      user_id: user.id
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Ийгиликтүү' });
}

// DELETE /api/reviews/[id]/helpful - "Пайдалуу" алып салуу
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

  const { error } = await supabase
    .from('review_helpful')
    .delete()
    .eq('review_id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Алынып салынды' });
}
