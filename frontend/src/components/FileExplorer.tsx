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

export default function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: '1',
      name: 'src',
      type: 'folder',
      children: [
        { id: '2', name: 'main.py', type: 'file', content: '# Python code here\nprint("Hello World")', language: 'python' },
        { id: '3', name: 'app.js', type: 'file', content: '// JavaScript code\nconsole.log("Hello World");', language: 'javascript' }
      ]
    },
    {
      id: '4',
      name: 'examples',
      type: 'folder',
      children: [
        { id: '5', name: 'hello.cpp', type: 'file', content: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}', language: 'cpp' },
        { id: '6', name: 'Main.java', type: 'file', content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}', language: 'java' }
      ]
    }
  ]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '4']));
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);

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

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-dark-700 cursor-pointer text-sm`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                {isExpanded ? (
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                )}
              </svg>
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </>
          )}
          <span className="text-dark-200">{node.name}</span>
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

      {showNewFileInput && (
        <div className="px-2 py-2 border-b border-dark-700">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createNewFile();
              if (e.key === 'Escape') setShowNewFileInput(false);
            }}
            placeholder="filename.ext"
            className="w-full bg-dark-800 text-white text-xs px-2 py-1 rounded border border-dark-600 focus:outline-none focus:border-primary-500"
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {files.map(node => renderNode(node))}
      </div>
    </div>
  );
}
