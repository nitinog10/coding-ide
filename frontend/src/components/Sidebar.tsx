import { useState } from 'react';

interface SidebarProps {
  activeView: 'explorer' | 'search' | 'git' | 'extensions';
  onViewChange: (view: 'explorer' | 'search' | 'git' | 'extensions') => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const icons = [
    { id: 'explorer' as const, icon: '📁', title: 'Explorer' },
    { id: 'search' as const, icon: '🔍', title: 'Search' },
    { id: 'git' as const, icon: '🔀', title: 'Source Control' },
    { id: 'extensions' as const, icon: '🧩', title: 'Extensions' }
  ];

  return (
    <div className="w-12 bg-dark-900 border-r border-dark-700 flex flex-col items-center py-2 gap-1">
      {icons.map(({ id, icon, title }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`w-10 h-10 flex items-center justify-center rounded hover:bg-dark-700 transition ${
            activeView === id ? 'bg-dark-700 border-l-2 border-primary-500' : ''
          }`}
          title={title}
        >
          <span className="text-xl">{icon}</span>
        </button>
      ))}
    </div>
  );
}
