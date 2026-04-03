import Editor from '@monaco-editor/react';
import { useEditor } from '../contexts/EditorContext';

const languageMap: Record<string, string> = {
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript'
};

export default function CodeEditor() {
  const { code, setCode, language } = useEditor();

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={languageMap[language]}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true }
        }}
      />
    </div>
  );
}
