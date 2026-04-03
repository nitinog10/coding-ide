import { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { aiAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { AIAction } from '../types';

interface AIAssistPanelProps {
  onClose: () => void;
}

export default function AIAssistPanel({ onClose }: AIAssistPanelProps) {
  const { code, language, setCode } = useEditor();
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<AIAction>('explain');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.warning('Please enter a question');
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const result = await aiAPI.assist(query, { language, code }, action);
      setResponse(result.response);
      toast.success('AI response received!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'AI request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setCode(suggestion);
    toast.success('Suggestion applied to editor');
  };

  return (
    <div className="h-full flex flex-col bg-dark-800">
      <div className="bg-dark-700 px-4 py-3 border-b border-dark-600 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
        <button onClick={onClose} className="text-dark-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-dark-400 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as AIAction)}
              className="w-full bg-dark-700 text-white border border-dark-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="explain">Explain Code</option>
              <option value="debug">Debug Error</option>
              <option value="optimize">Optimize Code</option>
              <option value="convert">Convert Language</option>
              <option value="chat">General Question</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-dark-400 mb-1">Your Question</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about your code..."
              className="w-full bg-dark-700 text-white border border-dark-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Thinking...' : 'Get AI Help'}
          </button>
        </form>

        {response && (
          <div className="bg-dark-700 rounded-lg p-4 space-y-3">
            <div className="text-xs text-dark-400 mb-2">AI Response:</div>
            <div className="text-sm text-white whitespace-pre-wrap">{response}</div>
            
            {response.includes('```') && (
              <button
                onClick={() => {
                  const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
                  if (codeMatch) {
                    applySuggestion(codeMatch[1].trim());
                  }
                }}
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white py-1 px-3 rounded transition"
              >
                Apply to Editor
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
