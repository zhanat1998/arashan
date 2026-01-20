import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/chat - List user's conversations
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      shop:shops(id, name, logo, is_verified, is_official_store)
    `)
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/chat - Start new conversation or send message
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { shopId, message, messageType = 'text', metadata } = body;

  // Get or create conversation
  let { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .eq('shop_id', shopId)
    .single();

  if (!conversation) {
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        shop_id: shopId
      })
      .select()
      .single();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    conversation = newConversation;
  }

  // Get shop owner for receiver_id
  const { data: shop } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single();

  if (!shop) {
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 404 });
  }

  // Create message
  const { data: chatMessage, error: msgError } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id: shop.owner_id,
      message,
      message_type: messageType,
      metadata
    })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Update conversation
  await supabase
    .from('conversations')
    .update({
      last_message: message,
      last_message_at: new Date().toISOString(),
      unread_count: conversation.unread_count + 1
    })
    .eq('id', conversation.id);

  return NextResponse.json({
    conversation,
    message: chatMessage
  }, { status: 201 });
}