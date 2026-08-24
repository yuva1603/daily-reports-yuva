import { apiRequest } from './apiClient';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  sendEmailVerification,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile
} from '../firebase';

export const authService = {
  // Send OTP to Phone or Email
  async sendOtp(identifier) {
    const res = await apiRequest('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, phone: identifier, email: identifier })
    });
    return res.json();
  },

  // Verify OTP
  async verifyOtp(identifier, otp, name, role) {
    const res = await apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, name, role })
    });
    return res.json();
  },

  // Register in Firebase + Sync with Backend
  async register(fullName, role, email, password) {
    // 1. Firebase Authentication
    const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await fbUpdateProfile(userCred.user, { displayName: fullName.trim() });

    // 2. Dispatch real Firebase email verification
    try {
      await sendEmailVerification(userCred.user);
    } catch (e) {
      console.warn('Firebase email verification notice:', e.message);
    }

    // 3. Sync with Backend database
    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: fullName.trim(), role: role.trim(), email: email.trim(), password })
      });
    } catch (e) {
      console.warn('Backend sync notice:', e.message);
    }

    return {
      id: userCred.user.uid,
      name: fullName.trim(),
      email: email.trim(),
      role: role.trim(),
      is_admin: email.toLowerCase().includes('admin')
    };
  },

  // Sign In with Firebase + Fallback to Backend
  async login(email, password) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      return {
        id: userCred.user.uid,
        name: userCred.user.displayName || email.split('@')[0],
        email: userCred.user.email,
        role: 'Senior Engineer AI & Automation',
        is_admin: email.toLowerCase().includes('admin')
      };
    } catch (fbErr) {
      // Backend fallback
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        return data.user;
      }
      throw new Error(fbErr.message || data.error || 'Authentication failed');
    }
  },

  // Send Firebase Email Sign-in Link
  async sendFirebaseSignInLink(email) {
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true
    };
    await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email.trim());
  },

  // Logout
  async logout() {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e.message);
    }
  }
};
