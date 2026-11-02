import { useState } from 'react';
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.success) {
        navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setErrorMessage(result?.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark"><BookOpen size={21} /></span>
          <span>Kitabi<span>Keeda</span></span>
        </Link>
        <div className="auth-heading">
          <span className="auth-heading-icon"><LockKeyhole size={21} /></span>
          <h1>Welcome back</h1>
          <p>Sign in to continue your learning journey.</p>
        </div>
        {errorMessage && <div className="form-alert" role="alert">{errorMessage}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <div className="input-with-icon">
            <Mail size={18} />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <label htmlFor="login-password">Password</label>
          <div className="input-with-icon">
            <LockKeyhole size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="auth-inline-link">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" className="button button-primary auth-submit" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Signing in…</> : 'Sign in'}
          </button>
        </form>
        <p className="auth-footnote">New to KitabiKeeda? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
};

export default Login;
