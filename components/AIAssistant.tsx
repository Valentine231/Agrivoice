"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
          if (data?.role) setRole(data.role);
        }
      } catch {
        // silently ignore — role context is a nice-to-have, not required
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, lang, role }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((m) => [...m, { role: "assistant", content: data.error || t("assistantError") }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("assistantError") }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("closeAssistantLabel") : t("openAssistant")}
        className="tap-target fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-2xl text-parchment shadow-lg hover:bg-forest-dark sm:bottom-6 sm:right-6"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-2xl sm:bottom-28 sm:right-6">
          <div className="flex items-center gap-2 border-b border-forest/10 bg-forest px-4 py-3">
            <span className="text-lg" aria-hidden>
              🌾
            </span>
            <p className="font-display text-sm font-semibold text-parchment">{t("assistantTitle")}</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="rounded-xl bg-parchment-dim px-3 py-2 font-body text-sm text-ink/70">{t("assistantWelcome")}</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] rounded-xl px-3 py-2 font-body text-sm ${
                    m.role === "user" ? "bg-forest text-parchment" : "bg-parchment-dim text-ink/80"
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="rounded-xl bg-parchment-dim px-3 py-2 font-body text-sm text-ink/50">{t("assistantThinking")}</p>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-forest/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("assistantPlaceholder")}
              className="flex-1 rounded-xl border border-forest/20 px-3 py-2 font-body text-sm text-ink focus:border-forest focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-forest px-4 py-2 font-body text-sm font-semibold text-parchment hover:bg-forest-dark disabled:opacity-50"
            >
              {t("sendBtn")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
