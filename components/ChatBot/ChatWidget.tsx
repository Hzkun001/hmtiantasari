"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "bot"; content: string };

export default function FaqChatWidget() {
    const [open, setOpen] = useState(false);
    const [showWidget, setShowWidget] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Msg[]>([
        { role: "bot", content: "Halo! Tanyakan apa saja seputar HMTI." },
    ]);

    const panelRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
    }, [open, messages.length]);

    useEffect(() => {
        const heroSection = document.getElementById("section-00");

        if (!heroSection) {
            setShowWidget(true);
            return;
        }

        const syncWidgetVisibility = () => {
            const { top, bottom } = heroSection.getBoundingClientRect();
            const heroIsVisible = top < window.innerHeight && bottom > 0;
            setShowWidget(!heroIsVisible);

            if (heroIsVisible) {
                setOpen(false);
            }
        };

        syncWidgetVisibility();

        const observer = new IntersectionObserver(syncWidgetVisibility, {
            threshold: [0, 0.01, 0.1],
        });

        observer.observe(heroSection);
        window.addEventListener("scroll", syncWidgetVisibility, { passive: true });
        window.addEventListener("resize", syncWidgetVisibility);

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", syncWidgetVisibility);
            window.removeEventListener("resize", syncWidgetVisibility);
        };
    }, []);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        function onClickOutside(e: MouseEvent) {
            if (!open) return;
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                // klik di luar panel -> tutup
                setOpen(false);
            }
        }
        window.addEventListener("keydown", onKey);
        window.addEventListener("mousedown", onClickOutside);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("mousedown", onClickOutside);
        };
    }, [open]);

    async function send() {
        const text = input.trim();
        if (!text || loading) return;

        setMessages((m) => [...m, { role: "user", content: text }, { role: "bot", content: "" }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            if (!res.ok || !res.body) {
                const errText = await res.text().catch(() => "");
                throw new Error(errText || "Stream failed");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let acc = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                acc += decoder.decode(value, { stream: true });

                // update pesan bot terakhir (yang kosong tadi)
                setMessages((prev) => {
                    const copy = [...prev];
                    const last = copy[copy.length - 1];
                    if (last?.role === "bot") copy[copy.length - 1] = { role: "bot", content: acc };
                    return copy;
                });
            }

            // flush decoder
            acc += decoder.decode();
            setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "bot") copy[copy.length - 1] = { role: "bot", content: acc.trim() || "Maaf, tidak ada respons." };
                return copy;
            });
        } catch {
            setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last?.role === "bot") copy[copy.length - 1] = { role: "bot", content: "Koneksi bermasalah. Coba lagi." };
                return copy;
            });
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            {/* Panel */}
            {showWidget && open && (
                <div
                    ref={panelRef}
                    className="fixed bottom-24 right-6 z-9999 flex max-h-[calc(100dvh-7rem)] w-[92vw] max-w-95 flex-col overflow-hidden rounded-2xl border bg-white shadow-xl"
                    role="dialog"
                    aria-label="Chatbot FAQ HMTI"
                >
                    <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
                        <div className="font-semibold">FAQ HMTI</div>
                        <button
                            className="rounded-lg border px-2 py-1 text-sm"
                            onClick={() => setOpen(false)}
                            aria-label="Tutup chat"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                        <div className="space-y-2">
                            {messages.map((m, i) => (
                                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                                    <div
                                        className={[
                                            "inline-block max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-relaxed",
                                            m.role === "user" ? "bg-gray-50" : "bg-white",
                                        ].join(" ")}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="text-left">
                                    <div className="inline-block rounded-2xl border px-3 py-2 text-sm opacity-70">
                                        Mengetik...
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2 border-t bg-white p-3">
                        <input
                            ref={inputRef}
                            className="flex-1 rounded-xl border px-3 py-2 text-sm
                                        focus:outline-none
                                        focus:border-neutral-700"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tanya seputar HMTI..."
                            onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
                        />
                        <button
                            className="rounded-xl border px-4 py-2 text-sm"
                            onClick={send}
                            disabled={loading}
                        >
                            Kirim
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Circle Button */}
            {showWidget && (
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="fixed bottom-6 right-6 z-999 h-12 w-12 rounded-full border border-neutral-900 bg-neutral-50 shadow-lg flex items-center justify-center"
                    aria-label={open ? "Tutup chatbot" : "Buka chatbot"}
                    title={open ? "Tutup chatbot" : "Chat FAQ"}
                >
                    <img src="/images/yongkics.png" alt="" className="h-13 w-12" />
                </button>
            )}
        </>
    );
}
