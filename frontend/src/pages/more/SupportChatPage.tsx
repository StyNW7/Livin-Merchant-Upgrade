import { useEffect, useRef, useState } from "react";
import { Headphones, SendHorizontal } from "lucide-react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { useSession } from "@/hooks/useApp";
import { DEFAULT_SUPPORT_REPLY, supportScript } from "@/data/support";
import { cn } from "@/utils/cn";

interface Message {
  id: number;
  from: "me" | "agent";
  text: string;
  time: string;
}

const QUICK = ["When will I get my settlement?", "How do I refund a sale?", "My printer is not working", "QRIS payment failed"];

const now = () => new Date().toTimeString().slice(0, 5);

/** Support chat with keyword-matched answers and a typing indicator. */
export default function SupportChatPage() {
  const { merchant } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "agent", text: `Hello ${merchant.ownerFirstName}, this is Nadia from Livin Merchant Support. How can I help ${merchant.name} today?`, time: now() },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (value: string) => {
    const body = value.trim();
    if (!body || typing) return;
    setMessages((m) => [...m, { id: idRef.current++, from: "me", text: body, time: now() }]);
    setText("");
    setTyping(true);
    const reply = supportScript.find((s) => s.match.test(body))?.reply ?? DEFAULT_SUPPORT_REPLY;
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idRef.current++, from: "agent", text: reply, time: now() }]);
    }, 1300);
  };

  return (
    <div className="flex min-h-full flex-col">
      <TopAppBar
        title="Support chat"
        subtitle="Nadia · Livin Merchant Support"
        backTo="/help"
        right={
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold">
            <Headphones className="h-5 w-5" />
          </span>
        }
      />
      <div className="flex-1 space-y-3 px-4 py-4">
        <p className="text-center text-[11px] text-ink-faint">Chats are recorded for quality. Never share your PIN or OTP with anyone, including Mandiri staff.</p>
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                m.from === "me" ? "rounded-br-md bg-navy text-white" : "rounded-bl-md border border-surface-line bg-white text-ink shadow-card",
              )}
            >
              {m.text}
              <span className={cn("mt-1 block text-right text-[10.5px]", m.from === "me" ? "text-white/60" : "text-ink-faint")}>{m.time}</span>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex">
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-surface-line bg-white px-4 py-3" aria-label="Support is typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-ink-faint" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 border-t border-surface-line bg-white/95 px-3 pb-3 pt-2 backdrop-blur">
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {QUICK.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="shrink-0 rounded-full border border-navy-100 px-3 py-1.5 text-[12px] font-semibold text-navy hover:bg-navy-50">
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message"
            aria-label="Message"
            className="h-11 flex-1 rounded-2xl border border-surface-line bg-surface px-4 text-[14px] focus:border-sky-400"
          />
          <button type="submit" disabled={!text.trim() || typing} aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-gold disabled:opacity-40">
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
