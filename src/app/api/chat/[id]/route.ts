import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/chat/[id] - Сүйлөшүүнүн билдирүүлөрүн алуу
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Сүйлөшүү маалыматын алуу
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      shop:shops(id, name, logo, owner_id)
    `)
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ error: 'Сүйлөшүү табылган жок' }, { status: 404 });
  }

  // Колдонуучу бул сүйлөшүүгө катышкандыгын текшерүү
  if (conversation.user_id !== user.id && conversation.shop?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Уруксат жок' }, { status: 403 });
  }

  // Билдирүүлөрдү алуу
  const { data: messages, error: msgError } = await supabase
    .from('chat_messages')
    .select(`
      *,
      sender:users!sender_id(id, name, avatar)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Окулбаган билдирүүлөрдү окулду деп белгилөө
  const otherUserId = conversation.user_id === user.id
    ? conversation.shop?.owner_id
    : conversation.user_id;

  await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('sender_id', otherUserId)
    .eq('is_read', false);

  // Unread count'ду 0 кылуу
  if (conversation.user_id === user.id) {
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
  }

  return NextResponse.json({
    conversation,
    messages: messages || []
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
    .select(`
      *,
      sender:users!sender_id(id, name, avatar)
    `)
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
