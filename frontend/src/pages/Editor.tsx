import { useState } from 'react';
import ActivityBar from '../components/ActivityBar';
import FileExplorer from '../components/FileExplorer';
import CodeEditor from '../components/CodeEditor';
import OutputConsole from '../components/OutputConsole';
import StatusBar from '../components/StatusBar';
import LanguageSelector from '../components/LanguageSelector';
import { useEditor } from '../contexts/EditorContext';
import { codeAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function Editor() {
  const { code, language, setCode, setLanguage, setOutput, isExecuting, setIsExecuting } = useEditor();
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'git' | 'extensions'>('explorer');
  const [currentFile, setCurrentFile] = useState('untitled.py');

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.warning('Please write some code first');
      return;
    }

    setIsExecuting(true);
    setOutput(null);

    try {
      const result = await codeAPI.execute(code, language);
      setOutput(result.output);
      
      if (result.success) {
        toast.success('Code executed successfully!');
      } else {
        toast.error('Code execution failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Execution failed');
      setOutput({
        stdout: '',
        stderr: error.response?.data?.error || 'Execution failed',
        exitCode: 1,
        executionTime: 0,
        memoryUsed: 0,
        timestamp: Date.now()
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFileSelect = (file: any) => {
    setCurrentFile(file.name);
    setCode(file.content || '');
    if (file.language) {
      setLanguage(file.language);
    }
    toast.info(`Opened ${file.name}`);
  };

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Top Menu Bar */}
      <div className="bg-dark-800 border-b border-dark-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold text-lg">AI Code IDE</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-dark-300">
            <button className="px-3 py-1 hover:bg-dark-700 rounded">File</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded">Edit</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded">View</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded">Run</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded">Help</button>
          </div>
        </div>

        <div className="text-xs text-dark-400">No Auth Mode</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Sidebar */}
        {activeView === 'explorer' && (
          <div className="w-64">
            <FileExplorer onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="bg-dark-800 border-b border-dark-700 flex items-center px-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-900 border-r border-dark-700 text-sm text-white">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {currentFile}
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-dark-800 border-b border-dark-700 px-4 py-2 flex items-center justify-between">
            <LanguageSelector />
            
            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>

          {/* Editor and Output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1">
              <CodeEditor />
            </div>
            <div className="h-64 border-t border-dark-700">
              <OutputConsole />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
