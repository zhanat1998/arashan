import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/chat/[conversationId] - Get messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const limit = parseInt(searchParams.get('limit') || '50');
  const before = searchParams.get('before'); // For pagination

  // Verify user is part of conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single();

  if (!conversation) {
    // Check if user is shop owner
    const { data: shopConversation } = await supabase
      .from('conversations')
      .select('*, shop:shops!inner(owner_id)')
      .eq('id', conversationId)
      .single();

    if (!shopConversation || shopConversation.shop.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Get messages
  let query = supabase
    .from('chat_messages')
    .select(`
      *,
      sender:users!sender_id(id, full_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data: messages, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark messages as read
  await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  // Reset unread count
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId)
    .eq('user_id', user.id);

  return NextResponse.json({
    messages: messages?.reverse() || [],
    hasMore: messages?.length === limit
  });
}

// POST /api/chat/[conversationId] - Send message in conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const body = await request.json();
  const { message, messageType = 'text', metadata } = body;

  // Get conversation and verify access
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, shop:shops(owner_id)')
    .eq('id', conversationId)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: 'Чат табылган жок' }, { status: 404 });
  }

  // Determine sender and receiver
  const isShopOwner = conversation.shop.owner_id === user.id;
  const receiverId = isShopOwner ? conversation.user_id : conversation.shop.owner_id;

  if (!isShopOwner && conversation.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Create message
  const { data: chatMessage, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: receiverId,
      message,
      message_type: messageType,
      metadata
    })
    .select(`
      *,
      sender:users!sender_id(id, full_name, avatar_url)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update conversation
  await supabase
    .from('conversations')
    .update({
      last_message: message,
      last_message_at: new Date().toISOString(),
      unread_count: conversation.unread_count + 1
    })
    .eq('id', conversationId);

  return NextResponse.json(chatMessage, { status: 201 });
}