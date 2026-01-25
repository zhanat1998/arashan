import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/profile - Get current user profile with stats
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    // Get orders count
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get favorites count
    const { count: favoritesCount } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get order status counts
    const { data: orderStatuses } = await supabase
      .from('orders')
      .select('status')
      .eq('user_id', user.id);

    const statusCounts = {
      pending: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
    };

    orderStatuses?.forEach(order => {
      if (order.status in statusCounts) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });

    // Calculate total spent (balance simulation)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const totalSpent = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // User data with defaults
    const userData = {
      id: user.id,
      email: user.email,
      phone: profile?.phone || user.phone || null,
      fullName: profile?.full_name || user.user_metadata?.full_name || 'Колдонуучу',
      avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      coins: profile?.coins || 0,
      couponsCount: profile?.coupons_count || 0,
      level: (profile?.coins || 0) >= 5000 ? 'VIP' : (profile?.coins || 0) >= 1000 ? 'Gold' : 'Standard',
      balance: 0, // Will be calculated or tracked separately
      createdAt: profile?.created_at || user.created_at,
    };

    return NextResponse.json({
      user: userData,
      stats: {
        ordersCount: ordersCount || 0,
        favoritesCount: favoritesCount || 0,
        totalSpent,
        statusCounts,
      }
    });
  } catch (error: any) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Профиль жүктөөдө ката кетти' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, phone, avatarUrl } = body;

    // Update profile
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone: phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error: any) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Профиль жаңылоодо ката кетти' },
      { status: 500 }
    );
  }
}