import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      {/* Background mesh blobs */}
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="auth-logo mb-4">
            <IndianRupee className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SmartKhata</h1>
          <p className="text-sm text-slate-500 mt-1">Financial Year Ledger System</p>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">
          Sign in to your account
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-error mb-5"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="auth-label">
              Email address
            </label>
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="auth-label mb-0">
                Password
              </label>
            </div>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="auth-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="auth-eye-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="auth-submit-btn"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="auth-spinner" />
                Signing in…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </span>
            )}
          </button>
        </form>

        {/* Trust badges */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Encrypted &amp; secure
          </span>
          <span>·</span>
          <span>JWT protected</span>
        </div>

        {/* Footer links */}
        <div className="mt-7 border-t border-slate-100 pt-6 text-center space-y-2">
          <p className="text-sm text-slate-600">
            No account?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Create one free →
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            <Link to="/" className="hover:text-slate-700">
              ← Back to home
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
