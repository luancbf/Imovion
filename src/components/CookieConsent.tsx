"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("cookieConsent") === null) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem("cookieConsent", "accepted");
    setVisible(false);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  }

  function declineCookies() {
    localStorage.setItem("cookieConsent", "declined");
    setVisible(false);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-blue-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between z-50 shadow-lg">
      <span className="mb-2 sm:mb-0">
        Utilizamos cookies para melhorar sua experiência e analisar o tráfego do site. Saiba mais em nossa{" "}
        <a
          href="/politica-de-privacidade"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Política de Privacidade
        </a>.
      </span>
      <div className="flex gap-2">
        <button
          onClick={declineCookies}
          className="text-blue-100 px-4 py-2 rounded font-semibold hover:bg-blue-800 transition cursor-pointer border border-blue-800"
          style={{ opacity: 0.7 }}
        >
          Recusar
        </button>
        <button
          onClick={acceptCookies}
          className="bg-white text-blue-900 px-4 py-2 rounded font-bold hover:bg-blue-100 transition cursor-pointer shadow"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}