import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/chat/[id] - ОПТИМАЛДАШТЫРЫЛГАН: параллель сурамдар
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = await createServerSupabaseClient();

  // 1. Auth текшерүү
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // 2. ПАРАЛЛЕЛЬ: conversation + messages + count бир убакта
  const [conversationResult, messagesResult, countResult] = await Promise.all([
    // Conversation
    supabase
      .from('conversations')
      .select('*, shop:shops(id, name, logo, owner_id)')
      .eq('id', conversationId)
      .single(),

    // Messages (limit+1 алып hasMore текшерүү - count сурамын жокко чыгарат)
    supabase
      .from('chat_messages')
      .select('id, conversation_id, sender_id, receiver_id, message, message_type, metadata, is_read, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit),

    // Count - биринчи жүктөө гана
    offset === 0
      ? supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversationId)
      : Promise.resolve({ count: null })
  ]);

  const { data: conversation, error: convError } = conversationResult;

  if (convError || !conversation) {
    return NextResponse.json({ error: 'Сүйлөшүү табылган жок' }, { status: 404 });
  }

  // Уруксат текшерүү
  if (conversation.user_id !== user.id && conversation.shop?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Уруксат жок' }, { status: 403 });
  }

  const { data: rawMessages, error: msgError } = messagesResult;
  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // hasMore: limit+1 алганбыз, эгер limit+1 бар болсо - дагы бар
  const hasMore = (rawMessages?.length || 0) > limit;
  const messages = (rawMessages || []).slice(0, limit).reverse();

  // 3. NON-BLOCKING: read status жаңыртуу (күтпөйбүз!)
  if (offset === 0) {
    const otherUserId = conversation.user_id === user.id
      ? conversation.shop?.owner_id
      : conversation.user_id;

    // Фонда иштейт - күтпөйбүз
    Promise.all([
      supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false),

      conversation.user_id === user.id
        ? supabase
            .from('conversations')
            .update({ unread_count: 0 })
            .eq('id', conversationId)
        : Promise.resolve()
    ]).catch(() => {}); // Ката болсо да көз жумуу
  }

  return NextResponse.json({
    conversation,
    messages,
    pagination: {
      total: countResult.count ?? messages.length,
      limit,
      offset,
      hasMore
    }
  });
}

// POST /api/chat/[id] - Билдирүү жөнөтүү
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { message, message_type = 'text', metadata } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Билдирүү бош болбошу керек' }, { status: 400 });
  }

  // Сүйлөшүүнү текшерүү
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      shop:shops(id, owner_id)
    `)
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ error: 'Сүйлөшүү табылган жок' }, { status: 404 });
  }

  // Колдонуучу катышуу укугун текшерүү
  const isCustomer = conversation.user_id === user.id;
  const isShopOwner = conversation.shop?.owner_id === user.id;

  if (!isCustomer && !isShopOwner) {
    return NextResponse.json({ error: 'Уруксат жок' }, { status: 403 });
  }

  // Алуучуну аныктоо
  const receiverId = isCustomer
    ? conversation.shop?.owner_id
    : conversation.user_id;

  // Билдирүү түзүү
  const { data: newMessage, error: msgError } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: message.trim(),
      message_type,
      metadata: metadata || {},
      is_read: false
    })
    .select('*')
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Сүйлөшүүнү жаңыртуу
  await supabase
    .from('conversations')
    .update({
      last_message: message.trim(),
      last_message_at: new Date().toISOString(),
      unread_count: isCustomer ? 0 : (conversation.unread_count || 0) + 1
    })
    .eq('id', conversationId);

  return NextResponse.json({ message: newMessage }, { status: 201 });
}
