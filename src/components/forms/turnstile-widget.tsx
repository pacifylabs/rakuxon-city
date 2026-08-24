"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/**
 * FR-3.6 — the Cloudflare Turnstile widget.
 *
 * Renders nothing when no site key is configured, which is a supported way to
 * run this site. The server knows the difference: with no secret key it logs
 * that a submission was accepted without a challenge, rather than treating an
 * absent challenge as a passed one.
 *
 * The managed widget is invisible for most visitors and only shows an
 * interactive challenge when Cloudflare wants one — which is why it sits above
 * the submit button rather than being hidden somewhere it could appear
 * off-screen and block a submission the visitor cannot see.
 */
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !scriptReady || !container.current) return;
    if (!window.turnstile || widgetId.current) return;

    widgetId.current = window.turnstile.render(container.current, {
      sitekey: SITE_KEY,
      theme: "light",
      callback: (token) => onToken(token),
      // A token that expires before submission must not be sent as valid.
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });

    const id = widgetId.current;
    return () => {
      if (id) window.turnstile?.remove(id);
      widgetId.current = null;
    };
  }, [scriptReady, onToken]);

  if (!SITE_KEY) return null;

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={container} />
    </div>
  );
}
