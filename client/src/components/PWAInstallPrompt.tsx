import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone || (window.navigator as any).standalone === true) {
      setShowPrompt(false);
      return;
    }

    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isiOS);
    setIsAndroid(isAndroidDevice);

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const dismissedTime = localStorage.getItem("pwa-install-dismissed-time");

    // Show again after 7 days
    if (dismissed && dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // For iOS Safari, show instructions after a short delay
    if (isiOS) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }

    // For Android/Desktop Chrome, listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
    localStorage.setItem("pwa-install-dismissed-time", Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-auto sm:right-4 sm:w-96">
        <Card className="shadow-lg border-2 sm:rounded-lg rounded-t-lg rounded-b-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <Share className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Install TaleemHub App</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">To install on iPhone/iPad:</p>
                    <ol className="list-decimal list-inside space-y-1 pl-2">
                      <li>Tap the <span className="inline-flex items-center"><Share className="h-3 w-3 mx-1" /></span> Share button below</li>
                      <li>Scroll and tap "Add to Home Screen"</li>
                      <li>Tap "Add" to install</li>
                    </ol>
                  </div>
                </div>

                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Got it!
                </Button>
              </div>

              <Button
                onClick={handleDismiss}
                size="icon"
                variant="ghost"
                className="flex-shrink-0 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Android/Desktop Install Button
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96">
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="rounded-full bg-primary/10 p-2">
                <Download className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Install TaleemHub App</h3>
                <p className="text-xs text-muted-foreground">
                  {isAndroid
                    ? "Install for quick access, offline support, and notifications."
                    : "Install our app for quick access and a better experience."}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1"
                >
                  Install Now
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                >
                  Later
                </Button>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              size="icon"
              variant="ghost"
              className="flex-shrink-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
