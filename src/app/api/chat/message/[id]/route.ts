import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// DELETE /api/chat/message/[id] - Билдирүүнү өчүрүү
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: messageId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  // Билдирүүнү текшерүү - өзүнүкү гана өчүрө алат
  const { data: message, error: msgError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('id', messageId)
    .eq('sender_id', user.id)
    .single();

  if (msgError || !message) {
    return NextResponse.json({ error: 'Билдирүү табылган жок же уруксат жок' }, { status: 404 });
  }

  // Өчүрүү
  const { error: deleteError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/chat/message/[id] - Билдирүүнү түзөтүү
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: messageId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Кирүү керек' }, { status: 401 });
  }

  const { message: newText } = await request.json();

  if (!newText?.trim()) {
    return NextResponse.json({ error: 'Билдирүү бош болбошу керек' }, { status: 400 });
  }

  // Билдирүүнү текшерүү - өзүнүкү гана түзөтө алат
  const { data: message, error: msgError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('id', messageId)
    .eq('sender_id', user.id)
    .single();

  if (msgError || !message) {
    return NextResponse.json({ error: 'Билдирүү табылган жок же уруксат жок' }, { status: 404 });
  }

  // Текст билдирүүлөрдү гана түзөтүүгө болот
  if (message.message_type !== 'text') {
    return NextResponse.json({ error: 'Бул билдирүүнү түзөтүүгө болбойт' }, { status: 400 });
  }

  // Түзөтүү
  const { data: updatedMessage, error: updateError } = await supabase
    .from('chat_messages')
    .update({
      message: newText.trim(),
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .select('*')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: updatedMessage });
}