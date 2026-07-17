import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/i18n";

interface CopyButtonProps {
  value: string;
  disabled?: boolean;
}

export function CopyButton({ value, disabled }: CopyButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const canCopy = typeof navigator !== "undefined" && !!navigator.clipboard;

  const handleClick = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !canCopy || !value}
      aria-label={t("actions.copyAria")}
      title={canCopy ? t("actions.copyAria") : t("actions.clipboardUnavailable")}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t("actions.copied") : t("actions.copy")}
    </button>
  );
}
