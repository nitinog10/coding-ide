import { useState } from 'react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  onFileSelect: (file: FileNode) => void;
}

export default function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'main.py', type: 'file', content: '# Python code here\nprint("Hello World")', language: 'python' },
        { name: 'app.js', type: 'file', content: '// JavaScript code\nconsole.log("Hello World");', language: 'javascript' }
      ]
    },
    {
      name: 'examples',
      type: 'folder',
      children: [
        { name: 'hello.cpp', type: 'file', content: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}', language: 'cpp' },
        { name: 'Main.java', type: 'file', content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}', language: 'java' }
      ]
    }
  ]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['src', 'examples']));
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const createNewFile = () => {
    if (!newFileName.trim()) return;
    
    const extension = newFileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'py': 'python',
      'js': 'javascript',
      'cpp': 'cpp',
      'java': 'java'
    };

    const newFile: FileNode = {
      name: newFileName,
      type: 'file',
      content: '',
      language: languageMap[extension || ''] || 'javascript'
    };

    setFiles([...files, newFile]);
    setNewFileName('');
    setShowNewFileInput(false);
    onFileSelect(newFile);
  };

  const renderNode = (node: FileNode, path: string = '') => {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expanded.has(fullPath);

    if (node.type === 'folder') {
      return (
        <div key={fullPath}>
          <div
            onClick={() => toggleFolder(fullPath)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-dark-700 cursor-pointer text-sm"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span className="text-dark-200">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div className="ml-4">
              {node.children.map(child => renderNode(child, fullPath))}
            </div>
          )}
        </div>
      );
    }

    const getFileIcon = (name: string) => {
      if (name.endsWith('.py')) return '🐍';
      if (name.endsWith('.js')) return '📜';
      if (name.endsWith('.cpp')) return '⚡';
      if (name.endsWith('.java')) return '☕';
      return '📄';
    };

    return (
      <div
        key={fullPath}
        onClick={() => onFileSelect(node)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-dark-700 cursor-pointer text-sm"
      >
        <span className="ml-6">{getFileIcon(node.name)}</span>
        <span className="text-dark-200">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="h-full bg-dark-900 border-r border-dark-700 flex flex-col">
      <div className="px-3 py-2 border-b border-dark-700 flex items-center justify-between">
        <span className="text-xs font-semibold text-dark-400 uppercase">Explorer</span>
        <button
          onClick={() => setShowNewFileInput(true)}
          className="text-dark-400 hover:text-white"
          title="New File"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {files.map(node => renderNode(node))}
      </div>

      {showNewFileInput && (
        <div className="p-3 border-t border-dark-700">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createNewFile();
              if (e.key === 'Escape') setShowNewFileInput(false);
            }}
            placeholder="filename.py"
            className="w-full bg-dark-800 text-white text-sm px-2 py-1 rounded border border-dark-600 focus:outline-none focus:border-primary-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={createNewFile}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs py-1 rounded"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewFileInput(false)}
              className="flex-1 bg-dark-700 hover:bg-dark-600 text-white text-xs py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
