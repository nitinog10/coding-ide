import { useEditor } from '../contexts/EditorContext';
import type { SupportedLanguage } from '../types';

const languages: { value: SupportedLanguage; label: string; icon: string }[] = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '📜' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' }
];

export default function LanguageSelector() {
  const { language, setLanguage } = useEditor();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-dark-400">Language:</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        className="bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.icon} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
