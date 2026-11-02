import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Flame,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { login } from '../store/slices/authSlice';
import { setActiveBranch } from '../store/slices/branchSlice';
import { mockUsers, MockUserCredential } from '../utils/mockData';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('alex@ironpulsefitness.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      const origin = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async (selectedUser?: MockUserCredential) => {
    setError(null);
    setIsLoading(true);

    const targetEmail = selectedUser ? selectedUser.email : email.trim().toLowerCase();
    const targetPassword = selectedUser ? selectedUser.password : password;

    try {
      // First attempt authentication via live backend
      const res = await api.post('/auth/login', {
        email: targetEmail,
        password: targetPassword,
      });

      if (res.data?.success && res.data?.user) {
        const { user: backendUser, token } = res.data;
        dispatch(
          login({
            user: backendUser,
            token,
          })
        );
        if (backendUser.role === 'manager' && backendUser.assignedBranches?.length > 0) {
          dispatch(setActiveBranch(backendUser.assignedBranches[0]));
        } else if (backendUser.role === 'owner') {
          dispatch(setActiveBranch('all'));
        }

        const origin = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
        navigate(origin, { replace: true });
        return;
      }
    } catch (backendErr: any) {
      console.warn('Backend login fallback:', backendErr?.response?.data?.message || backendErr.message);
      if (backendErr.response?.status === 401 && !selectedUser) {
        setError(backendErr.response.data?.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }
    }

    // Fallback to local mock matching
    const matched = mockUsers.find(
      (u) => u.email.toLowerCase() === targetEmail && u.password === targetPassword
    );

    if (matched) {
      dispatch(
        login({
          user: matched.user,
          token: `jwt-${matched.user.role}-${Date.now()}`,
        })
      );
      // Switch to branch if manager
      if (matched.user.role === 'manager' && matched.user.assignedBranches.length > 0) {
        dispatch(setActiveBranch(matched.user.assignedBranches[0]));
      } else if (matched.user.role === 'owner') {
        dispatch(setActiveBranch('all'));
      }

      const origin = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(origin, { replace: true });
    } else {
      // If they typed something else, check if email matches any mock user
      const userByEmail = mockUsers.find((u) => u.email.toLowerCase() === targetEmail);
      if (userByEmail) {
        setError('Incorrect password. For testing, use: password123');
      } else {
        setError('Invalid credentials. Select one of the quick test accounts below.');
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 -left-36 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-36 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Left Side: Brand & Feature Highlights */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
                <Flame className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <h1 className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
                  IRON<span className="text-amber-400">PULSE</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Enterprise Fitness Management OS</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Branch Chain Ready</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Complete command of members, turnstiles & multi-branch cashflow.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamless real-time synchronization between biometric gates, WhatsApp communication,
                and centralized owner billing.
              </p>
            </div>

            {/* Platform Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-amber-400 shrink-0">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Biometric & RFID Hardware Sync</p>
                  <p className="text-slate-400 text-[11px]">Sub-second turnstile punch-in telemetry</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-emerald-400 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Multi-Location Central Ledger</p>
                  <p className="text-slate-400 text-[11px]">Consolidated branch collections & member transfers</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-sky-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Role-Based Access Control</p>
                  <p className="text-slate-400 text-[11px]">Owner, Manager, Front Desk & Head Coach views</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>IronPulse v2.4 Enterprise</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Right Side: Sign-In Form & Demo Accounts */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Staff Sign In</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or choose a quick demo account to test roles.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@ironpulsefitness.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember & Help */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('For demo mode, default test password is: password123')}
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Demo Access (1-Click)
                </span>
                <span className="text-[10px] text-amber-400/80">Click card to sign in</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {mockUsers.map((item) => (
                  <button
                    key={item.user.id}
                    type="button"
                    onClick={() => {
                      setEmail(item.email);
                      setPassword(item.password);
                      handleLogin(item);
                    }}
                    className="text-left p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40 transition group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-amber-500"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 truncate">
                          {item.user.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-amber-400/90 capitalize">
                        {item.user.role}
                      </span>
                      <span className="text-[9px] text-slate-500 group-hover:text-slate-300">
                        Sign In →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

