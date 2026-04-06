import { useState } from 'react';
import { toast } from 'react-toastify';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  onFileSelect: (file: FileNode) => void;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py': return '🐍';
    case 'js': return '📜';
    case 'ts': return '📘';
    case 'cpp': case 'c': case 'h': return '⚡';
    case 'java': return '☕';
    case 'html': return '🌐';
    case 'css': return '🎨';
    case 'json': return '📋';
    case 'md': return '📝';
    default: return '📄';
  }
};

export default function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: '1',
      name: 'workspace',
      type: 'folder',
      children: [
        { 
          id: '2', 
          name: 'hello.py', 
          type: 'file', 
          content: '# Python Hello World\nprint("Hello, World!")\nprint("Welcome to CodeIDE!")\n\n# Simple calculation\nfor i in range(1, 6):\n    print(f"Number: {i}, Square: {i**2}")', 
          language: 'python' 
        },
        { 
          id: '3', 
          name: 'app.js', 
          type: 'file', 
          content: '// JavaScript Hello World\nconsole.log("Hello, World!");\nconsole.log("Welcome to CodeIDE!");\n\n// Simple loop\nfor (let i = 1; i <= 5; i++) {\n    console.log(`Number: ${i}, Square: ${i * i}`);\n}', 
          language: 'javascript' 
        }
      ]
    },
    {
      id: '4',
      name: 'examples',
      type: 'folder',
      children: [
        { 
          id: '5', 
          name: 'fibonacci.cpp', 
          type: 'file', 
          content: '#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n\nint main() {\n    cout << "Fibonacci sequence:" << endl;\n    for (int i = 0; i < 10; i++) {\n        cout << "F(" << i << ") = " << fibonacci(i) << endl;\n    }\n    return 0;\n}', 
          language: 'cpp' 
        },
        { 
          id: '6', 
          name: 'HelloWorld.java', 
          type: 'file', 
          content: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        System.out.println("Welcome to CodeIDE!");\n        \n        // Simple loop\n        for (int i = 1; i <= 5; i++) {\n            System.out.println("Number: " + i + ", Square: " + (i * i));\n        }\n    }\n}', 
          language: 'java' 
        }
      ]
    }
  ]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '4']));
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const createNewFile = () => {
    if (!newFileName.trim()) {
      toast.warning('Please enter a file name');
      return;
    }

    const extension = newFileName.split('.').pop()?.toLowerCase();
    let language = 'javascript';
    
    if (extension === 'py') language = 'python';
    else if (extension === 'cpp' || extension === 'c' || extension === 'h') language = 'cpp';
    else if (extension === 'java') language = 'java';

    const newFile: FileNode = {
      id: Date.now().toString(),
      name: newFileName,
      type: 'file',
      content: '',
      language
    };

    setFiles([...files, newFile]);
    setNewFileName('');
    setShowNewFileInput(false);
    toast.success(`Created ${newFileName}`);
    onFileSelect(newFile);
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedFile === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-dark-700 cursor-pointer text-sm transition ${
            isSelected ? 'bg-dark-700 text-white' : 'text-dark-200'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              setSelectedFile(node.id);
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              <svg className={`w-4 h-4 text-dark-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </>
          ) : (
            <span className="text-base">{getFileIcon(node.name)}</span>
          )}
          <span className={isSelected ? 'font-medium' : ''}>{node.name}</span>
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-dark-900 flex flex-col">
      <div className="px-3 py-2 border-b border-dark-700 flex items-center justify-between">
        <span className="text-xs font-semibold text-dark-300 uppercase tracking-wide">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFileInput(true)}
            className="p-1 text-dark-400 hover:text-white hover:bg-dark-700 rounded transition"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            className="p-1 text-dark-400 hover:text-white hover:bg-dark-700 rounded transition"
            title="New Folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {showNewFileInput && (
        <div className="px-2 py-2 border-b border-dark-700 bg-dark-800">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createNewFile();
              if (e.key === 'Escape') {
                setShowNewFileInput(false);
                setNewFileName('');
              }
            }}
            placeholder="filename.ext"
            className="w-full bg-dark-900 text-white text-xs px-2 py-1.5 rounded border border-dark-600 focus:outline-none focus:border-primary-500"
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        {files.map(node => renderNode(node))}
      </div>
    </div>
  );
}
