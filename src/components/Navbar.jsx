import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  BookOpen, 
  ChevronDown, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export function Navbar() {
  const { 
    systemSettings, 
    currentView, 
    setCurrentView, 
    theme, 
    toggleTheme, 
    currentUser, 
    currentRole, 
    hasPermission,
    logout,
    setShowUserManualModal
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);

  // Admin tab is ONLY visible if user has any administrative permissions
  const canAccessAdmin = hasPermission('admin_fields') || 
    hasPermission('admin_dropdowns') || 
    hasPermission('manage_locations') || 
    hasPermission('admin_profiles') || 
    hasPermission('admin_roles') || 
    hasPermission('manage_system_settings');

  // Sentri Core module access (Section 18)
  const canAccessSentriCore = hasPermission('view_sentri_core');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & System Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer select-none group" 
          onClick={() => setCurrentView('dashboard')}
          title="Return to Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 transition-transform group-hover:scale-[1.02]">
            {systemSettings.logoUrl ? (
              <img src={systemSettings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-2 leading-none">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                {systemSettings.systemName || 'Sentri Remote Reporting System'}
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 leading-none">
                v{systemSettings.version || '1.0'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1 hidden sm:block">
              {systemSettings.tagline || 'Audit & Reporting Management System'}
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Dashboard */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="leading-none">Dashboard</span>
          </button>

          {/* Sentri Core Security Module (Only visible if permitted) */}
          {canAccessSentriCore && (
            <button
              onClick={() => setCurrentView('sentri_core')}
              className={`relative inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'sentri_core'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 shadow-xs ring-1 ring-rose-500/30'
                  : 'text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="leading-none">Sentri Core</span>
              <span className="flex h-2 w-2 relative ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </button>
          )}

          {/* Analytics */}
          <button
            onClick={() => setCurrentView('analytics')}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentView === 'analytics'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="leading-none">Analytics</span>
          </button>

          {/* Admin Tab (Completely hidden for lower accounts without admin permissions) */}
          {canAccessAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="leading-none">Admin</span>
            </button>
          )}
        </nav>

        {/* Action Controls & Profile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* User Manual Modal Trigger */}
          <button
            onClick={() => setShowUserManualModal(true)}
            title="View User Manual & Configuration"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="leading-none">Manual</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="inline-flex items-center space-x-2.5 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {currentUser?.avatar || 'U'}
              </div>
              <div className="text-left hidden md:flex md:flex-col justify-center">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold leading-tight">
                  {currentRole?.name}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-40">
                  
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {currentUser?.avatar || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{currentRole?.name}</span>
                          <span className="text-[10px] text-slate-400">• {currentRole?.permissions?.length || 0}/25 perms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1 px-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowUserManualModal(true);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>View 23-Section Operating Manual</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 px-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
