import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Use the global prompt from PWAInstallBanner
declare global {
  interface Window {
    deferredPWAPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function StickyPWAButton() {
  const [location] = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);
  
  // Hide on login page since it has its own inline install banner
  const isLoginPage = location === "/" || location === "/login";

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

    // Check if we have a global prompt
    if (window.deferredPWAPrompt) {
      setDeferredPrompt(window.deferredPWAPrompt);
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
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredPWAPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    console.log('[Sticky PWA] Listening for beforeinstallprompt event...');

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[Sticky PWA] Install button clicked');
    
    // Try global prompt first
    const promptToUse = deferredPrompt || window.deferredPWAPrompt;
    
    if (!promptToUse) {
      console.log('[Sticky PWA] No deferred prompt available');
      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
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
      console.log('[Sticky PWA] Showing native install prompt');
      await promptToUse.prompt();

      const { outcome } = await promptToUse.userChoice;
      console.log('[Sticky PWA] User choice:', outcome);

      if (outcome === "accepted") {
        console.log("[Sticky PWA] User accepted the install prompt");
        setShowButton(false);
        localStorage.setItem("pwa-sticky-dismissed", "permanent");
      }

      window.deferredPWAPrompt = null;
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[Sticky PWA] Error during installation:', error);
    }
  };

  if (!showButton || isPermanentlyDismissed || isLoginPage) {
    return null;
  }

  return (
    <div className="fixed top-2 left-4 right-4 z-[50] sm:top-auto sm:bottom-20 sm:left-auto sm:right-4 sm:w-auto animate-in slide-in-from-top-5 sm:slide-in-from-bottom-5 duration-500">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl px-4 py-3 sm:px-5 sm:py-3">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-white/20 p-2">
            <Download className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-left">Install TaleemHub</p>
          <p className="text-xs sm:text-sm opacity-90 truncate text-right" dir="rtl">تعلیم ہب انسٹال کریں</p>
        </div>

        <Button
          onClick={handleInstallClick}
          size="sm"
          className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-4 py-2 h-auto min-h-[44px] touch-manipulation"
        >
          Install انسٹال
        </Button>
      </div>
    </div>
  );
}
