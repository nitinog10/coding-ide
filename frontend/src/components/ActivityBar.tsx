interface ActivityBarProps {
  activeView: 'explorer' | 'search' | 'git' | 'extensions';
  onViewChange: (view: 'explorer' | 'search' | 'git' | 'extensions') => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const icons = [
    { id: 'explorer' as const, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ), title: 'Explorer' },
    { id: 'search' as const, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ), title: 'Search' },
    { id: 'git' as const, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ), title: 'Source Control' },
    { id: 'extensions' as const, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ), title: 'Extensions' }
  ];

  return (
    <div className="w-12 bg-dark-900 border-r border-dark-800 flex flex-col items-center py-2 gap-2">
      {icons.map(({ id, icon, title }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`p-2 rounded transition-colors ${
            activeView === id
              ? 'bg-dark-700 text-primary-400'
              : 'text-dark-400 hover:text-white'
          }`}
          title={title}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
