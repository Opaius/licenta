"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: (line: number, column: number) => void;
}

// Custom language definition for template variables
const registerPromptLanguage = (monaco: typeof import("monaco-editor")) => {
  // Register custom language
  monaco.languages.register({ id: "prompt-template" });

  // Tokenizer for template variables {{variable}}
  monaco.languages.setMonarchTokensProvider("prompt-template", {
    tokenizer: {
      root: [
        // Template variables {{variable}}
        [/\{\{[^}]+\}\}/, "template-variable"],
        // Strings
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],
        // Comments
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        // Numbers
        [/\d+/, "number"],
        // Keywords
        [/system|user|assistant|role|content|temperature|top_p|max_tokens/, "keyword"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
    },
  });

  // Define theme for template variables
  monaco.editor.defineTheme("prompt-theme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "template-variable", foreground: "8b5cf6", fontStyle: "bold" },
      { token: "string", foreground: "22c55e" },
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "3b82f6", fontStyle: "bold" },
      { token: "number", foreground: "f59e0b" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#1f2937",
      "editor.lineHighlightBackground": "#f3f4f6",
      "editor.selectionBackground": "#bfdbfe",
      "editorLineNumber.foreground": "#9ca3af",
      "editorLineNumber.activeForeground": "#4b5563",
    },
  });

  // Dark theme
  monaco.editor.defineTheme("prompt-theme-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "template-variable", foreground: "a78bfa", fontStyle: "bold" },
      { token: "string", foreground: "4ade80" },
      { token: "comment", foreground: "9ca3af", fontStyle: "italic" },
      { token: "keyword", foreground: "60a5fa", fontStyle: "bold" },
      { token: "number", foreground: "fbbf24" },
    ],
    colors: {
      "editor.background": "#1f2937",
      "editor.foreground": "#f9fafb",
      "editor.lineHighlightBackground": "#374151",
      "editor.selectionBackground": "#3b82f6",
      "editorLineNumber.foreground": "#6b7280",
      "editorLineNumber.activeForeground": "#9ca3af",
    },
  });

  // Configure auto-completion for common template variables
  monaco.languages.registerCompletionItemProvider("prompt-template", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        { label: "{{name}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{name}}", range },
        { label: "{{input}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{input}}", range },
        { label: "{{context}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{context}}", range },
        { label: "{{query}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{query}}", range },
        { label: "{{system_prompt}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{system_prompt}}", range },
        { label: "{{user_message}}", kind: monaco.languages.CompletionItemKind.Variable, insertText: "{{user_message}}", range },
      ].map((item) => ({
        ...item,
        detail: "Template variable",
      }));

      return { suggestions };
    },
  });
};

export function PromptEditor({ value, onChange, onCursorChange }: PromptEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    registerPromptLanguage(monaco);

    // Set cursor position callback
    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e) => {
        onCursorChange(e.position.lineNumber, e.position.column);
      });
    }

    // Focus editor
    editor.focus();
  }, [onCursorChange]);

  const handleChange: OnChange = useCallback((value) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border">
      <Editor
        height="100%"
        defaultLanguage="prompt-template"
        language="prompt-template"
        theme="prompt-theme"
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          lineNumbers: "on",
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          tabSize: 2,
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
