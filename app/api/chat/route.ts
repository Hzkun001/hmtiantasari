import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { FAQ } from "@/lib/faq";

export const runtime = "nodejs";

type FaqItem = { q: string; a: string };

function pickRelevantFaq(message: string, k = 6): FaqItem[] {
    const tokens = message
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
        .filter((w) => w.length >= 3);

    const scoreText = (text: string) => {
        const t = text.toLowerCase();
        let s = 0;
        for (const w of tokens) {
            if (t.includes(w)) s += 1;
        }
        return s;
    };

    // skor berdasarkan kemiripan keyword sederhana (cepat, no DB)
    const ranked = FAQ.map((item) => ({
        item,
        s: scoreText(item.q + " " + item.a),
    }))
        .sort((a, b) => b.s - a.s)
        .slice(0, k)
        .map((x) => x.item);

    // kalau semua skor 0 (pertanyaan jauh), tetap kirim beberapa FAQ inti (fallback)
    const allZero = ranked.length > 0 && ranked.every((it) => scoreText(it.q + " " + it.a) === 0);
    if (allZero) return FAQ.slice(0, Math.min(k, FAQ.length));

    return ranked;
}

function buildContext(items: FaqItem[]) {
    return items.map((x, i) => `#${i + 1}\nQ: ${x.q}\nA: ${x.a}`).join("\n\n");
}

export async function POST(req: Request) {
    const t0 = Date.now();
    try {
        const body = await req.json();
        const message = body?.message;
        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "message required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server belum dikonfigurasi. GEMINI_API_KEY belum tersedia." },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

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
        const t1 = Date.now();

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: system + "\n\n" + userPrompt }] }],
            // kalau SDK kamu support: bisa tambahkan opsi output lebih ringkas (tergantung versi)
        });

        const t2 = Date.now();

        const reply = (response.text ?? "").trim() || "Maaf, saya belum bisa menjawab saat ini.";

        // debug timing (hapus kalau tidak perlu)
        return NextResponse.json({
            reply,
            debug: {
                ms_total: t2 - t0,
                ms_gemini: t2 - t1,
                context_items: picked.length,
                context_chars: (system + "\n\n" + userPrompt).length,
            },
        });
    } catch (e: any) {
        return NextResponse.json(
            {
                error: "Gemini call failed",
                detail:
                    process.env.NODE_ENV === "development"
                        ? String(e?.message ?? e)
                        : "Terjadi kesalahan di server chatbot.",
            },
            { status: 502 }
        );
    }
}
