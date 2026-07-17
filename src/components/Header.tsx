import { useEffect, useState } from "react";
import { Github, Star } from "lucide-react";
import { FormatSelect } from "./FormatSelect";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/i18n";
import type { OutputFormat } from "@/lib/svgToReact";

const REPO = "antonio-abrantes/svg2rc";

function useGithubStars(repo: string) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    const cacheKey = `gh-stars:${repo}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { value, ts } = JSON.parse(cached) as { value: number; ts: number };
        if (Date.now() - ts < 10 * 60 * 1000) {
          setStars(value);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ value: data.stargazers_count, ts: Date.now() }),
            );
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, [repo]);
  return stars;
}

interface HeaderProps {
  format: OutputFormat;
  onFormatChange: (f: OutputFormat) => void;
}

export function Header({ format, onFormatChange }: HeaderProps) {
  const { t } = useI18n();
  const stars = useGithubStars(REPO);
  const repoUrl = `https://github.com/${REPO}`;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-panel-header px-4">
      <div className="flex items-center gap-2">
        <img
          src="/favicon.svg"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-md"
        />
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold tracking-tight">svg2rc</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {t("header.tagline")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageToggle />
        <FormatSelect value={format} onChange={onFormatChange} />
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("header.starAria")}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          <Star className="h-3.5 w-3.5" />
          {stars !== null && <span className="tabular-nums">{stars}</span>}
        </a>
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("header.repoAria")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
