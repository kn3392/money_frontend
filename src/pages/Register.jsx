import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  AlertCircle,
  IndianRupee,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-400' };
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-400' };
  return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card w-full max-w-md"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="auth-logo mb-4">
            <IndianRupee className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SmartKhata</h1>
          <p className="text-sm text-slate-500 mt-1">Financial Year Ledger System</p>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">
          Create your free account
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
          {/* Name */}
          <div>
            <label htmlFor="reg-name" className="auth-label">
              Full name
            </label>
            <div className="auth-input-wrap">
              <UserRound className="auth-input-icon" />
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nilesh Kachhadiya"
                className="auth-input"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="auth-label">
              Email address
            </label>
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />
              <input
                id="reg-email"
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
            <label htmlFor="reg-password" className="auth-label">
              Password
            </label>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
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

            {/* Strength meter */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.level ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Strength:{' '}
                  <span
                    className={`font-medium ${
                      strength.level <= 1
                        ? 'text-red-600'
                        : strength.level <= 2
                        ? 'text-amber-600'
                        : strength.level <= 3
                        ? 'text-yellow-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm" className="auth-label">
              Confirm password
            </label>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className={`auth-input pr-12 ${
                  passwordMismatch ? 'border-red-300 focus:ring-red-300' : ''
                } ${passwordsMatch ? 'border-emerald-300 focus:ring-emerald-300' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="auth-eye-btn"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {passwordsMatch && (
                <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              )}
            </div>
            {passwordMismatch && (
              <p className="mt-1.5 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || Boolean(passwordMismatch)}
            className="auth-submit-btn"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="auth-spinner" />
                Creating account…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create account
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-7 border-t border-slate-100 pt-6 text-center space-y-2">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Sign in →
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
