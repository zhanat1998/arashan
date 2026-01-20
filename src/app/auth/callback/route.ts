import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Create profile if it doesn't exist
      if (!existingProfile) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
          coins: 100, // Welcome bonus
        });
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
