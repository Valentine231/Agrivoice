import { NextRequest, NextResponse } from "next/server";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ig: "Igbo",
  yo: "Yoruba",
  ha: "Hausa",
};

// ---------- WEATHER (new) ----------

type UserLocation = { lat: number; lng: number; name: string };

// Open-Meteo weather codes -> plain text the model can explain
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  80: "Light showers",
  81: "Showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

const WEATHER_TOOL = {
  type: "function",
  function: {
    name: "get_weather_forecast",
    description:
      "Get the real weather forecast (up to 7 days) for a place in Nigeria. Use for ANY question about rain, temperature, wind, or the weather affecting planting, harvesting, drying or transport. If the user doesn't name a place, call it without 'place' to use their saved location.",
    parameters: {
      type: "object",
      properties: {
        place: {
          type: "string",
          description: "Town or city name in Nigeria, e.g. 'Enugu' or 'Kano'. Omit to use the user's saved location.",
        },
        days: {
          type: "integer",
          description: "Number of days to forecast, 1 to 7. Default 3.",
        },
      },
    },
  },
} as const;

async function geocodeOne(name: string): Promise<UserLocation | null> {
  const params = new URLSearchParams({
    name,
    count: "5",
    language: "en",
    format: "json",
    countryCode: "NG",
  });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const results: any[] = data?.results ?? [];
  if (!results.length) return null;

  // Prefer the biggest place if several match
  const r = [...results].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
  return {
    lat: r.latitude,
    lng: r.longitude,
    name: [r.name, r.admin1].filter(Boolean).join(", "),
  };
}

async function geocode(place: string): Promise<UserLocation | null> {
  // "Enugu/Eke Obinagu" -> ["Enugu", "Eke Obinagu"]
  const candidates = place
    .split(/[\/,\-]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  // Try the full string first, then each part
  for (const c of [place.trim(), ...candidates]) {
    const hit = await geocodeOne(c);
    if (hit) return hit;
  }
  return null;
}

function rainLevel(mm: number, chance: number) {
  if (mm >= 20) return "heavy rain";
  if (mm >= 8) return "rain";
  if (mm >= 1 && chance >= 50) return "rain likely";
  if (mm >= 1 || chance >= 40) return "light rain possible";
  return "no rain";
}

function heatLevel(maxC: number) {
  if (maxC >= 33) return "very hot";
  if (maxC >= 30) return "hot";
  if (maxC >= 26) return "warm";
  return "cool";
}

function weatherIcon(code: number) {
  if (code >= 95) return "⛈️";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️";
  if (code === 45 || code === 48) return "🌫️";
  if (code === 3) return "☁️";
  if (code === 2) return "⛅";
  return "☀️";
}

function dayLabel(date: string, i: number) {
  if (i === 0) return "Today";
  if (i === 1) return "Tomorrow";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" });
}

async function runWeatherTool(
  args: { place?: string; days?: number },
  userLocation: UserLocation | null
) {
  let loc: UserLocation | null = null;

  if (args.place) {
    loc = await geocode(args.place);
    if (!loc) {
      return {
        error: `Couldn't find "${args.place}". Retry once with the nearest larger town or city (for example "Ado-Ekiti" for Ekiti, or "Enugu"), or ask the user which town they mean.`,
      };
    }
  } else {
    loc = userLocation;
  }

  if (!loc) {
    return {
      error: "No location available. Ask the user which town or city they want the forecast for.",
    };
  }

  const days = Math.min(Math.max(Math.round(args.days ?? 3), 1), 7);

  const params = new URLSearchParams({
    latitude: String(loc.lat),
    longitude: String(loc.lng),
    timezone: "Africa/Lagos",
    forecast_days: String(days),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 1800 }, // cache 30 min
  });
  if (!res.ok) {
    console.error("[weather] forecast HTTP", res.status, await res.text());
    return { error: "The weather service is unavailable right now." };
  }

  const { daily } = await res.json();

  return {
    location: loc.name,
    ...(days > 3 && { note: "Days after the 3rd are less certain." }),
    forecast: daily.time.map((date: string, i: number) => ({
      day: dayLabel(date, i),
      icon: weatherIcon(daily.weather_code[i]),
      rain: rainLevel(daily.precipitation_sum[i], daily.precipitation_probability_max[i]),
      heat: heatLevel(daily.temperature_2m_max[i]),
      high_c: Math.round(daily.temperature_2m_max[i]),
      strong_wind: daily.wind_speed_10m_max[i] >= 35,
    })),
  };
}

