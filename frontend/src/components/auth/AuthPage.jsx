import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Card, Button, Input, PasswordInput } from '../common';
import { authService } from '../../api/authService';
import { isValidEmailAddress, isValidPhoneNumber } from '../../utils/formatters';

export const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password' | 'signup'
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Senior Engineer AI & Automation');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const commonRoles = [
    'Senior Engineer AI & Automation',
    'Operations Manager',
    'Shift Supervisor',
    'Quality & Maintenance Lead',
    'Plant Engineer',
    'System Admin'
  ];

  // 1. Send Mobile WhatsApp OTP or Firebase Email Link
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanId = email.trim();
    if (!cleanId) {
      alert('⚠️ Please enter a valid email address or mobile number.');
      return setMsg('Please enter your mobile phone number or email address.');
    }

    const isEmail = cleanId.includes('@');
    const validEmail = isValidEmailAddress(cleanId);
    const validPhone = isValidPhoneNumber(cleanId);

    if (isEmail && !validEmail) {
      alert('⚠️ Invalid Email Format! Please enter a valid email address (e.g. name@company.com or name@gmail.com).');
      return setMsg('Please enter a valid email address.');
    }

    if (!isEmail && !validPhone) {
      alert('⚠️ Invalid Input! Please enter a valid email address (e.g. name@company.com) or mobile number with country code (e.g. +917358859792).');
      return setMsg('Please enter a valid email or mobile number.');
    }

    setLoading(true);
    setMsg('');
    setSuccessMsg('');
    setOtpCode('');

    // If email is entered, send real Firebase Sign-In Link directly to email inbox
    if (validEmail) {
      try {
        await authService.sendFirebaseSignInLink(cleanId);
        setSuccessMsg(`📧 Real Firebase Sign-In Link dispatched to ${cleanId}! Please check your email inbox / spam.`);
      } catch (fbErr) {
        console.warn('Firebase Email Link notice:', fbErr.message);
      }
    }

    // Backend OTP verification dispatch
    try {
      const data = await authService.sendOtp(cleanId);
      if (data.success) {
        setOtpSent(true);
        setOtpCode(data.otpPreview || '');
        const isPhone = !cleanId.includes('@');
        if (isPhone) {
          setSuccessMsg(`📱 Verification code dispatched to WhatsApp on ${cleanId}`);
        } else {
          setSuccessMsg(`🔐 Verification code generated: [ ${data.otpPreview} ] (Code pre-filled for instant sign-in)`);
        }
      } else {
        alert(`⚠️ Account Notice:\n\n${data.error || 'User not found. Please click + Register to create your account.'}`);
        setMsg(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      if (!validEmail) setMsg(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      alert('⚠️ Please enter the 6-digit verification code.');
      return setMsg('Please enter the 6-digit verification code you received.');
    }

    setLoading(true);
    setMsg('');

    try {
      const name = fullName.trim() || (email.includes('@') ? email.split('@')[0] : 'Engineer');
      const data = await authService.verifyOtp(email.trim(), otpCode.trim(), name, role.trim());

      if (data.success && data.user) {
        onLogin(data.user);
      } else {
        alert(`⚠️ Verification Failed:\n\n${data.error || 'Invalid verification code. Please check and try again.'}`);
        setMsg(data.error || 'Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setMsg(`Verification error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Firebase Email & Password / Registration Handler
  const handlePasswordAuth = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const isSignUp = authMode === 'signup';

    if (!cleanEmail) {
      alert('⚠️ Please enter your email address.');
      return setMsg('Please enter your email address.');
    }

    if (!isValidEmailAddress(cleanEmail)) {
      alert('⚠️ Invalid Email Address! Please enter a valid email address (e.g. name@company.com or name@gmail.com).');
      return setMsg('Please enter a valid email address.');
    }

    if (!password) {
      alert('⚠️ Please enter your password.');
      return setMsg('Please enter your password.');
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        alert('⚠️ Please enter your full name.');
        return setMsg('Please enter your full name.');
      }

      if (password.length < 6) {
        alert('⚠️ Password Too Short!\n\nPassword must be at least 6 characters long for security.');
        return setMsg('Password must be at least 6 characters long.');
      }

      if (!confirmPassword) {
        alert('⚠️ Please re-enter your password in the Confirm Password field to verify.');
        return setMsg('Please re-enter your password to verify.');
      }

      if (password !== confirmPassword) {
        alert('⚠️ Passwords Do Not Match!\n\nThe password and re-entered password do not match. Please verify both passwords.');
        return setMsg('Passwords do not match. Please re-enter your password.');
      }
    }

    setLoading(true);
    setMsg('');

    try {
      if (isSignUp) {
        const newUser = await authService.register(fullName, role, cleanEmail, password);
        alert(`🎉 Account Created!\n\nA Firebase verification link was sent to:\n${cleanEmail}\n\nPlease check your email inbox (and Spam folder) to verify!`);
        onLogin(newUser);
      } else {
        const user = await authService.login(cleanEmail, password);
        onLogin(user);
      }
    } catch (err) {
      alert(`⚠️ Authentication Notice:\n\n${err.message || 'Authentication failed.'}`);
      setMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 mb-2 shadow-lg shadow-amber-500/20">
            <Zap className="w-8 h-8 font-bold" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Reports Hub</h1>
          <p className="text-sm text-slate-400">Shift Automation & WhatsApp Delivery</p>
        </div>

        <Card className="border border-slate-800 space-y-5 bg-[#0a0d14]">
          {/* Auth Method Switcher */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setMsg(''); setSuccessMsg(''); setOtpCode(''); setOtpSent(false); }}
              className={`py-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                authMode === 'otp' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              📲 OTP Login
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setMsg(''); setSuccessMsg(''); }}
              className={`py-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                authMode === 'password' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔑 Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setMsg(''); setSuccessMsg(''); }}
              className={`py-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                authMode === 'signup'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              ➕ Register
            </button>
          </div>

          {msg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
              {msg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
              {successMsg}
            </div>
          )}

          {/* 1. MOBILE WHATSAPP / EMAIL OTP */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                <Input
                  label="Registered Mobile (WhatsApp) or Work Email"
                  type="text"
                  placeholder="Enter the email id or mobile number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  hint={otpSent ? '' : 'Enter your registered email id or mobile number'}
                />

                {otpSent && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      autoFocus
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-amber-300 font-mono tracking-widest text-center text-xl focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-400 text-center">Enter the 6-digit code received on your phone or email</p>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading
                    ? 'Processing...'
                    : otpSent
                    ? 'Verify Code & Sign In 🚀'
                    : '📲 Send Verification Code'}
                </Button>

                {otpSent && (
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpCode(''); }}
                    className="w-full text-center text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Change number / email or resend code
                  </button>
                )}
              </form>
            </div>
          )}

          {/* 2. PASSWORD LOGIN / SIGN UP */}
          {(authMode === 'password' || authMode === 'signup') && (
            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium">
                    📝 Register your profile and job role to access shift reports.
                  </div>

                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Designation / Job Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      {commonRoles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                      <option value="Custom Role">Custom Role...</option>
                    </select>
                  </div>

                  {role === 'Custom Role' && (
                    <Input
                      label="Specify Custom Job Role"
                      placeholder="e.g. Senior Automation Engineer"
                      value={role === 'Custom Role' ? '' : role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  )}
                </>
              )}

              <Input
                label="Work Email Address"
                type="email"
                placeholder="Enter the email id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password with View/Hide Eye Toggle */}
              <PasswordInput
                label={authMode === 'signup' ? 'Create Password' : 'Password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint={authMode === 'signup' ? 'Minimum 6 characters' : ''}
              />

              {/* Confirm Password (Only for Registration) */}
              {authMode === 'signup' && (
                <PasswordInput
                  label="Re-enter Password to Verify"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  hint="Must match the password above"
                />
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading
                  ? 'Authenticating...'
                  : authMode === 'signup'
                  ? '🚀 Register Account & Get Started'
                  : 'Sign In'}
              </Button>
            </form>
          )}

          {/* Quick Switcher Footer */}
          <div className="pt-3 border-t border-slate-800/80 text-center">
            {authMode !== 'signup' ? (
              <p className="text-xs text-slate-400">
                New user?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setMsg(''); setSuccessMsg(''); }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
                >
                  Create Account / Register Here ➔
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('otp'); setMsg(''); setSuccessMsg(''); }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign In with OTP or Password ➔
                </button>
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
