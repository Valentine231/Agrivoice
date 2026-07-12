"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { Conversation, fetchConversations } from "@/lib/messages";
import ChatBox from "@/components/ChatBox";

export default function FarmerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setSignedIn(false);
          return;
        }

        setCurrentUserId(session.user.id);
        const convos = await fetchConversations(session.user.id);
        setConversations(convos);
      } catch (err) {
        console.error("Messages load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-4xl px-5 py-24 text-center font-body text-ink/50">Loading messages...</div>
      </main>
    );
  }

  if (!signedIn || !currentUserId) {
    return (
      <main className="min-h-screen bg-parchment">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mb-6 text-5xl">🔑</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Log in to view messages</h1>
          <a
            href="/login?next=/farmer/messages"
            className="tap-target mt-8 inline-flex items-center justify-center rounded-full bg-forest px-8 py-3.5 font-body font-semibold text-parchment shadow-soft hover:bg-forest-dark"
          >
            Log in
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <Navbar />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink mb-8">My Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            {conversations.length === 0 ? (
              <p className="rounded-xl border border-dashed border-forest/20 bg-white/60 p-6 text-center font-body text-sm text-ink/50">
                You have no active conversations.
              </p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.otherUser.id}
                  onClick={() => setActiveChat({ id: c.otherUser.id, name: c.otherUser.full_name })}
                  className={`w-full text-left flex items-center p-4 rounded-xl border transition ${
                    activeChat?.id === c.otherUser.id
                      ? "border-forest bg-forest/5"
                      : "border-forest/10 bg-white hover:border-forest/30"
                  }`}
                >
                  <div className="h-12 w-12 flex-shrink-0 rounded-full bg-forest/10 flex items-center justify-center font-bold text-forest">
                    {c.otherUser.full_name.charAt(0)}
                  </div>
                  <div className="ml-4 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-ink truncate">{c.otherUser.full_name}</h3>
                      {c.unreadCount > 0 && (
                        <span className="bg-forest text-white text-xs px-2 py-0.5 rounded-full">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink/60 truncate mt-1">
                      {c.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            {activeChat ? (
              <ChatBox
                currentUserId={currentUserId}
                otherUserId={activeChat.id}
                otherUserName={activeChat.name}
              />
            ) : (
              <div className="hidden md:flex h-[500px] rounded-2xl border border-dashed border-forest/20 bg-white/40 items-center justify-center text-ink/40 font-body">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
