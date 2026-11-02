import { useState } from 'react';
import { BookOpen, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '../api/auth';

const ResetPassword = () => {
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token') || '';
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!token) {
      setErrorMessage('This reset link is missing its token. Request a new one.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Your password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword({ token, newPassword });
      if (response.data?.success) {
        toast.success(response.data.message || 'Password reset successfully');
        navigate('/login', { replace: true });
      } else {
        setErrorMessage(response.data?.message || 'Unable to reset your password.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to reset your password.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand auth-brand"><span className="brand-mark"><BookOpen size={21} /></span><span>Kitabi<span>Keeda</span></span></Link>
        <div className="auth-heading">
          <span className="auth-heading-icon"><LockKeyhole size={21} /></span>
          <h1>Choose a new password</h1>
          <p>Use at least 6 characters to keep your account secure.</p>
        </div>
        {errorMessage && <div className="form-alert" role="alert">{errorMessage}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="new-password">New password</label>
          <div className="input-with-icon">
            <LockKeyhole size={18} />
            <input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 6 characters" />
            <button type="button" className="input-action" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <label htmlFor="confirm-new-password">Confirm new password</label>
          <div className="input-with-icon">
            <LockKeyhole size={18} />
            <input id="confirm-new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" />
          </div>
          <button type="submit" className="button button-primary auth-submit" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Updating…</> : 'Update password'}
          </button>
        </form>
        <p className="auth-footnote">Remembered your password? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;
