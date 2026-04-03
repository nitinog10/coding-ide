import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import type { UserStats } from '../types';

interface HeaderProps {
  onToggleAI: () => void;
  onToggleProjects: () => void;
}

export default function Header({ onToggleAI, onToggleProjects }: HeaderProps) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await userAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-white">AI Coding IDE</h1>
          
          <button
            onClick={onToggleProjects}
            className="text-dark-300 hover:text-white transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Projects
          </button>

          <button
            onClick={onToggleAI}
            className="text-dark-300 hover:text-white transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Assist
          </button>
        </div>

        <div className="flex items-center gap-6">
          {stats && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-dark-400">Level {stats.level}</div>
                <div className="text-xs text-primary-400">{stats.xp} XP</div>
              </div>
              <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${(stats.xp % 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{user?.username}</div>
              <div className="text-xs text-dark-400">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="text-dark-400 hover:text-white transition"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
