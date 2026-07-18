import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, Loader2, Bot, Cpu } from "lucide-react";
import type { MLCEngineInterface, InitProgressReport } from "@mlc-ai/web-llm";
import { SYSTEM_PROMPT, SUGGESTED_PROMPTS } from "@/lib/aiContext";
import { profile } from "@/data/content";
import { cn } from "@/lib/utils";

/**
 * A small instruct model that balances answer quality against download size.
 * WebLLM caches it in the browser after the first load.
 */
const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const MODEL_SIZE_LABEL = "~0.9 GB, one-time · cached after";

type Status = "idle" | "loading" | "ready" | "unsupported" | "error";
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const webGpuSupported = () =>
  typeof navigator !== "undefined" && "gpu" in navigator;

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const engineRef = useRef<MLCEngineInterface | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-ai-assistant", onOpen);
    return () => window.removeEventListener("open-ai-assistant", onOpen);
  }, []);

  // Close on Escape from anywhere while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open && !webGpuSupported() && status === "idle") {
      setStatus("unsupported");
    }
  }, [open, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, generating]);

  const loadModel = useCallback(async () => {
    if (!webGpuSupported()) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const webllm = await import("@mlc-ai/web-llm");
      const engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report: InitProgressReport) => {
          setProgress(report.progress);
          setProgressText(report.text);
        },
      });
      engineRef.current = engine;
      setStatus("ready");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load the model.",
      );
      setStatus("error");
    }
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const engine = engineRef.current;
      const text = question.trim();
      if (!engine || !text || generating) return;

      const history = [...messages, { role: "user" as const, content: text }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setGenerating(true);

      try {
        const stream = await engine.chat.completions.create({
          stream: true,
          temperature: 0.5,
          max_tokens: 512,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        });

        let acc = "";
        for await (const chunk of stream) {
          acc += chunk.choices[0]?.delta?.content ?? "";
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: acc };
            return next;
          });
        }
      } catch {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: `Sorry — something went wrong generating a reply. You can reach Maaz directly at ${profile.email}.`,
          };
          return next;
        });
      } finally {
        setGenerating(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [messages, generating],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        aria-label="Ask my portfolio — AI assistant"
        className="glass fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-ink-900/70 py-2.5 pl-3 pr-4 text-sm font-medium text-ink-100 shadow-lg shadow-accent-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent-500 to-cyan-400 text-white">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
        </span>
        Ask&nbsp;AI
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask my portfolio — AI assistant"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="glass fixed inset-x-3 bottom-3 z-[80] flex h-[70vh] max-h-[600px] flex-col overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:h-[560px] sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-cyan-400 text-white">
                  <Bot className="h-4 w-4" aria-hidden />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">
                    Ask my portfolio
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-accent-300">
                    Runs 100% in your browser
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {status === "unsupported" ? (
                <FallbackNotice />
              ) : status === "ready" ? (
                <Conversation messages={messages} generating={generating} />
              ) : (
                <LoadPanel
                  status={status}
                  progress={progress}
                  progressText={progressText}
                  error={error}
                  onLoad={loadModel}
                />
              )}
            </div>

            {/* Composer */}
            {status === "ready" && (
              <div className="border-t border-white/10 p-3">
                {messages.length === 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void ask(q)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-ink-300 transition-colors hover:border-accent-400/40 hover:text-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                <form onSubmit={onSubmit} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Maaz…"
                    aria-label="Ask a question"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent-400/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || generating}
                    aria-label="Send"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 text-white shadow-lg shadow-accent-500/25 transition-all hover:shadow-accent-500/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LoadPanel({
  status,
  progress,
  progressText,
  error,
  onLoad,
}: Readonly<{
  status: Status;
  progress: number;
  progressText: string;
  error: string;
  onLoad: () => void;
}>) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-500/20 to-cyan-400/10 text-accent-300 ring-1 ring-inset ring-white/10">
        <Cpu className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="font-display text-base font-semibold text-white">
          Chat with an AI about Maaz
        </p>
        <p className="mt-1 text-sm text-ink-400">
          A small language model runs entirely in your browser — private, no
          server. Loads once, then it&rsquo;s cached.
        </p>
      </div>

      {status === "loading" ? (
        <div className="w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-cyan-400 transition-[width] duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 line-clamp-2 font-mono text-[11px] text-ink-500">
            {progressText || "Preparing…"}
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onLoad}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5 hover:shadow-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Start chat
          </button>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            {MODEL_SIZE_LABEL}
          </p>
          {status === "error" && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </>
      )}
    </div>
  );
}

function FallbackNotice() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.03] text-ink-400 ring-1 ring-inset ring-white/10">
        <Bot className="h-6 w-6" aria-hidden />
      </span>
      <p className="font-display text-base font-semibold text-white">
        In-browser AI needs WebGPU
      </p>
      <p className="max-w-xs text-sm text-ink-400">
        This assistant runs a model locally via WebGPU, which your browser
        doesn&rsquo;t support yet. Try the latest Chrome or Edge — or reach Maaz
        directly at{" "}
        <a
          href={`mailto:${profile.email}`}
          className="text-accent-300 underline underline-offset-2 hover:text-accent-200"
        >
          {profile.email}
        </a>
        .
      </p>
    </div>
  );
}

function Conversation({
  messages,
  generating,
}: Readonly<{ messages: ChatMessage[]; generating: boolean }>) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-500/20 to-cyan-400/10 text-accent-300 ring-1 ring-inset ring-white/10">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm text-ink-300">
          Ready! Ask me anything about Maaz&rsquo;s work, projects, or skills.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m, i) => (
        <div
          key={i}
          className={cn(
            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            m.role === "user"
              ? "self-end bg-gradient-to-r from-accent-500 to-cyan-500 text-white"
              : "self-start border border-white/10 bg-white/[0.03] text-ink-200",
          )}
        >
          {m.content || (
            <span className="inline-flex items-center gap-1 text-ink-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              thinking…
            </span>
          )}
        </div>
      ))}
      {generating && messages[messages.length - 1]?.content !== "" && (
        <span className="self-start px-1 text-[11px] text-ink-500">
          generating…
        </span>
      )}
    </div>
  );
}
