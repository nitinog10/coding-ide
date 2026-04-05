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

  return (
    <div className="bg-primary-600 text-white px-4 py-1 flex items-center justify-between text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Ready</span>
        </div>
        <div>Lines: {lineCount}</div>
        <div>Characters: {charCount}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-semibold">{languageLabels[language]}</div>
        <div>UTF-8</div>
        <div>LF</div>
      </div>
    </div>
  );
}
