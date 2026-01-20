import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import App from "./App";
import "./index.css";
import { getApiBaseUrl } from "./lib/config";

// Intercept fetch calls to add API base URL for mobile
const originalFetch = window.fetch;
const apiBaseUrl = getApiBaseUrl();

if (apiBaseUrl) {
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    // Only modify API calls (those starting with /api)
    if (typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(`${apiBaseUrl}${input}`, {
        ...init,
        credentials: init?.credentials || 'include', // Ensure cookies are sent
      });
    }
    return originalFetch(input, init);
  };
}

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: "https://us.i.posthog.com",
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'identified_only',
    persistence: 'localStorage+cookie',
  });
}

createRoot(document.getElementById("root")!).render(<App />);
