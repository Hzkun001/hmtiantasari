import OpenAI from "openai";
import { FAQ } from "@/lib/faq";

export const runtime = "nodejs";

type FaqItem = { q: string; a: string };

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

function tokenize(message: string) {
    return message
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
        .filter((w) => w.length >= 3);
}

function scoreText(tokens: string[], text: string) {
    const t = text.toLowerCase();
    let s = 0;

    for (const w of tokens) {
        if (t.includes(w)) s++;
    }

    return s;
}

function pickRelevantFaq(message: string, k = 6): FaqItem[] {
    const tokens = tokenize(message);

    const scored = FAQ.map((item) => ({
        item,
        s: scoreText(tokens, item.q + " " + item.a),
    })).sort((a, b) => b.s - a.s);

    const top = scored.slice(0, k);
    const allZero = top.length > 0 && top.every((x) => x.s === 0);

    if (allZero) return FAQ.slice(0, Math.min(k, FAQ.length));
    return top.map((x) => x.item);
}

function buildContext(items: FaqItem[]) {
    return items.map((x, i) => `#${i + 1}\nQ: ${x.q}\nA: ${x.a}`).join("\n\n");
}

export async function POST(req: Request) {
    if (!process.env.GROQ_API_KEY) {
        return new Response("Server belum dikonfigurasi. GROQ_API_KEY belum tersedia.", {
            status: 500,
        });
    }

    try {
        const body = await req.json();
        const message = body?.message;

        if (!message || typeof message !== "string") {
            return new Response("message required", { status: 400 });
        }

        const picked = pickRelevantFaq(message, 6);
        const context = buildContext(picked);

        const system = `
Kamu adalah chatbot FAQ HMTI.

ATURAN KERAS:
- Jawab hanya dari FAQ CONTEXT di bawah.
- Jika jawaban tidak ada di context, balas persis:
  "Info itu belum ada di FAQ HMTI. Silakan hubungi admin."
- Jangan menambah info di luar context.
- Bahasa Indonesia, ringkas (maks 5 kalimat).
`.trim();

        const userPrompt = `FAQ CONTEXT:\n${context}\n\nPertanyaan: ${message}`;

        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
                try {
                    const completion = await client.chat.completions.create({
                        model: MODEL,
                        stream: true,
                        temperature: 0.2,
                        messages: [
                            { role: "system", content: system },
                            { role: "user", content: userPrompt },
                        ],
                    });

                    for await (const chunk of completion) {
                        const text = chunk.choices?.[0]?.delta?.content ?? "";
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }

                    controller.close();
                } catch (error) {
                    console.error("GROQ STREAM ERROR:", error);
                    controller.enqueue(
                        encoder.encode("\n\n[Error: gagal menghasilkan jawaban]")
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("SERVER ERROR:", error);

        return new Response("Terjadi kesalahan pada server.", {
            status: 500,
        });
    }
}