// ---------- PROMPT ----------

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
- Answer weather questions using the get_weather_forecast tool (see weather rules below).
- If you don't know something about the platform, say so plainly rather than guessing.
- Keep replies short — a few sentences, not an essay. This is a chat widget, not a document.
- Never discuss anything unrelated to AgriLink, farming, weather, or logistics at length; gently redirect back on-topic.

Weather rules:
- For ANY weather question, you MUST call get_weather_forecast. Never answer weather from memory or guess.
- If the user names a town, always pass it in the "place" field as ONE name. If the tool returns an error, retry once with the nearest larger town; if that also fails, say the forecast isn't available right now and ask which town they mean.
- Many users have limited education. Use very simple, short words and short sentences.
- Do NOT use markdown: no asterisks, no bold, no tables, no bullet symbols, no headings.
- Format exactly like this, one short line per day, using the icon from the tool:

[Town] weather:

☁️ Today: Hot (31°C). No rain.
🌧️ Tomorrow: Warm (32°C). Light rain possible.
⛈️ Saturday: Warm (30°C). Heavy rain.

Tip: one short sentence of practical advice.

- Do NOT show percentages, millimetres, or wind speeds. Use only the words from the tool (no rain, light rain possible, rain likely, rain, heavy rain). If strong_wind is true, add "Strong wind."
- State which town the forecast is for. If it's a nearby larger town rather than the exact place the user named, say so.
- Translate those words, the day names and the tip into the user's language. Keep the icons and temperatures as they are.
- Give 3 days unless the user asks for more. Only mention that later days are less certain if you show more than 3 days, in one short sentence.
- The tip should be useful for their role (farmer: protect or delay harvest, spraying or drying if heavy rain is coming; buyer or transporter: expect road delays in heavy rain).`;





// ---------- ROUTE ----------

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_TOOL_ROUNDS = 3;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet — add GROQ_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  const { messages, lang, role, location } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  // Validate the optional saved location sent by the client
  const userLocation: UserLocation | null =
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number" &&
    Math.abs(location.lat) <= 90 &&
    Math.abs(location.lng) <= 180
      ? {
          lat: location.lat,
          lng: location.lng,
          name: typeof location.name === "string" ? location.name : "your location",
        }
      : null;

  const langName = LANG_NAMES[lang] ?? "English";
  const roleContext = role
    ? `The person you're talking to is signed in as a ${role} on AgriLink.`
    : "The person you're talking to may not be signed in yet.";
  const locationContext = userLocation
    ? `Their saved location is ${userLocation.name}; the weather tool uses it automatically when no place is named.`
    : "They have no saved location, so ask which town they mean for weather questions.";

  const systemMessage = `${SYSTEM_PROMPT}\n\n${roleContext}\n${locationContext}\nRespond in ${langName}, since that's the language the person has selected in the app — unless they clearly write to you in a different language, in which case match theirs instead.`;

  const convo: any[] = [
    { role: "system", content: systemMessage },
    ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
  ];

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Connection: "close",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: convo,
          tools: [WEATHER_TOOL],
          tool_choice: "auto",
          max_tokens: 800,
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

      const msg = data?.choices?.[0]?.message;
      if (!msg) {
        return NextResponse.json({ error: "The assistant didn't return a response — try again." }, { status: 502 });
      }

      // The model wants to call a tool: run it, feed the result back, loop again
      if (msg.tool_calls?.length && round < MAX_TOOL_ROUNDS) {
        convo.push({ role: "assistant", content: msg.content ?? null, tool_calls: msg.tool_calls });

        for (const call of msg.tool_calls) {
          let result: unknown;
          try {
            if (call.function?.name === "get_weather_forecast") {
              const args = JSON.parse(call.function.arguments || "{}");
              result = await runWeatherTool(args, userLocation);
            } else {
              result = { error: "Unknown tool." };
            }
          } catch {
            result = { error: "The weather lookup failed. Please try again." };
          }
          convo.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
        }
        continue;
      }

      // Normal text answer: done
      if (!msg.content) {
        return NextResponse.json({ error: "The assistant didn't return a response — try again." }, { status: 502 });
      }
      return NextResponse.json({ reply: msg.content });
    }

    return NextResponse.json({ error: "The assistant took too long. Please try again." }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Something went wrong reaching the assistant." }, { status: 500 });
  }
}