import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({
      error: 'Email жана сырсөз керек'
    }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return NextResponse.json({
      error: 'Email же сырсөз туура эмес'
    }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  // Check if user has a shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name')
    .eq('owner_id', data.user.id)
    .single();

  return NextResponse.json({
    user: data.user,
    profile,
    shop,
    session: data.session
  });
}