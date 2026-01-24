import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/chat - ОПТИМАЛДАШТЫРЫЛГАН
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Керектүү талааларды гана алуу (азыраак data = тезирээк)
  const { data, error } = await supabase
    .from('conversations')
    .select('id, user_id, shop_id, last_message, last_message_at, unread_count, created_at, shop:shops(id, name, logo, owner_id)')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(50); // Максимум 50

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Колдонуучунун өз дүкөнүн чыгаруу (өзү менен сүйлөшө албайт)
  const filteredData = (data || []).filter(conv => {
    const shop = conv.shop as { owner_id?: string } | null;
    return shop?.owner_id !== user.id;
  });

  return NextResponse.json(filteredData);
}

// POST /api/chat - ОПТИМАЛДАШТЫРЫЛГАН
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Auth + body параллель
  const [authResult, body] = await Promise.all([
    supabase.auth.getUser(),
    request.json()
  ]);

  const { data: { user } } = authResult;
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { shopId, message, messageType = 'text', metadata } = body;

  // Conversation + Shop параллель издөө
  const [convResult, shopResult] = await Promise.all([
    supabase
      .from('conversations')
      .select('id, user_id, shop_id, unread_count, shop:shops(id, name, logo, owner_id)')
      .eq('user_id', user.id)
      .eq('shop_id', shopId)
      .single(),
    supabase
      .from('shops')
      .select('owner_id')
      .eq('id', shopId)
      .single()
  ]);

  if (!shopResult.data) {
    return NextResponse.json({ error: 'Дүкөн табылган жок' }, { status: 404 });
  }

  // Өз дүкөнүңө жаза албайсың
  if (shopResult.data.owner_id === user.id) {
    return NextResponse.json({ error: 'Өз дүкөнүңүзгө жаза албайсыз' }, { status: 400 });
  }

  let conversation = convResult.data;

  // Conversation жок болсо түзүү
  if (!conversation) {
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, shop_id: shopId })
      .select('id, user_id, shop_id, unread_count, shop:shops(id, name, logo, owner_id)')
      .single();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }
    conversation = newConv;
  }

  // Билдирүү бар болсо гана түзүү
  if (message?.trim()) {
    const { data: chatMessage, error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        receiver_id: shopResult.data.owner_id,
        message: message.trim(),
        message_type: messageType,
        metadata
      })
      .select('id, conversation_id, sender_id, receiver_id, message, message_type, metadata, is_read, created_at')
      .single();

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // NON-BLOCKING: conversation update
    supabase
      .from('conversations')
      .update({
        last_message: message.trim(),
        last_message_at: new Date().toISOString(),
        unread_count: (conversation.unread_count || 0) + 1
      })
      .eq('id', conversation.id)
      .then(() => {});

    return NextResponse.json({ conversation, message: chatMessage }, { status: 201 });
  }

  return NextResponse.json({ conversation, message: null }, { status: 201 });
}