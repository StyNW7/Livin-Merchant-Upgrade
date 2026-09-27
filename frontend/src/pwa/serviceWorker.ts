let registration: ServiceWorkerRegistration | null = null;

export function setServiceWorkerRegistration(value: ServiceWorkerRegistration) {
  registration = value;
}

/**
 * Asks the server for a newer version. Resolves to "updating" when one was found (the update
 * banner then appears), "latest" when this is already the newest version, or "unavailable".
 */
export async function checkForUpdate(): Promise<"updating" | "latest" | "unavailable"> {
  if (!registration) return "unavailable";
  try {
    await registration.update();
    return registration.installing || registration.waiting ? "updating" : "latest";
  } catch {
    return "unavailable";
  }
}
