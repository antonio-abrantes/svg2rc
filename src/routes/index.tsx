import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SvgInputPanel } from "@/components/SvgInputPanel";
import { CodeOutputPanel } from "@/components/CodeOutputPanel";
import { ConvertButton } from "@/components/ConvertButton";
import { InstallShortcutDialog } from "@/components/InstallShortcutDialog";
import { useSvgConverter } from "@/hooks/useSvgConverter";
import { useInstallShortcut } from "@/hooks/useInstallShortcut";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "svg2rc — SVG para componente React" },
      {
        name: "description",
        content:
          "Converta SVG em componente React (JSX ou TSX) direto no navegador. Rápido, limpo e sem backend.",
      },
      { property: "og:title", content: "svg2rc — SVG para componente React" },
      {
        property: "og:description",
        content:
          "Converta SVG em componente React (JSX ou TSX) direto no navegador. Rápido, limpo e sem backend.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-screen bg-background" />;
  return <ConverterApp />;
}

function ConverterApp() {
  const {
    input,
    output,
    componentName,
    nameRaw,
    error,
    format,
    isDirty,
    setInput,
    setFormat,
    setNameRaw,
    applyConversion,
  } = useSvgConverter();
  const shortcut = useInstallShortcut();

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header format={format} onFormatChange={setFormat} />
      <main className="flex min-h-0 flex-1 flex-col md:flex-row md:relative">
        <div className="flex min-h-0 flex-1 border-b border-border md:border-b-0 md:border-r">
          <SvgInputPanel
            value={input}
            error={error}
            onChange={(v) => setInput(v)}
            onPaste={(v) => setInput(v, { isPaste: true })}
          />
        </div>

        {/* Mobile bar */}
        <div className="md:hidden">
          <ConvertButton
            onClick={applyConversion}
            disabled={!isDirty}
            variant="bar"
          />
        </div>

        {/* Desktop floating button */}
        <div className="hidden md:block">
          <ConvertButton
            onClick={applyConversion}
            disabled={!isDirty}
            variant="floating"
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <CodeOutputPanel
            value={output}
            format={format}
            componentName={componentName}
            nameRaw={nameRaw}
            onNameChange={setNameRaw}
            hasError={!!error}
          />
        </div>
      </main>

      <InstallShortcutDialog
        open={shortcut.open}
        canNativeInstall={shortcut.canNativeInstall}
        onAccept={shortcut.accept}
        onDismiss={shortcut.dismiss}
      />
    </div>
  );
}
