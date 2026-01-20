import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/group-buy/[id]/join - Join a group buy
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

  // Get group buy
  const { data: groupBuy, error: gbError } = await supabase
    .from('group_buys')
    .select('*')
    .eq('id', id)
    .single();

  if (gbError || !groupBuy) {
    return NextResponse.json({ error: 'Бирге алуу табылган жок' }, { status: 404 });
  }

  // Check if group buy is still active
  if (groupBuy.status !== 'active') {
    return NextResponse.json({ error: 'Бул бирге алуу активдүү эмес' }, { status: 400 });
  }

  // Check if expired
  if (new Date(groupBuy.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Бирге алуу мөөнөтү бүттү' }, { status: 400 });
  }

  // Check if already joined
  const { data: existing } = await supabase
    .from('group_buy_participants')
    .select('id')
    .eq('group_buy_id', id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Сиз мурунтан эле катышып жатасыз' }, { status: 400 });
  }

  // Check if group is full
  if (groupBuy.current_people >= groupBuy.required_people) {
    return NextResponse.json({ error: 'Бирге алуу толуп калды' }, { status: 400 });
  }

  // Join group buy
  const { error: joinError } = await supabase
    .from('group_buy_participants')
    .insert({
      group_buy_id: id,
      user_id: user.id
    });

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  // Get updated group buy
  const { data: updated } = await supabase
    .from('group_buys')
    .select(`
      *,
      participants:group_buy_participants(
        user:users(id, full_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  return NextResponse.json({
    success: true,
    groupBuy: updated,
    message: updated?.status === 'completed'
      ? 'Бирге алуу аякталды! Төлөмгө өтүңүз.'
      : 'Кошулдуңуз!'
  });
}