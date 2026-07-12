import { createClient } from "@/lib/supabase/client";
import { MessageRow } from "@/lib/database.types";

export type Conversation = {
  otherUser: {
    id: string;
    full_name: string;
  };
  lastMessage: MessageRow;
  unreadCount: number;
};

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  productId?: string
): Promise<MessageRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      product_id: productId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MessageRow;
}

export async function fetchMessages(userId: string, otherUserId: string): Promise<MessageRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as MessageRow[];
}

export async function markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("receiver_id", userId)
    .eq("sender_id", otherUserId)
    .eq("read", false);

  if (error) throw error;
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();
  
  // Fetch all messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*, sender:sender_id(id, full_name), receiver:receiver_id(id, full_name)")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!messages) return [];

  // Group by the other user
  const map = new Map<string, Conversation>();

  for (const msg of messages as any[]) {
    const isSender = msg.sender_id === userId;
    const otherUser = isSender ? msg.receiver : msg.sender;
    const otherUserId = otherUser.id;

    if (!map.has(otherUserId)) {
      map.set(otherUserId, {
        otherUser: { id: otherUserId, full_name: otherUser.full_name || "Unknown User" },
        lastMessage: msg,
        unreadCount: (!isSender && !msg.read) ? 1 : 0,
      });
    } else {
      if (!isSender && !msg.read) {
        map.get(otherUserId)!.unreadCount += 1;
      }
    }
  }

  return Array.from(map.values());
}
