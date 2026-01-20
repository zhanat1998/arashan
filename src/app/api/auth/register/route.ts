import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const body = await request.json();
  const { email, password, fullName, phone } = body;

  // Validate input
  if (!email || !password) {
    return NextResponse.json({
      error: 'Email жана сырсөз керек'
    }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({
      error: 'Сырсөз 6 символдон кем болбосун'
    }, { status: 400 });
  }

  // Register with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      }
    }
  });

  if (authError) {
    // Handle specific errors
    if (authError.message.includes('already registered')) {
      return NextResponse.json({
        error: 'Бул email мурунтан катталган'
      }, { status: 400 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // Create user profile in our users table
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        coins: 100 // Welcome bonus
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Give welcome coupon
    const { data: welcomeCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', 'WELCOME10')
      .single();

    if (welcomeCoupon) {
      await supabase
        .from('user_coupons')
        .insert({
          user_id: authData.user.id,
          coupon_id: welcomeCoupon.id
        });
    }
  }

  return NextResponse.json({
    user: authData.user,
    message: 'Катталуу ийгиликтүү! 100 монета жана WELCOME10 купону берилди!'
  }, { status: 201 });
}