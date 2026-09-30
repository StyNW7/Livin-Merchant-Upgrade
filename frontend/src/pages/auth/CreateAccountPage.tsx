import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Building2, CheckCircle2, ChevronLeft, ExternalLink, IdCard, Loader2, Smartphone, Store } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useSession } from "@/hooks/useApp";
import { cn } from "@/utils/cn";

const STEPS = [
  { icon: Smartphone, title: "Install Livin' by Mandiri", text: "Download the app and register with your phone number." },
  { icon: IdCard, title: "Verify your identity", text: "Take a photo of your KTP and a quick selfie. It takes about 5 minutes." },
  { icon: Building2, title: "Open a business account", text: "Choose a Mandiri business savings account for your shop." },
  { icon: Store, title: "Activate Livin Merchant", text: "Log in here with the same credentials and set up your first outlet." },
];

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const { exploreAsGuest } = useSession();
  const [phase, setPhase] = useState<"info" | "redirect" | "done">("info");

  useEffect(() => {
    if (phase !== "redirect") return;
    const timer = window.setTimeout(() => setPhase("done"), 1800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-surface">
      <header className="flex items-center gap-2 px-3 pt-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-2xl text-navy-600 hover:bg-navy-50">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-[18px] font-bold text-ink">Create Mandiri Account</h1>
      </header>

      {phase === "info" && (
        <div className="flex flex-1 animate-screen-in flex-col px-5 pb-8 pt-3">
          <p className="text-[14px] leading-relaxed text-ink-muted">
            Livin Merchant works with a Mandiri account. Opening one is done fully online in Livin&apos; by Mandiri.
          </p>
          <ol className="relative mt-5 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card flex gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gold-700">Step {i + 1}</p>
                  <p className="text-[14.5px] font-bold text-ink">{s.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-2xl bg-gold-50 p-4 text-[12.5px] leading-relaxed text-ink-soft">
            <p className="font-bold text-ink">What you need</p>
            KTP (ID card), an active phone number and email. NIB is recommended for business features.
          </div>
          <div className="mt-auto space-y-2.5 pt-6">
            <Button block size="lg" rightIcon={<ExternalLink className="h-4 w-4" />} onClick={() => {
                window.open("https://www.bankmandiri.co.id", "_blank", "noopener,noreferrer");
                setPhase("redirect");
              }}>
              Continue to Livin&apos; by Mandiri
            </Button>
            <Button
              block
              variant="secondary"
              onClick={() => {
                exploreAsGuest();
                navigate("/home");
              }}
            >
              Explore Livin Merchant first
            </Button>
          </div>
        </div>
      )}

      {phase !== "info" && (
        <div className="flex flex-1 animate-screen-in flex-col items-center justify-center px-8 text-center">
          <div className={cn("flex h-20 w-20 items-center justify-center rounded-full", phase === "done" ? "bg-success-soft text-success-dark" : "bg-navy-50 text-navy-600")}>
            {phase === "done" ? <CheckCircle2 className="h-10 w-10" /> : <Loader2 className="h-10 w-10 animate-spin" />}
          </div>
          <h2 className="mt-6 text-[20px] font-extrabold text-ink">
            {phase === "done" ? "Continue in Livin' by Mandiri" : "Opening Livin' by Mandiri"}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            {phase === "done"
              ? "Finish opening your account in Livin' by Mandiri. Once it is active, come back and log in to start selling."
              : "Taking you to Livin' by Mandiri to open your account securely."}
          </p>
          {phase === "done" && (
            <div className="mt-8 w-full space-y-2.5">
              <Button block size="lg" leftIcon={<BadgeCheck className="h-4 w-4" />} onClick={() => navigate("/login")}>
                I have an account, log in
              </Button>
              <Button block variant="ghost" onClick={() => navigate("/welcome")}>
                Back to start
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
