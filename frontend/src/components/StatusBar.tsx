import { useEditor } from '../contexts/EditorContext';

export default function StatusBar() {
  const { language, code } = useEditor();

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  const languageLabels: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    cpp: 'C++',
    java: 'Java'
  };

  const languageIcons: Record<string, string> = {
    python: '🐍',
    javascript: '📜',
    cpp: '⚡',
    java: '☕'
  };

  return (
    <div className="bg-primary-600 text-white px-3 py-1 flex items-center justify-between text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="font-medium">Ready</span>
        </div>
        <div className="h-3 w-px bg-primary-400"></div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{charCount} chars</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-semibold">
          <span>{languageIcons[language]}</span>
          <span>{languageLabels[language]}</span>
        </div>
        <div className="h-3 w-px bg-primary-400"></div>
        <span>UTF-8</span>
        <div className="h-3 w-px bg-primary-400"></div>
        <span>LF</span>
        <div className="h-3 w-px bg-primary-400"></div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Docker</span>
        </div>
      </div>
    </div>
  );
}
