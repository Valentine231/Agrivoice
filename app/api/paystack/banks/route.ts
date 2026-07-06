import { NextResponse } from "next/server";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;

export async function GET() {
  const res = await fetch("https://api.paystack.co/bank?country=nigeria&currency=NGN", {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    // Bank list barely changes — safe to cache for a day.
    next: { revalidate: 86400 },
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.message || "Could not load bank list" }, { status: 502 });
  }

  const banks = (data.data as any[]).map((b) => ({ name: b.name, code: b.code }));
  return NextResponse.json({ banks });
}
