import { useState, useEffect } from 'react';
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [outputHeight, setOutputHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.warning('Please write some code first');
      return;
    }

    setIsExecuting(true);
    setOutput(null);

    try {
      console.log('Executing code:', { language, codeLength: code.length });
      const result = await codeAPI.execute(code, language);
      console.log('Execution result:', result);
      
      if (result && result.output) {
        setOutput(result.output);
        
        if (result.output.exitCode === 0) {
          toast.success('Code executed successfully!');
        } else {
          toast.error('Code execution failed - check output for errors');
        }
      } else {
        console.error('Invalid result format:', result);
        toast.error('Execution failed - invalid response format');
        setOutput({
          stdout: '',
          stderr: 'Execution failed - invalid response from server',
          exitCode: 1,
          executionTime: 0,
          memoryUsed: 0,
          timestamp: Date.now()
        });
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Execution failed';
      toast.error(`Execution failed: ${errorMessage}`);
      setOutput({
        stdout: '',
        stderr: `Error: ${errorMessage}\n\nMake sure the backend server is running on port 3000.`,
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

  const startResize = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY - 24; // 24px for status bar
        if (newHeight >= 100 && newHeight <= 600) {
          setOutputHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Top Menu Bar */}
      <div className="bg-dark-800 border-b border-dark-700 px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2">
            <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-semibold">CodeIDE</span>
          </div>
          
          <div className="flex items-center gap-0 text-xs text-dark-300">
            <button className="px-3 py-1 hover:bg-dark-700 rounded transition">File</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded transition">Edit</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded transition" onClick={() => setIsSidebarVisible(!isSidebarVisible)}>View</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded transition" onClick={handleRunCode}>Run</button>
            <button className="px-3 py-1 hover:bg-dark-700 rounded transition">Help</button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-dark-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Sidebar */}
        {isSidebarVisible && activeView === 'explorer' && (
          <div className="w-64 border-r border-dark-700">
            <FileExplorer onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <div className="bg-dark-800 border-b border-dark-700 flex items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-900 border-r border-dark-700 text-sm text-white min-w-0">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">{currentFile}</span>
              <button className="ml-auto hover:bg-dark-700 rounded p-0.5 flex-shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-dark-800 border-b border-dark-700 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LanguageSelector />
              
              <div className="h-4 w-px bg-dark-600"></div>
              
              <button
                onClick={handleRunCode}
                disabled={isExecuting}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
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

              <button className="flex items-center gap-1 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white rounded text-sm transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-dark-400">
              <span>Ln 1, Col 1</span>
              <div className="h-3 w-px bg-dark-600"></div>
              <span>UTF-8</span>
            </div>
          </div>

          {/* Editor and Output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0">
              <CodeEditor />
            </div>
            
            {/* Resizable Divider */}
            <div 
              className="h-1 bg-dark-700 hover:bg-primary-600 cursor-ns-resize transition-colors"
              onMouseDown={startResize}
            ></div>
            
            <div style={{ height: `${outputHeight}px` }} className="border-t border-dark-700 overflow-hidden">
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
