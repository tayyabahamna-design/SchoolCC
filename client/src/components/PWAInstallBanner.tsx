import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Prominent PWA install banner that shows at the top after onboarding
 * Highly visible and easy to find
 */
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);

  useEffect(() => {
    console.log('[PWA Banner] Initializing...');

    // Check if app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone || (window.navigator as any).standalone === true) {
      console.log('[PWA Banner] App already installed');
      return;
    }

    // Check if permanently dismissed
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed === "permanent") {
      console.log('[PWA Banner] Permanently dismissed');
      setIsPermanentlyDismissed(true);
      return;
    }

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handler = (e: Event) => {
      console.log('[PWA Banner] beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner after 2 seconds
      setTimeout(() => {
        setShowBanner(true);
        console.log('[PWA Banner] Showing install banner');
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    console.log('[PWA Banner] Listening for beforeinstallprompt event...');

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[PWA Banner] Install button clicked');
    if (!deferredPrompt) {
      console.log('[PWA Banner] No deferred prompt available');
      // Fallback: guide users to install manually
      alert('To install TaleemHub:\n\n1. Tap the menu button (⋮) in your browser\n2. Select "Add to Home screen" or "Install app"\n3. Tap "Install" to confirm');
      return;
    }

    try {
      console.log('[PWA Banner] Showing native install prompt');
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA Banner] User choice:', outcome);

      if (outcome === "accepted") {
        console.log("[PWA Banner] User accepted the install prompt");
        setShowBanner(false);
        localStorage.setItem("pwa-banner-dismissed", "permanent");
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA Banner] Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    console.log('[PWA Banner] User dismissed banner');
    setShowBanner(false);
    // Session dismiss - show again on next visit
    localStorage.setItem("pwa-banner-dismissed", "session");
  };

  if (!showBanner || isPermanentlyDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[50] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl animate-in slide-in-from-top-5 duration-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="rounded-full bg-white/20 p-2">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          {/* Content - Bilingual */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">ٹیلیم ہب ایپ حاصل کریں! Get the TaleemHub App!</p>
            <p className="text-xs opacity-90 truncate">آف لائن استعمال اور بہتر تجربے کے لیے انسٹال کریں</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="bg-white text-purple-600 hover:bg-white/90 font-bold h-10 px-4 touch-manipulation"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
