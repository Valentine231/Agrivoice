"use client";

import { useEffect, useRef, useState } from "react";
import { MessageRow } from "@/lib/database.types";
import { fetchMessages, sendMessage, markMessagesAsRead } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

export default function ChatBox({
  currentUserId,
  otherUserId,
  otherUserName,
  productId,
}: {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  productId?: string;
}) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const msgs = await fetchMessages(currentUserId, otherUserId);
        setMessages(msgs);
        await markMessagesAsRead(currentUserId, otherUserId);
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
    load();

    const supabase = createClient();
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.receiver_id === currentUserId) {
              markMessagesAsRead(currentUserId, otherUserId);
            }
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      // Optimistic UI update can be done, but real-time will catch it too.
      await sendMessage(currentUserId, otherUserId, text.trim(), productId);
      setText("");
    } catch (e) {
      console.error("Failed to send", e);
    } finally {
      setSending(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  if (loading) {
    return <div className="p-4 text-center font-body text-ink/50">Loading chat...</div>;
  }

  return (
    <div className="flex h-[400px] flex-col rounded-2xl border border-forest/10 bg-white shadow-soft sm:h-[500px]">
      <div className="flex items-center border-b border-forest/10 bg-parchment-dim p-4">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-forest/20 flex items-center justify-center font-bold text-forest">
          {otherUserName.charAt(0)}
        </div>
        <h3 className="ml-3 font-display text-lg font-semibold text-ink">{otherUserName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center font-body text-sm text-ink/40 mt-10">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 font-body text-sm ${
                    isMe
                      ? "bg-forest text-white rounded-br-none"
                      : "bg-parchment text-ink border border-forest/10 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-forest/10 p-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-forest/20 px-4 py-2 font-body text-sm focus:border-forest focus:outline-none"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="rounded-xl bg-forest px-4 py-2 font-semibold text-white hover:bg-forest-dark disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
