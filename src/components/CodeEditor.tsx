import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { xml } from "@codemirror/lang-xml";
import { githubDark } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";
import { useMemo } from "react";

export type EditorLanguage = "xml" | "jsx" | "tsx";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onPaste?: (value: string) => void;
  language: EditorLanguage;
  readOnly?: boolean;
  placeholder?: string;
}

export function CodeEditor({
  value,
  onChange,
  onPaste,
  language,
  readOnly = false,
  placeholder,
}: CodeEditorProps) {
  const extensions = useMemo(() => {
    const base =
      language === "xml"
        ? [xml()]
        : [javascript({ jsx: true, typescript: language === "tsx" })];
    const paste = EditorView.domEventHandlers({
      paste(event, view) {
        if (!onPaste) return false;
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          // Let CM insert normally, then notify with final value on next tick
          setTimeout(() => onPaste(view.state.doc.toString()), 0);
        }
        return false;
      },
    });
    return [...base, EditorView.lineWrapping, paste];
  }, [language, onPaste]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={githubDark}
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
        autocompletion: true,
        bracketMatching: true,
        closeBrackets: !readOnly,
      }}
      placeholder={placeholder}
      style={{ height: "100%" }}
      height="100%"
    />
  );
}
