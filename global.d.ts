declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "consent",
      targetIdOrEventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export {};