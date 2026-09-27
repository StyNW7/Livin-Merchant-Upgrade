import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Fingerprint, Lock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/common/Button";
import { AppIcon } from "@/components/common/Brand";
import { BottomSheet } from "@/components/common/Overlay";
import { useSession } from "@/hooks/useApp";
import { cn } from "@/utils/cn";
import { readStorage } from "@/utils/storage";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAsMerchant, exploreAsGuest, setInsightConsent } = useSession();
  const [userId, setUserId] = useState("andi.pratama");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetId, setResetId] = useState("");
  const [resetSent, setResetSent] = useState(false);
  // Follows the Biometric login switch in Security Center.
  const [biometricEnabled] = useState(() => readStorage<boolean>("biometric", true));

  const submit = (biometric = false) => {
    if (!biometric && (userId.trim().length < 3 || password.length < 6)) {
      setError("Enter your Mandiri user ID and a password of at least 6 characters.");
      return;
    }
    if (!consent) {
      setError("Please agree to the data use terms to continue.");
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setInsightConsent(consent);
      loginAsMerchant();
      navigate("/home", { replace: true });
    }, 900);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-white">
      <div className="hero-navy relative px-5 pb-12 pt-3 text-white">
        <button
          type="button"
          onClick={() => navigate("/welcome")}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-2xl hover:bg-white/10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="mt-3 flex items-center gap-3 px-1">
          <AppIcon size={48} className="shadow-float" />
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight">Login with Mandiri</h1>
            <p className="text-[13px] text-white/70">Use your Livin&apos; by Mandiri credentials</p>
          </div>
        </div>
      </div>

      <form
        className="-mt-6 flex flex-1 flex-col rounded-t-[28px] bg-white px-5 pb-8 pt-7"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">User ID</span>
          <div className="flex h-12 items-center gap-2 rounded-2xl border border-surface-line px-3.5 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
            <User className="h-[18px] w-[18px] text-ink-faint" />
            <input value={userId} onChange={(e) => setUserId(e.target.value)} autoComplete="username" className="h-full flex-1 bg-transparent text-[15px]" />
          </div>
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Password</span>
          <div className="flex h-12 items-center gap-2 rounded-2xl border border-surface-line px-3.5 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
            <Lock className="h-[18px] w-[18px] text-ink-faint" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-full flex-1 bg-transparent text-[15px] placeholder:text-ink-faint"
            />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="p-1 text-ink-muted">
              {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </label>
        <button type="button" onClick={() => {
            setResetId(userId);
            setResetSent(false);
            setResetOpen(true);
          }} className="mt-2 self-end text-[12.5px] font-semibold text-sky-600">
          Forgot password?
        </button>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-surface p-3.5">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#003A70]" />
          <span className="text-[12.5px] leading-relaxed text-ink-soft">
            I agree that my Livin Merchant transaction data is used to provide business insights and Growth Score.{" "}
            <button type="button" onClick={() => setPrivacyOpen(true)} className="font-semibold text-sky-600">
              How we use data
            </button>
          </span>
        </label>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-[12.5px] font-medium text-danger-dark">
            {error}
          </p>
        )}

        <Button type="submit" block size="lg" loading={loading} className="mt-5">
          {loading ? "Verifying securely" : "Login"}
        </Button>
        {biometricEnabled && (
          <Button block size="lg" variant="secondary" className="mt-2.5" leftIcon={<Fingerprint className="h-5 w-5" />} onClick={() => submit(true)} disabled={loading}>
            Login with biometrics
          </Button>
        )}

        <div className={cn("mt-6 flex items-start gap-2.5 rounded-2xl border border-success/20 bg-success-soft/60 p-3.5")}>
          <ShieldCheck className="h-5 w-5 shrink-0 text-success-dark" />
          <p className="text-[12px] leading-relaxed text-ink-soft">
            Secure login. Your credentials are encrypted and never stored in this app. Mandiri will never ask for your PIN or OTP by phone or chat.
          </p>
        </div>

        <div className="mt-auto pt-6 text-center text-[13px] text-ink-muted">
          No Mandiri account yet?{" "}
          <button type="button" onClick={() => navigate("/create-account")} className="font-semibold text-sky-600">
            Create one
          </button>
          <span className="mx-2 text-ink-faint">·</span>
          <button
            type="button"
            onClick={() => {
              exploreAsGuest();
              navigate("/home");
            }}
            className="font-semibold text-sky-600"
          >
            Explore as Guest
          </button>
        </div>
      </form>

      <BottomSheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={resetSent ? "Check your phone" : "Reset password"}
        subtitle={resetSent ? undefined : "We will send a reset link to the phone number registered with Mandiri"}
      >
        {resetSent ? (
          <>
            <div className="flex items-start gap-3 rounded-2xl bg-success-soft p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-dark" />
              <p className="text-[13.5px] leading-relaxed text-success-dark">
                A reset link for <span className="font-bold">{resetId}</span> has been sent by SMS. It is valid for 15 minutes.
              </p>
            </div>
            <Button block className="mt-5" onClick={() => setResetOpen(false)}>
              Back to login
            </Button>
          </>
        ) : (
          <>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink">Mandiri user ID</span>
              <input
                value={resetId}
                onChange={(e) => setResetId(e.target.value)}
                autoComplete="username"
                className="h-12 w-full rounded-2xl border border-surface-line bg-white px-4 text-[15px] focus:border-navy"
              />
            </label>
            <Button block className="mt-5" disabled={resetId.trim().length < 3} onClick={() => setResetSent(true)}>
              Send reset link
            </Button>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="How Livin Merchant uses your data">
        <ul className="space-y-3 text-[13.5px] leading-relaxed text-ink-soft">
          <li>Transaction records are used to calculate your Growth Score, insights and Financing Readiness inside Livin Merchant.</li>
          <li>Customer identities are anonymized. Names, phone numbers and card numbers are never shown to you or shared.</li>
          <li>Financing Readiness is an indicative measure. Nothing is shared with a financing team unless you choose to continue.</li>
          <li>You can withdraw this consent at any time in Security Center.</li>
        </ul>
        <Button block className="mt-5" onClick={() => setPrivacyOpen(false)}>
          I understand
        </Button>
      </BottomSheet>
    </div>
  );
}
