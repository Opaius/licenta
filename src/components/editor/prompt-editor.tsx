"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: (line: number, column: number) => void;
}

const registerPromptLanguage = (monaco: typeof import("monaco-editor")) => {
  monaco.languages.setMonarchTokensProvider("markdown", {
    tokenizer: {
      root: [
        [/\{\{[^}]+\}\}/, "template-variable"],
        [/^#{1,6}\s+.*/, "header"],
        [/[\*_]{1,2}([^\*_]+)[\*_]{1,2}/, "emphasis"],
        [/^```[\s\S]*?^```/, "code.block"],
        [`/^` + '`' + `.*` + '`' + `/`, "code.inline"],
        [/^\s*[-\*\+]\s+/, "list"],
        [/^\s*\d+\.\s+/, "list.numbered"],
        [/\[([^\]]+)\]\(([^)]+)\)/, "link"],
        [/^>\s+/, "quote"],
        [/^-{3,}\s*$/, "hr"],
        [/./, "source"],
      ],
    },
  });

  monaco.editor.defineTheme("prompt-theme-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "template-variable", foreground: "c084fc", fontStyle: "bold" },
      { token: "header", foreground: "93c5fd", fontStyle: "bold" },
      { token: "emphasis", foreground: "fca5a5" },
      { token: "code.block", foreground: "86efac" },
      { token: "code.inline", foreground: "86efac" },
      { token: "list", foreground: "fcd34d" },
      { token: "list.numbered", foreground: "fcd34d" },
      { token: "link", foreground: "67e8f9" },
      { token: "quote", foreground: "d1d5db", fontStyle: "italic" },
      { token: "hr", foreground: "6b7280" },
      { token: "source", foreground: "e5e7eb" },
    ],
    colors: {
      "editor.background": "#0f172a",
      "editor.foreground": "#e2e8f0",
      "editor.lineHighlightBackground": "#1e293b",
      "editor.selectionBackground": "#334155",
      "editorLineNumber.foreground": "#64748b",
      "editorLineNumber.activeForeground": "#94a3b8",
      "editor.inactiveSelectionBackground": "#1e293b",
    },
  });

  monaco.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: ["{"],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        { label: "{{input}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{input}}", range },
        { label: "{{context}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{context}}", range },
        { label: "{{query}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{query}}", range },
        { label: "{{user_message}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{user_message}}", range },
        { label: "{{system_prompt}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{system_prompt}}", range },
      ].map((item) => ({ ...item, detail: "Template variable" }));

      return { suggestions };
    },
  });
};

export function PromptEditor({ value, onChange, onCursorChange }: PromptEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    registerPromptLanguage(monaco);

    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e) => {
        onCursorChange(e.position.lineNumber, e.position.column);
      });
    }

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      editor.layout({ width, height });
    });
    ro.observe(container);

    editor.focus();
  }, [onCursorChange]);

  const handleChange: OnChange = useCallback((value) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden rounded-lg border border-border">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="markdown"
        language="markdown"
        theme="prompt-theme-dark"
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          lineNumbers: "on",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          tabSize: 2,
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          folding: true,
          renderWhitespace: "boundary",
        }}
      />
    </div>
  );
}
