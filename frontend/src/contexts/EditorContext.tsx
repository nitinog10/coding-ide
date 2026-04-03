import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SupportedLanguage, ExecutionResult, Project } from '../types';

interface EditorContextType {
  code: string;
  setCode: (code: string) => void;
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  output: ExecutionResult | null;
  setOutput: (output: ExecutionResult | null) => void;
  isExecuting: boolean;
  setIsExecuting: (isExecuting: boolean) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<string>('');
  const [language, setLanguageState] = useState<SupportedLanguage>('python');
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('editorCode');
    const savedLanguage = localStorage.getItem('editorLanguage');

    if (savedCode) setCodeState(savedCode);
    if (savedLanguage) setLanguageState(savedLanguage as SupportedLanguage);
  }, []);

  const setCode = (newCode: string) => {
    setCodeState(newCode);
    localStorage.setItem('editorCode', newCode);
  };

  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem('editorLanguage', newLanguage);
  };

  return (
    <EditorContext.Provider
      value={{
        code,
        setCode,
        language,
        setLanguage,
        output,
        setOutput,
        isExecuting,
        setIsExecuting,
        currentProject,
        setCurrentProject
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
