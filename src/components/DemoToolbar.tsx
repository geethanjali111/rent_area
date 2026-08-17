import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Shield, 
  Building, 
  UserCheck, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface DemoToolbarProps {
  currentUser: User | null;
  users: User[];
  onSwitchUser: (userId: string) => void;
  onOpenTests: () => void;
  onRunLifecycle: () => void;
  onResetDb: () => void;
  isLifecycleRunning?: boolean;
}

export const DemoToolbar: React.FC<DemoToolbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onOpenTests,
  onRunLifecycle,
  onResetDb,
  isLifecycleRunning
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Shield className="w-3 h-3" /> Platform Admin</span>;
      case 'OWNER':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><Building className="w-3 h-3" /> Landlord / Owner</span>;
      case 'TENANT':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><UserCheck className="w-3 h-3" /> Verified Tenant</span>;
    }
  };

  return (
    <div id="demo-toolbar" className="bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        
        {/* Left: Persona Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Persona:
          </div>

          <div className="relative">
            <button
              id="persona-selector-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              {currentUser && (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-600"
                />
              )}
              <span className="font-semibold text-white">{currentUser?.name || 'Select Persona'}</span>
              {currentUser && getRoleBadge(currentUser.role)}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div 
                id="persona-dropdown-menu"
                className="absolute left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 divide-y divide-slate-700/50"
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Testing Persona
                </div>
                <div className="py-1 space-y-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      id={`switch-to-${u.id}`}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                        u.id === currentUser?.id ? 'bg-slate-700/80 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-600" />
                        <div>
                          <p className="text-xs font-medium text-slate-100 leading-tight">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      <div>{getRoleBadge(u.role)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="run-tests-btn"
            onClick={onOpenTests}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:border-slate-500 cursor-pointer"
            title="Execute Platform & Security Test Suite"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Integrity & Security Tests</span>
          </button>

          <button
            id="run-lifecycle-btn"
            onClick={onRunLifecycle}
            disabled={isLifecycleRunning}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow transition cursor-pointer disabled:opacity-50"
          >
            {isLifecycleRunning ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Lifecycle...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Run 12-Step Lifecycle Demo</span>
              </>
            )}
          </button>

          <button
            id="reset-db-btn"
            onClick={onResetDb}
            className="flex items-center gap-1 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-700/50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Reset database to baseline seed"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>
        </div>

      </div>
    </div>
  );
};
