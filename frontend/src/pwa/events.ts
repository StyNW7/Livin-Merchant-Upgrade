export const OPEN_INSTALL_EVENT = "livin-merchant:open-install";

/** Opens the install sheet from anywhere (More, Settings, desktop side panel). */
export function openInstallSheet() {
  window.dispatchEvent(new Event(OPEN_INSTALL_EVENT));
}
