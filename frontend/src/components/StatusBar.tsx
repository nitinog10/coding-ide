import { SupportedLanguage } from '../types';

interface StatusBarProps {
  language: SupportedLanguage;
  line: number;
  column: number;
  isExecuting: boolean;
}

export default function StatusBar({ language, line, column, isExecuting }: StatusBarProps) {
  const languageLabels: Record<SupportedLanguage, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    cpp: 'C++',
    java: 'Java'
  };

  return (
    <div className="h-6 bg-primary-600 border-t border-primary-700 flex items-center justify-between px-3 text-xs text-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span>{isExecuting ? 'Running...' : 'Ready'}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span>{languageLabels[language]}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span>Ln {line}, Col {column}</span>
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  );
}
