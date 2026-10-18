import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLockoutInfo } from '../utils/authUtils';
import {
  ShieldCheck, Eye, EyeOff, LogIn, AlertCircle,
  Lock, Mail, Shield, UserPlus, Fingerprint, Activity,
} from 'lucide-react';

// Animated particles for depth
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-indigo-500/10 dark:bg-indigo-400/5 animate-pulse"
          style={{
            width:             `${10 + (i * 9) % 44}px`,
            height:            `${10 + (i * 9) % 44}px`,
            top:               `${(i * 19 + 3) % 92}%`,
            left:              `${(i * 11 + 5) % 90}%`,
            animationDelay:    `${(i * 0.45) % 3}s`,
            animationDuration: `${3 + (i * 0.35) % 2.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Countdown timer for lockout display
function LockoutTimer({ remainingMs, onExpired }) {
  const [ms, setMs] = useState(remainingMs);
  useEffect(() => {
    if (ms <= 0) { onExpired(); return; }
    const id = setInterval(() => setMs(p => { if (p <= 1000) { onExpired(); return 0; } return p - 1000; }), 1000);
    return () => clearInterval(id);
  }, []);
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return (
    <div className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center space-x-2 mb-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-xs font-semibold">Account Temporarily Locked</span>
      </div>
      <p className="text-xs text-rose-600 dark:text-rose-400">
        Too many failed attempts. Try again in{' '}
        <span className="font-bold font-mono">{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
      </p>
    </div>
  );
}

export function LoginPage() {
  const { login, setAuthView, systemSettings } = useApp();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [rememberMe,  setRememberMe]  = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [lockout,     setLockout]     = useState(() => getLockoutInfo());

  // Re-check lockout every second when locked
  useEffect(() => {
    if (!lockout.locked) return;
    const id = setInterval(() => {
      const info = getLockoutInfo();
      setLockout(info);
      if (!info.locked) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [lockout.locked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const currentLockout = getLockoutInfo();
    if (currentLockout.locked) {
      setLockout(currentLockout);
      return;
    }
    if (!email.trim() || !password) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password, rememberMe);
      if (!result.success) {
        setError(result.message || 'Invalid credentials. Please try again.');
        setLockout(getLockoutInfo());
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sysName = systemSettings?.systemName || 'Sentri Remote Reporting System';
  const tagline = systemSettings?.tagline    || 'Audit & Reporting Management System';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 relative">
      <Particles />

      {/* Top accent bar with pulse */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 flex-shrink-0" />

      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-md">

          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-700 via-indigo-500 to-violet-500 shadow-2xl shadow-indigo-500/40 flex items-center justify-center ring-4 ring-indigo-100 dark:ring-indigo-950">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              {/* Live dot */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-950" />
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{sysName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{tagline}</p>

            {/* Security indicator */}
            <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
              <Lock className="w-3 h-3 text-indigo-500" />
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Secured Login Required</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/60 p-8">

            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-0.5">Sign in to your account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Enter your registered email and password.</p>

            {/* Lockout timer */}
            {lockout.locked && (
              <LockoutTimer remainingMs={lockout.remainingMs} onExpired={() => setLockout({ locked: false, remainingMs: 0 })} />
            )}

            {/* Error banner */}
            {!lockout.locked && error && (
              <div className="mb-5 flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 animate-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="your.email@sentri.io"
                    disabled={lockout.locked || loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    disabled={lockout.locked || loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center space-x-2.5">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={lockout.locked}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Remember me on this device
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || lockout.locked}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-1"
              >
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Verifying…</span></>
                ) : (
                  <><Fingerprint className="w-4 h-4" /><span>Sign In</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center space-x-3 my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Register link */}
            <button
              onClick={() => setAuthView('register')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Create New Account</span>
            </button>
          </div>

          {/* System status footer */}
          <div className="mt-5 flex items-center justify-center space-x-4 text-[11px] text-slate-400 dark:text-slate-600">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>System Online</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5">
              <Shield className="w-3 h-3" />
              <span>RBAC Active (25 Permissions)</span>
            </span>
            <span>•</span>
            <span>v{systemSettings?.version || '1.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
