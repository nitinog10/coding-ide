import { useState } from 'react';
import Header from '../components/Header';
import CodeEditor from '../components/CodeEditor';
import OutputConsole from '../components/OutputConsole';
import LanguageSelector from '../components/LanguageSelector';
import AIAssistPanel from '../components/AIAssistPanel';
import ProjectsPanel from '../components/ProjectsPanel';
import { useEditor } from '../contexts/EditorContext';
import { codeAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function Editor() {
  const { code, language, setOutput, isExecuting, setIsExecuting } = useEditor();
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showProjectsPanel, setShowProjectsPanel] = useState(false);

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

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <Header 
        onToggleAI={() => setShowAIPanel(!showAIPanel)}
        onToggleProjects={() => setShowProjectsPanel(!showProjectsPanel)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Projects Panel */}
        {showProjectsPanel && (
          <div className="w-80 border-r border-dark-700 overflow-y-auto">
            <ProjectsPanel onClose={() => setShowProjectsPanel(false)} />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-dark-800 border-b border-dark-700 p-4 flex items-center justify-between">
            <LanguageSelector />
            
            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExecuting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>

          {/* Editor and Output Split */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 border-r border-dark-700">
              <CodeEditor />
            </div>
            <div className="flex-1 lg:w-1/2">
              <OutputConsole />
            </div>
          </div>
        </div>

        {/* AI Assist Panel */}
        {showAIPanel && (
          <div className="w-96 border-l border-dark-700 overflow-y-auto">
            <AIAssistPanel onClose={() => setShowAIPanel(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
