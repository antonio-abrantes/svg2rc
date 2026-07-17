import { useI18n, type Locale } from "@/i18n";

const OPTIONS: Locale[] = ["pt-BR", "en"];

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("header.languageAria")}
      className="inline-flex h-8 items-center rounded-md border border-border bg-secondary p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = locale === option;
        const label = option === "pt-BR" ? t("header.langPt") : t("header.langEn");
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            className={`rounded px-2 text-xs font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
