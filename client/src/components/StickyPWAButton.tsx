import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function StickyPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);

  useEffect(() => {
    console.log('[Sticky PWA] Initializing...');

    // Check if app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone || (window.navigator as any).standalone === true) {
      console.log('[Sticky PWA] App already installed');
      return;
    }

    // Check if permanently dismissed
    const dismissed = localStorage.getItem("pwa-sticky-dismissed");
    if (dismissed === "permanent") {
      console.log('[Sticky PWA] Permanently dismissed');
      setIsPermanentlyDismissed(true);
      return;
    }

    // Always show button after 3 seconds (don't wait for beforeinstallprompt)
    setTimeout(() => {
      setShowButton(true);
      console.log('[Sticky PWA] Showing sticky install button');
    }, 3000);

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handler = (e: Event) => {
      console.log('[Sticky PWA] beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    console.log('[Sticky PWA] Listening for beforeinstallprompt event...');

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[Sticky PWA] Install button clicked');
    if (!deferredPrompt) {
      console.log('[Sticky PWA] No deferred prompt available');
      // Fallback: guide users to install manually
      alert('To install TaleemHub:\n\n1. Tap the menu button (⋮) in your browser\n2. Select "Add to Home screen" or "Install app"\n3. Tap "Install" to confirm');
      return;
    }

    try {
      console.log('[Sticky PWA] Showing native install prompt');
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      console.log('[Sticky PWA] User choice:', outcome);

      if (outcome === "accepted") {
        console.log("[Sticky PWA] User accepted the install prompt");
        setShowButton(false);
        localStorage.setItem("pwa-sticky-dismissed", "permanent");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('[Sticky PWA] Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    console.log('[Sticky PWA] User dismissed sticky button');
    setShowButton(false);
    // Temporarily dismiss - show again after page reload
    localStorage.setItem("pwa-sticky-dismissed", "session");
  };

  if (!showButton || isPermanentlyDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[50] sm:left-auto sm:right-4 sm:w-auto animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl px-4 py-3 sm:px-5 sm:py-3">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-white/20 p-2">
            <Download className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold">ٹیلیم ہب انسٹال کریں</p>
          <p className="text-xs sm:text-sm opacity-90 truncate">بہترین تجربے کے لیے ایپ حاصل کریں</p>
        </div>

        <Button
          onClick={handleInstallClick}
          size="sm"
          className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-4 py-2 h-auto min-h-[44px] touch-manipulation"
        >
          انسٹال Install
        </Button>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
