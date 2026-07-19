import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { validateSvg, type AppMessage } from "@/lib/svgValidator";
import { convertSvgToComponent } from "@/lib/svgToReact";
import { generateComponentName, toPascalCase } from "@/lib/componentNameGenerator";
import type { OutputFormat } from "@/lib/svgToReact";

const DEFAULT_NAME = "MyIcon";

export function useSvgConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [autoName, setAutoName] = useState(DEFAULT_NAME);
  const [nameRaw, setNameRaw] = useState("");
  const [error, setError] = useState<AppMessage | null>(null);
  const [lastAppliedInput, setLastAppliedInput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("jsx");
  const hasEverConverted = useRef(false);

  const componentName = useMemo(
    () => (nameRaw.trim() ? toPascalCase(nameRaw, DEFAULT_NAME) : autoName),
    [nameRaw, autoName],
  );

  const runConversion = useCallback(
    (source: string, fmt: OutputFormat, nameOverride?: string) => {
      const validation = validateSvg(source);
      if (!validation.ok) {
        setError(validation.error ?? { key: "validation.generic" });
        setOutput("");
        return false;
      }
      const derived = generateComponentName(validation.doc ?? null, DEFAULT_NAME);
      setAutoName(derived);
      const effectiveName =
        nameOverride ??
        (nameRaw.trim() ? toPascalCase(nameRaw, DEFAULT_NAME) : derived);
      const result = convertSvgToComponent(validation.sanitized!, {
        componentName: effectiveName,
        format: fmt,
      });
      if (!result.ok) {
        setError(result.error);
        setOutput("");
        return false;
      }
      setError(null);
      setOutput(result.code);
      setLastAppliedInput(source);
      hasEverConverted.current = true;
      return true;
    },
    [nameRaw],
  );

  const handleInputChange = useCallback(
    (value: string, meta?: { isPaste?: boolean; isFile?: boolean }) => {
      const wasEmpty = input.trim().length === 0;
      setInput(value);
      if (meta?.isFile) {
        runConversion(value, format);
        return;
      }
      if (wasEmpty && (meta?.isPaste || value.trim().length > 0) && !hasEverConverted.current) {
        runConversion(value, format);
      } else if (value.trim().length === 0) {
        setError(null);
        setOutput("");
        setLastAppliedInput("");
      }
    },
    [input, format, runConversion],
  );

  const applyConversion = useCallback(() => {
    if (!input.trim()) return;
    runConversion(input, format);
  }, [input, format, runConversion]);

  useEffect(() => {
    if (lastAppliedInput && !error) {
      runConversion(lastAppliedInput, format);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  useEffect(() => {
    if (lastAppliedInput && !error) {
      runConversion(lastAppliedInput, format, componentName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentName]);

  const isDirty = input.trim().length > 0 && input !== lastAppliedInput;

  return {
    input,
    output,
    componentName,
    nameRaw,
    error,
    format,
    isDirty,
    hasOutput: output.length > 0,
    setInput: handleInputChange,
    setFormat,
    setNameRaw,
    applyConversion,
  };
}
