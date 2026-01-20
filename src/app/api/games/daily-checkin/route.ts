import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/games/daily-checkin - Daily check-in
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Check if already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayCheckin } = await supabase
    .from('game_plays')
    .select('*')
    .eq('user_id', user.id)
    .eq('reward_type', 'daily_checkin')
    .gte('played_at', today.toISOString())
    .single();

  if (todayCheckin) {
    return NextResponse.json({
      error: 'Бүгүн кирдиңиз. Эртең келиңиз!',
      checkedIn: true,
      nextCheckinAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
    }, { status: 400 });
  }

  // Get streak (consecutive days)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: yesterdayCheckin } = await supabase
    .from('game_plays')
    .select('*')
    .eq('user_id', user.id)
    .eq('reward_type', 'daily_checkin')
    .gte('played_at', yesterday.toISOString())
    .lt('played_at', today.toISOString())
    .single();

  // Count streak
  let streak = 1;
  if (yesterdayCheckin) {
    // Get last 7 days of checkins
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weekCheckins } = await supabase
      .from('game_plays')
      .select('played_at')
      .eq('user_id', user.id)
      .eq('reward_type', 'daily_checkin')
      .gte('played_at', weekAgo.toISOString())
      .order('played_at', { ascending: false });

    if (weekCheckins) {
      streak = Math.min(weekCheckins.length + 1, 7);
    }
  }

  // Get daily checkin game for rewards
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('type', 'daily_checkin')
    .eq('is_active', true)
    .single();

  const rewards = (game?.rewards as { day: number; type: string; value: number }[]) || [];
  const todayReward = rewards.find(r => r.day === streak) || rewards[0];

  // Record check-in
  await supabase
    .from('game_plays')
    .insert({
      user_id: user.id,
      game_id: game?.id,
      reward_type: 'daily_checkin',
      reward_value: todayReward?.value || 5
    });

  // Give reward
  if (todayReward?.type === 'coins') {
    const { data: userData } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();

    await supabase
      .from('users')
      .update({ coins: (userData?.coins || 0) + todayReward.value })
      .eq('id', user.id);
  } else if (todayReward?.type === 'coupon') {
    // Create coupon
    const couponCode = `DAILY${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { data: coupon } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        type: 'percentage',
        value: todayReward.value,
        min_purchase: 1000,
        expires_at: expiresAt.toISOString(),
        usage_limit: 1
      })
      .select()
      .single();

    if (coupon) {
      await supabase
        .from('user_coupons')
        .insert({
          user_id: user.id,
          coupon_id: coupon.id
        });
    }
  }

  return NextResponse.json({
    success: true,
    streak,
    reward: todayReward,
    message: streak === 7
      ? 'Куттуктайбыз! 7 күн катары кирдиңиз!'
      : `${streak}-күн! ${todayReward?.value} ${todayReward?.type === 'coins' ? 'монета' : '% арзандатуу'} алдыңыз!`
  });
}

// GET /api/games/daily-checkin - Get check-in status
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Get week's check-ins
  const { data: checkins } = await supabase
    .from('game_plays')
    .select('played_at')
    .eq('user_id', user.id)
    .eq('reward_type', 'daily_checkin')
    .gte('played_at', weekAgo.toISOString())
    .order('played_at', { ascending: false });

  // Check if checked in today
  const checkedInToday = checkins?.some(c => {
    const checkinDate = new Date(c.played_at);
    return checkinDate >= today;
  });

  // Calculate streak
  let streak = 0;
  if (checkins) {
    const sortedDates = checkins
      .map(c => new Date(c.played_at))
      .sort((a, b) => b.getTime() - a.getTime());

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      const checkinDate = new Date(sortedDates[i]);
      checkinDate.setHours(0, 0, 0, 0);

      if (checkinDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
  }

  // Get game rewards
  const { data: game } = await supabase
    .from('games')
    .select('rewards')
    .eq('type', 'daily_checkin')
    .eq('is_active', true)
    .single();

  return NextResponse.json({
    checkedInToday,
    streak,
    rewards: game?.rewards || [],
    checkinDates: checkins?.map(c => c.played_at) || []
  });
}