import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { useI18n } from "@/i18n";

interface SvgFileUploadProps {
  onFileContent: (content: string) => void;
}

function isSvgFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".svg") || file.type === "image/svg+xml";
}

export function SvgFileUpload({ onFileContent }: SvgFileUploadProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePick = () => {
    setLocalError(null);
    inputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow selecting the same file again later
    event.target.value = "";
    if (!file) return;

    if (!isSvgFile(file)) {
      setFileName(null);
      setLocalError(t("upload.invalidType"));
      return;
    }

    try {
      const text = await file.text();
      setFileName(file.name);
      setLocalError(null);
      onFileContent(text);
    } catch {
      setFileName(null);
      setLocalError(t("upload.readError"));
    }
  };

  return (
    <div className="flex min-w-0 max-w-[min(100%,18rem)] items-center gap-1.5 sm:max-w-xs">
      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="sr-only"
        onChange={handleChange}
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={handlePick}
        aria-label={t("upload.chooseAria")}
        className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Upload className="h-3 w-3" aria-hidden />
        <span className="hidden sm:inline">{t("upload.choose")}</span>
      </button>
      <span
        className="min-w-0 truncate font-mono text-[10px] text-muted-foreground"
        title={localError ?? fileName ?? undefined}
      >
        {localError ? (
          <span className="text-destructive">{localError}</span>
        ) : fileName ? (
          fileName
        ) : (
          t("upload.noneSelected")
        )}
      </span>
    </div>
  );
}
