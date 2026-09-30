import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FlaskConical, X } from "lucide-react";
import { useSession } from "@/hooks/useApp";
import { SCENARIO_IDS, scenarios } from "@/data/scenarios";
import { clearAppStorage } from "@/utils/storage";
import { cn } from "@/utils/cn";
import { DEMO_PANEL_FLAG as FLAG, openDemoControls } from "@/utils/demo";


/**
 * Presenter-only controls. Hidden unless the URL contains ?demo=true (or it is unlocked from
 * Settings by tapping the app version five times). Supports ?scenario=A|B|C as a direct switch.
 */
export function DemoControls() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scenario, setScenario, loginAsMerchant, exploreAsGuest } = useSession();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("scenario")?.toUpperCase();
    if (requested && SCENARIO_IDS.includes(requested as never) && requested !== scenario) {
      setScenario(requested as (typeof SCENARIO_IDS)[number]);
    }
    if (params.get("demo") === "true") openDemoControls();
    const sync = () => {
      try {
        setVisible(window.sessionStorage.getItem(FLAG) === "1");
      } catch {
        setVisible(false);
      }
    };
    sync();
    window.addEventListener("demo-panel", sync);
    return () => window.removeEventListener("demo-panel", sync);
  }, [location.search, scenario, setScenario]);

  if (!visible) return null;

  return (
    <div className="pointer-events-auto absolute bottom-24 right-3 z-[70]">
      {open ? (
        <div className="w-[250px] animate-pop-in rounded-2xl border border-navy-100 bg-white p-3 text-ink shadow-float">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Presenter controls</p>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-surface">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-1.5 text-[11px] font-semibold text-ink-soft">Scenario</p>
          <div className="space-y-1.5">
            {SCENARIO_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setScenario(id)}
                className={cn(
                  "w-full rounded-xl border px-2.5 py-2 text-left text-[12px]",
                  scenario === id ? "border-navy bg-navy text-white" : "border-surface-line hover:bg-surface",
                )}
              >
                <span className="font-bold">{id}. {scenarios[id].name}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[12px] font-semibold">
            <button type="button" onClick={() => { loginAsMerchant(); navigate("/home"); }} className="rounded-xl bg-navy-50 py-2 text-navy-600">
              Merchant
            </button>
            <button type="button" onClick={() => { exploreAsGuest(); navigate("/home"); }} className="rounded-xl bg-navy-50 py-2 text-navy-600">
              Guest
            </button>
            <button
              type="button"
              onClick={() => {
                clearAppStorage();
                window.location.assign("/?demo=true");
              }}
              className="col-span-2 rounded-xl bg-danger-soft py-2 text-danger-dark"
            >
              Reset all demo data
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  window.sessionStorage.removeItem(FLAG);
                } catch {
                  /* ignore */
                }
                setVisible(false);
              }}
              className="col-span-2 py-1 text-ink-muted"
            >
              Hide controls
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Presenter controls"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/80 text-white shadow-float backdrop-blur hover:bg-navy"
        >
          <FlaskConical className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
