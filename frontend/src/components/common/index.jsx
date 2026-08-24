import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Card = ({ children, className = '' }) => (
  <div className={`glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button' }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98]',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 active:scale-[0.98]',
    outline: 'border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 active:scale-[0.98]',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 active:scale-[0.98]'
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Input = ({ label, placeholder, value, onChange, type = 'text', hint = '', className = '', autoComplete, disabled = false }) => (
  <div className="w-full space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete || (type === 'password' ? 'current-password' : type === 'email' ? 'username' : 'on')}
      className={`w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

export const PasswordInput = ({ label, placeholder, value, onChange, hint = '', className = '', autoComplete, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder || '••••••••'}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete || 'current-password'}
          className={`w-full px-4 py-2.5 pr-11 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition p-1 cursor-pointer focus:outline-none"
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
};

export const TextArea = ({ label, placeholder, value, onChange, rows = 4, className = '' }) => (
  <div className="w-full space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-4 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none text-sm transition ${className}`}
    />
  </div>
);

export const Badge = ({ children, variant = 'neutral' }) => {
  const styles = {
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    neutral: 'bg-slate-900 text-slate-300 border-slate-800'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
};
