import { useEditor } from '../contexts/EditorContext';

export default function OutputConsole() {
  const { output, isExecuting } = useEditor();

  return (
    <div className="h-full flex flex-col bg-dark-800">
      <div className="bg-dark-700 px-4 py-2 border-b border-dark-600">
        <h3 className="text-sm font-semibold text-white">Output</h3>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {isExecuting ? (
          <div className="flex items-center gap-2 text-primary-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Executing code...
          </div>
        ) : output ? (
          <div className="space-y-4">
            {output.stdout && (
              <div>
                <div className="text-xs text-green-400 mb-1">STDOUT:</div>
                <pre className="text-green-300 whitespace-pre-wrap">{output.stdout}</pre>
              </div>
            )}

            {output.stderr && (
              <div>
                <div className="text-xs text-red-400 mb-1">STDERR:</div>
                <pre className="text-red-300 whitespace-pre-wrap">{output.stderr}</pre>
              </div>
            )}

            <div className="flex gap-6 text-xs text-dark-400 pt-2 border-t border-dark-700">
              <div>
                Exit Code: <span className={output.exitCode === 0 ? 'text-green-400' : 'text-red-400'}>{output.exitCode}</span>
              </div>
              <div>
                Time: <span className="text-white">{output.executionTime}ms</span>
              </div>
              <div>
                Memory: <span className="text-white">{(output.memoryUsed / 1024 / 1024).toFixed(2)}MB</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-dark-500 italic">
            Run your code to see output here...
          </div>
        )}
      </div>
    </div>
  );
}
