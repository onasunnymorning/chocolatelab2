"use client";

import { useEffect, useState } from "react";
import { XIcon, ShareIcon, PlusSquareIcon } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Shows a contextual "Add to Home Screen" banner:
 * - Android / Chrome: captures the `beforeinstallprompt` event and shows a native prompt
 * - iOS Safari: shows share-sheet instructions (iOS doesn't support beforeinstallprompt)
 * - Hidden once the app is already running in standalone mode
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // start hidden to avoid flash
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed?
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if user already dismissed this session
    if (sessionStorage.getItem("install-prompt-dismissed") === "1") {
      setDismissed(true);
      return;
    }

    // iOS detection
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Android / Chrome: capture the prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDismissed(true);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("install-prompt-dismissed", "1");
    setDismissed(true);
  };

  // Nothing to show
  if (isStandalone || dismissed) return null;
  if (!isIOS && !deferredPrompt) return null;

  return (
    <div
      role="banner"
      aria-label="Install app"
      className="
        fixed bottom-0 left-0 right-0 z-50
        mx-auto max-w-2xl
        px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3
        bg-background/95 backdrop-blur-lg
        border-t border-amber-400/20
        animate-in slide-in-from-bottom-4 duration-300
      "
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex-none w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192x192.png"
            alt=""
            className="w-7 h-7 rounded-md"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            Add to Home Screen
          </p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
              Tap{" "}
              <ShareIcon className="w-3.5 h-3.5 inline text-amber-400" />{" "}
              then{" "}
              <span className="inline-flex items-center gap-0.5">
                <PlusSquareIcon className="w-3.5 h-3.5 inline text-amber-400" />
                <strong>Add to Home Screen</strong>
              </span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              Install for quick access from your home screen
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-none">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="
                text-xs font-semibold px-3 py-1.5 rounded-lg
                bg-amber-400 text-amber-950
                hover:bg-amber-300 active:scale-95
                transition-all duration-150
              "
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
