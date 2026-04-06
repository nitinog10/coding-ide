import { useState } from 'react';
import { useEditor } from '../contexts/EditorContext';

type TabType = 'output' | 'terminal' | 'problems';

export default function OutputConsole() {
  const { output, isExecuting } = useEditor();
  const [activeTab, setActiveTab] = useState<TabType>('output');

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Tabs */}
      <div className="bg-dark-800 border-b border-dark-700 flex items-center px-2">
        <button
          onClick={() => setActiveTab('output')}
          className={`px-4 py-2 text-xs font-medium transition ${
            activeTab === 'output'
              ? 'text-white border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-4 py-2 text-xs font-medium transition ${
            activeTab === 'terminal'
              ? 'text-white border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2 text-xs font-medium transition ${
            activeTab === 'problems'
              ? 'text-white border-b-2 border-primary-500'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          Problems
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 font-mono text-sm">
        {activeTab === 'output' && (
          <>
            {isExecuting ? (
              <div className="flex items-center gap-2 text-primary-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Executing code...
              </div>
            ) : output ? (
              <div className="space-y-3">
                {output.stdout && (
                  <div>
                    <div className="text-xs text-green-400 mb-1 font-semibold">STDOUT:</div>
                    <pre className="text-green-300 whitespace-pre-wrap bg-dark-800 p-3 rounded border border-dark-700">{output.stdout}</pre>
                  </div>
                )}

                {output.stderr && (
                  <div>
                    <div className="text-xs text-red-400 mb-1 font-semibold">STDERR:</div>
                    <pre className="text-red-300 whitespace-pre-wrap bg-dark-800 p-3 rounded border border-red-900">{output.stderr}</pre>
                  </div>
                )}

                <div className="flex gap-6 text-xs pt-2 border-t border-dark-700">
                  <div className="flex items-center gap-2">
                    <span className="text-dark-400">Exit Code:</span>
                    <span className={`font-semibold ${output.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {output.exitCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-dark-400">Time:</span>
                    <span className="text-white font-semibold">{output.executionTime}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-dark-400">Memory:</span>
                    <span className="text-white font-semibold">{(output.memoryUsed / 1024 / 1024).toFixed(2)}MB</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-dark-500 italic flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run your code to see output here...
              </div>
            )}
          </>
        )}

        {activeTab === 'terminal' && (
          <div className="text-dark-500 italic">Terminal not available in this mode</div>
        )}

        {activeTab === 'problems' && (
          <div className="text-dark-500 italic">No problems detected</div>
        )}
      </div>
    </div>
  );
}
