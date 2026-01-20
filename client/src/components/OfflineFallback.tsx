import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflineFallback() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <WifiOff className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            You're Offline
          </h1>
          <p className="text-muted-foreground text-lg">
            It looks like you've lost your internet connection. Some features may be limited until you're back online.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            onClick={handleRetry}
            size="lg"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>While offline, you can still:</p>
            <ul className="mt-2 space-y-1 text-left list-disc list-inside">
              <li>View previously loaded pages</li>
              <li>Access cached data</li>
              <li>Navigate through the app</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
