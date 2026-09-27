export const DEMO_PANEL_FLAG = "livin-merchant:demo-panel";

/** Unlocks the hidden presenter controls for this browser session. */
export function openDemoControls() {
  try {
    window.sessionStorage.setItem(DEMO_PANEL_FLAG, "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("demo-panel"));
}
