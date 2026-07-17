import { Download } from "lucide-react";
import { downloadFile } from "@/lib/downloadFile";
import { useI18n } from "@/i18n";
import type { OutputFormat } from "@/lib/svgToReact";

interface DownloadButtonProps {
  value: string;
  componentName: string;
  format: OutputFormat;
  disabled?: boolean;
}

export function DownloadButton({ value, componentName, format, disabled }: DownloadButtonProps) {
  const { t } = useI18n();
  const handleClick = () => {
    if (!value) return;
    downloadFile(`${componentName}.${format}`, value);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !value}
      aria-label={t("actions.downloadAria")}
      title={t("actions.downloadAria")}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {t("actions.download")}
    </button>
  );
}
