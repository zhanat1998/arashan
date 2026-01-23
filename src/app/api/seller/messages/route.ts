import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/seller/messages - Сатуучунун бардык сүйлөшүүлөрү
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Сатуучунун дүкөнүн табуу
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 404 });
  }

  // Дүкөнгө келген сүйлөшүүлөрдү алуу
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      user:users!conversations_user_id_fkey(id, full_name, avatar_url, email)
    `)
    .eq('shop_id', shop.id)
    .order('last_message_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Ар бир сүйлөшүү үчүн сатуучуга келген окулбаган билдирүүлөрдү эсептөө
  const conversationsWithUnread = await Promise.all(
    (conversations || []).map(async (conv) => {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      return {
        ...conv,
        unread_count: count || 0
      };
    })
  );

  return NextResponse.json({
    conversations: conversationsWithUnread,
    shop_id: shop.id
  });
}