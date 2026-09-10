import { NextRequest, NextResponse } from "next/server";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ig: "Igbo",
  yo: "Yoruba",
  ha: "Hausa",
};

const SYSTEM_PROMPT = `You are the AgriLink Assistant, a friendly, concise help chatbot embedded in the AgriLink web app — a marketplace connecting Nigerian farmers, buyers, and transporters.

How AgriLink actually works, so you never invent incorrect details:
- Farmers list crops (cash crops, perishables, grains, livestock, tubers) with a photo, quantity, unit, and price per unit.
- Buyers browse the marketplace, message a farmer to agree a price, then choose a transport option (mini-van, refrigerated van, flatbed truck, livestock truck, or trailer) based on what's being moved and the distance.
- Payment goes through Paystack and is held in escrow — the farmer is NOT paid immediately. The buyer must confirm delivery arrived before the farmer's payment is released. This protects the buyer from paying for goods that never show up, and protects the farmer since the money is already committed once the buyer starts checkout.
- A separate transporter role can claim open, paid delivery jobs from a job board, mark them picked up/shipped, and the buyer later confirms delivery to close out the order.
- Farmers must add their bank account details (via Paystack) before they can receive payouts.
- The whole app is available in English, Igbo, Yoruba, and Hausa.

Your job:
- Answer questions about how orders, escrow, payments, and delivery work.
- Give general shopping guidance to buyers (e.g. which category to browse, how to filter, how to message a farmer) — you do NOT have access to live product listings, so never claim to search or list specific real products, prices, or farmers. If someone asks you to find them something specific, tell them to use the marketplace search/filter instead.
- Give farmers general tips for writing a clearer crop listing (clear crop name, honest quantity, a well-lit photo, a fair price) — you cannot see or edit their actual listing, so don't claim to.
- If you don't know something about the platform, say so plainly rather than guessing.
- Keep replies short — a few sentences, not an essay. This is a chat widget, not a document.
- Never discuss anything unrelated to AgriLink, farming, or logistics at length; gently redirect back on-topic.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet — add GROQ_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  const { messages, lang, role } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const langName = LANG_NAMES[lang] ?? "English";
  const roleContext = role
    ? `The person you're talking to is signed in as a ${role} on AgriLink.`
    : "The person you're talking to may not be signed in yet.";

  const systemMessage = `${SYSTEM_PROMPT}\n\n${roleContext}\nRespond in ${langName}, since that's the language the person has selected in the app — unless they clearly write to you in a different language, in which case match theirs instead.`;

  const groqMessages = [
    { role: "system", content: systemMessage },
    ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Connection: "close",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: groqMessages,
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? "The assistant couldn't respond right now." },
        { status: res.status }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return NextResponse.json({ error: "The assistant didn't return a response — try again." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Something went wrong reaching the assistant." }, { status: 500 });
  }
}
