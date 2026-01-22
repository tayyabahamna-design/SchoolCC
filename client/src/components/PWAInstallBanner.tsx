import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Global storage for the install prompt (survives component re-renders)
declare global {
  interface Window {
    deferredPWAPrompt?: BeforeInstallPromptEvent | null;
  }
}

// Capture the event as early as possible (before React loads)
if (typeof window !== 'undefined' && !window.deferredPWAPrompt) {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA Global] beforeinstallprompt captured early!');
    e.preventDefault();
    window.deferredPWAPrompt = e as BeforeInstallPromptEvent;
  });
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

    // Check if we already have a captured prompt from the global handler
    if (window.deferredPWAPrompt) {
      console.log('[PWA Banner] Using globally captured prompt');
      setDeferredPrompt(window.deferredPWAPrompt);
      setTimeout(() => setShowBanner(true), 2000);
    }

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handler = (e: Event) => {
      console.log('[PWA Banner] beforeinstallprompt event fired!');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredPWAPrompt = promptEvent;
      setDeferredPrompt(promptEvent);

      // Show banner after 2 seconds
      setTimeout(() => {
        setShowBanner(true);
        console.log('[PWA Banner] Showing install banner');
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    console.log('[PWA Banner] Listening for beforeinstallprompt event...');

    // Also show banner for browsers that don't support beforeinstallprompt (like iOS)
    // but only if not dismissed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && dismissed !== "session") {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[PWA Banner] Install button clicked');
    
    // Try to use the global prompt first
    const promptToUse = deferredPrompt || window.deferredPWAPrompt;
    
    if (!promptToUse) {
      console.log('[PWA Banner] No deferred prompt available');
      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS-specific instructions
        alert(
          'TaleemHub انسٹال کرنے کے لیے:\n\n' +
          '1. نیچے Share بٹن (⎙) پر ٹیپ کریں\n' +
          '2. "Add to Home Screen" منتخب کریں\n' +
          '3. "Add" پر ٹیپ کریں\n\n' +
          'To install TaleemHub:\n\n' +
          '1. Tap Share button (⎙) at bottom\n' +
          '2. Select "Add to Home Screen"\n' +
          '3. Tap "Add"'
        );
      } else {
        // Android/Chrome instructions
        alert(
          'TaleemHub انسٹال کرنے کے لیے:\n\n' +
          '1. براؤزر مینو (⋮) پر ٹیپ کریں\n' +
          '2. "Install app" یا "Add to Home screen" منتخب کریں\n' +
          '3. "Install" پر ٹیپ کریں\n\n' +
          'To install TaleemHub:\n\n' +
          '1. Tap browser menu (⋮)\n' +
          '2. Select "Install app" or "Add to Home screen"\n' +
          '3. Tap "Install"'
        );
      }
      return;
    }

    try {
      console.log('[PWA Banner] Showing native install prompt');
      await promptToUse.prompt();

      const { outcome } = await promptToUse.userChoice;
      console.log('[PWA Banner] User choice:', outcome);

      if (outcome === "accepted") {
        console.log("[PWA Banner] User accepted the install prompt");
        setShowBanner(false);
        localStorage.setItem("pwa-banner-dismissed", "permanent");
      }

      // Clear the prompt after use
      window.deferredPWAPrompt = null;
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
