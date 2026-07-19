import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SvgInputPanel } from "@/components/SvgInputPanel";
import { CodeOutputPanel } from "@/components/CodeOutputPanel";
import { ConvertButton } from "@/components/ConvertButton";
import { InstallShortcutDialog } from "@/components/InstallShortcutDialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSvgConverter } from "@/hooks/useSvgConverter";
import { useInstallShortcut } from "@/hooks/useInstallShortcut";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Svg2rc — SVG para componente React" },
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
  const isMobile = useIsMobile();

  const inputPanel = (
    <SvgInputPanel
      value={input}
      error={error}
      onChange={(v) => setInput(v)}
      onPaste={(v) => setInput(v, { isPaste: true })}
      onFileLoad={(v) => setInput(v, { isFile: true })}
    />
  );

  const outputPanel = (
    <CodeOutputPanel
      value={output}
      format={format}
      componentName={componentName}
      nameRaw={nameRaw}
      onNameChange={setNameRaw}
      hasError={!!error}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header format={format} onFormatChange={setFormat} />

      {isMobile ? (
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 border-b border-border">{inputPanel}</div>
          <ConvertButton
            onClick={applyConversion}
            disabled={!isDirty}
            variant="bar"
          />
          <div className="flex min-h-0 flex-1">{outputPanel}</div>
        </main>
      ) : (
        <main className="min-h-0 flex-1">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize="50" minSize={100} className="min-w-0">
              <div className="flex h-full min-h-0 min-w-0">{inputPanel}</div>
            </ResizablePanel>

            <ResizableHandle className="overflow-visible">
              <div
                className="pointer-events-auto absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ConvertButton
                  onClick={applyConversion}
                  disabled={!isDirty}
                  variant="floating"
                />
              </div>
            </ResizableHandle>

            <ResizablePanel defaultSize="50" minSize={100} className="min-w-0">
              <div className="flex h-full min-h-0 min-w-0">{outputPanel}</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      )}

      <InstallShortcutDialog
        open={shortcut.open}
        canNativeInstall={shortcut.canNativeInstall}
        onAccept={shortcut.accept}
        onDismiss={shortcut.dismiss}
      />
    </div>
  );
}
