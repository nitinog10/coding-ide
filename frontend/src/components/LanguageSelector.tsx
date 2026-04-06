import { useEditor } from '../contexts/EditorContext';
import type { SupportedLanguage } from '../types';

const languages: { value: SupportedLanguage; label: string; icon: string; color: string }[] = [
  { value: 'python', label: 'Python', icon: '🐍', color: 'text-blue-400' },
  { value: 'javascript', label: 'JavaScript', icon: '📜', color: 'text-yellow-400' },
  { value: 'cpp', label: 'C++', icon: '⚡', color: 'text-purple-400' },
  { value: 'java', label: 'Java', icon: '☕', color: 'text-red-400' }
];

export default function LanguageSelector() {
  const { language, setLanguage } = useEditor();
  const currentLang = languages.find(l => l.value === language);

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-dark-400 font-medium">Language:</label>
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="appearance-none bg-dark-700 text-white border border-dark-600 rounded px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:bg-dark-600 transition"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.icon} {lang.label}
            </option>
          ))}
        </select>
        <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
