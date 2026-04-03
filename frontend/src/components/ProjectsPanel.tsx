import { useState, useEffect } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { projectsAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { Project } from '../types';

interface ProjectsPanelProps {
  onClose: () => void;
}

export default function ProjectsPanel({ onClose }: ProjectsPanelProps) {
  const { code, language, setCode, setLanguage, setCurrentProject } = useEditor();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      toast.warning('Please enter a project name');
      return;
    }

    try {
      await projectsAPI.create(projectName, code, language);
      toast.success('Project saved successfully!');
      setShowSaveModal(false);
      setProjectName('');
      loadProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save project');
    }
  };

  const handleLoadProject = (project: Project) => {
    setCode(project.code);
    setLanguage(project.language);
    setCurrentProject(project);
    toast.success(`Loaded project: ${project.name}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      loadProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-800">
      <div className="bg-dark-700 px-4 py-3 border-b border-dark-600 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Projects</h3>
        <button onClick={onClose} className="text-dark-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={() => setShowSaveModal(true)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded transition duration-200 text-sm"
        >
          Save Current Code
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
        {isLoading ? (
          <div className="text-dark-400 text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-dark-500 text-sm italic">No projects yet</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-dark-700 rounded-lg p-3 hover:bg-dark-600 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{project.name}</h4>
                  <p className="text-xs text-dark-400">{project.language}</p>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => handleLoadProject(project)}
                className="text-xs bg-dark-600 hover:bg-dark-500 text-white py-1 px-3 rounded transition"
              >
                Load
              </button>
            </div>
          ))
        )}
      </div>

      {showSaveModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Save Project</h3>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full bg-dark-700 text-white border border-dark-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
