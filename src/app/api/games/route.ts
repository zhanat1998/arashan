import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/games - List available games
export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}