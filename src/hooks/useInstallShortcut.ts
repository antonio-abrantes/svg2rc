import { useCallback, useEffect, useRef, useState } from "react";
import {
  getShortcutPromptDecision,
  isStandaloneDisplay,
  setShortcutPromptDecision,
} from "@/lib/shortcutPrompt";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const PROMPT_DELAY_MS = 1800;

export function useInstallShortcut() {
  const [open, setOpen] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneDisplay()) {
      setShortcutPromptDecision("installed");
      return;
    }
    if (getShortcutPromptDecision() !== null) return;

    const onBeforeInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      deferredPrompt.current = event;
      setCanNativeInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const timer = window.setTimeout(() => {
      if (getShortcutPromptDecision() !== null) return;
      if (isStandaloneDisplay()) return;
      setOpen(true);
    }, PROMPT_DELAY_MS);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration failures */
      });
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = useCallback(() => {
    setShortcutPromptDecision("dismissed");
    setOpen(false);
  }, []);

  const accept = useCallback(async () => {
    const promptEvent = deferredPrompt.current;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          setShortcutPromptDecision("installed");
        } else {
          setShortcutPromptDecision("dismissed");
        }
      } catch {
        setShortcutPromptDecision("dismissed");
      } finally {
        deferredPrompt.current = null;
        setCanNativeInstall(false);
        setOpen(false);
      }
      return;
    }

    // Browser doesn't expose native install — keep decision so we don't nag,
    // but leave dialog closed after user confirmed intent.
    setShortcutPromptDecision("dismissed");
    setOpen(false);
  }, []);

  return {
    open,
    canNativeInstall,
    accept,
    dismiss,
    setOpen,
  };
}
