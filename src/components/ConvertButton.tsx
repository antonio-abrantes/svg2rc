import { RefreshCw } from "lucide-react";
import { useI18n } from "@/i18n";

interface ConvertButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "floating" | "bar";
}

export function ConvertButton({ onClick, disabled, variant = "floating" }: ConvertButtonProps) {
  const { t } = useI18n();
  const applyLabel = t("actions.apply");
  const applyAria = t("actions.applyAria");

  if (variant === "bar") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={applyAria}
        className="flex w-full items-center justify-center gap-2 border-y border-border bg-panel-header py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-panel-header"
      >
        <RefreshCw className="h-4 w-4" />
        {applyLabel}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={applyAria}
      title={applyAria}
      className={`group z-20 flex h-12 w-2 items-center justify-center rounded-full border shadow-lg transition-all ${
        disabled
          ? "cursor-not-allowed border-border bg-secondary text-muted-foreground"
          : "border-primary bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl"
      }`}
    >
      <RefreshCw
        className={`h-5 w-5 transition-transform ${
          disabled ? "" : "group-hover:rotate-180"
        }`}
      />
    </button>
  );
}
