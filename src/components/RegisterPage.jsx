import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getPasswordStrength } from '../utils/authUtils';
import {
  ShieldCheck, Eye, EyeOff, LogIn, AlertCircle, Lock,
  User, Mail, CheckCircle2, ArrowLeft, Shield, ChevronRight,
  Fingerprint, Zap,
} from 'lucide-react';

// Animated background particles
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-indigo-500/10 dark:bg-indigo-400/5 animate-pulse"
          style={{
            width:  `${12 + (i * 7) % 40}px`,
            height: `${12 + (i * 7) % 40}px`,
            top:    `${(i * 17 + 5) % 90}%`,
            left:   `${(i * 13 + 3) % 90}%`,
            animationDelay:    `${(i * 0.4) % 3}s`,
            animationDuration: `${3 + (i * 0.3) % 3}s`,
          }}
        />
      ))}
    </div>
  );
}

// Password strength bar
function StrengthBar({ password }) {
  if (!password) return null;
  const { score, label, color, text, checks } = getPasswordStrength(password);
  const bars = [0, 1, 2, 3, 4];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex space-x-1">
        {bars.map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < score ? color : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold ${text}`}>{label}</span>
        <div className="flex items-center space-x-2">
          {Object.entries({ '8+ chars': checks.length, 'Uppercase': checks.uppercase, 'Number': checks.number, 'Symbol': checks.special }).map(([k, v]) => (
            <span key={k} className={`text-[10px] font-medium ${v ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
              {v ? '✓' : '○'} {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ───────────────────────────────────────────────────────────

export function RegisterPage() {
  const { register, setAuthView, roles } = useApp();

  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '', roleId: 'role-operator' });
  const [show, setShow]   = useState({ password: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      return setError('All fields are required.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return setError('Please enter a valid email address.');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    const { score } = getPasswordStrength(form.password);
    if (score < 2) {
      return setError('Password is too weak. Add uppercase, numbers, or symbols.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const result = await register({ name: form.name, email: form.email, password: form.password, roleId: form.roleId });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Registerable roles (exclude admin from self-registration)
  const selectableRoles = roles.filter(r => r.id !== 'role-admin');

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 px-4 relative">
        <Particles />
        <div className="w-full max-w-md text-center relative z-10">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/60 p-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 mb-5 ring-4 ring-emerald-200 dark:ring-emerald-900">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Created!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Your account for <span className="font-semibold text-slate-700 dark:text-slate-200">{form.email}</span> has been set up successfully. You can now sign in.
            </p>
            <button
              onClick={() => setAuthView('login')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 relative">
      <Particles />
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 flex-shrink-0" />

      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/30 mb-4 ring-4 ring-indigo-100 dark:ring-indigo-950">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create Your Account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join the Sentri Remote Reporting System</p>
          </div>

          {/* Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/60 p-8">

            {error && (
              <div className="mb-5 flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 animate-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="e.g. name@sentri.io"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role
                </label>
                <select
                  value={form.roleId}
                  onChange={e => update('roleId', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                >
                  {selectableRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">Administrator accounts are provisioned only by existing admins.</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={show.password ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {show.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <StrengthBar password={form.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={e => update('confirm', e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${
                      form.confirm && form.confirm !== form.password
                        ? 'border-rose-400 dark:border-rose-600'
                        : form.confirm && form.confirm === form.password
                        ? 'border-emerald-400 dark:border-emerald-600'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">Passwords do not match</p>
                )}
                {form.confirm && form.confirm === form.password && (
                  <p className="mt-1 text-[11px] text-emerald-500 font-medium flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Passwords match</span></p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-2"
              >
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Creating Account…</span></>
                ) : (
                  <><Fingerprint className="w-4 h-4" /><span>Create Account</span></>
                )}
              </button>
            </form>

            {/* Switch to login */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Already have an account?</p>
              <button
                onClick={() => setAuthView('login')}
                className="mt-1.5 flex items-center justify-center space-x-1 mx-auto text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /><span>Back to Sign In</span>
              </button>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-5 flex items-center justify-center space-x-2 text-xs text-slate-400 dark:text-slate-600">
            <Shield className="w-3.5 h-3.5" />
            <span>Passwords hashed with SHA-256 • Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}

