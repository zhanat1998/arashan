import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface Reward {
  type: string;
  value: number;
  probability: number;
  label: string;
}

// POST /api/games/spin-wheel - Play spin wheel game
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Check if user already played today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayPlays } = await supabase
    .from('game_plays')
    .select('id')
    .eq('user_id', user.id)
    .gte('played_at', today.toISOString())
    .limit(3); // Max 3 plays per day

  if (todayPlays && todayPlays.length >= 3) {
    return NextResponse.json({
      error: 'Бүгүн 3 жолу ойнодуңуз. Эртең келиңиз!',
      nextPlayAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
    }, { status: 429 });
  }

  // Get spin wheel game
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('type', 'spin_wheel')
    .eq('is_active', true)
    .single();

  if (!game) {
    return NextResponse.json({ error: 'Оюн табылган жок' }, { status: 404 });
  }

  // Calculate reward based on probability
  const rewards = game.rewards as Reward[];
  const random = Math.random();
  let cumulativeProbability = 0;
  let selectedReward: Reward | null = null;

  for (const reward of rewards) {
    cumulativeProbability += reward.probability;
    if (random <= cumulativeProbability) {
      selectedReward = reward;
      break;
    }
  }

  if (!selectedReward) {
    selectedReward = rewards[rewards.length - 1]; // Fallback to last reward
  }

  // Record game play
  await supabase
    .from('game_plays')
    .insert({
      user_id: user.id,
      game_id: game.id,
      reward_type: selectedReward.type,
      reward_value: selectedReward.value
    });

  // Apply reward
  if (selectedReward.type === 'coins') {
    await supabase
      .from('users')
      .update({
        coins: supabase.rpc('increment_coins', {
          user_id: user.id,
          amount: selectedReward.value
        })
      })
      .eq('id', user.id);

    // Simple increment
    const { data: userData } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();

    await supabase
      .from('users')
      .update({ coins: (userData?.coins || 0) + selectedReward.value })
      .eq('id', user.id);
  } else if (selectedReward.type === 'coupon') {
    // Create a coupon for the user
    const couponCode = `SPIN${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const { data: coupon } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        type: 'percentage',
        value: selectedReward.value,
        min_purchase: 500,
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

  // Get remaining plays
  const remainingPlays = 3 - (todayPlays?.length || 0) - 1;

  return NextResponse.json({
    success: true,
    reward: selectedReward,
    remainingPlays,
    message: selectedReward.type === 'nothing'
      ? 'Ийгилик жок, кайра аракет кылыңыз!'
      : `Куттуктайбыз! ${selectedReward.label} утуп алдыңыз!`
  });
}