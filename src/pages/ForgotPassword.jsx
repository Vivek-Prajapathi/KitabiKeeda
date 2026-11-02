import { useState } from 'react';
import { ArrowLeft, BookOpen, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await authAPI.forgotPassword({ email: email.trim() });
      if (response.data?.success) {
        setSubmitted(true);
        toast.success(response.data.message || 'Password reset instructions sent');
      } else {
        setErrorMessage(response.data?.message || 'Unable to send reset instructions.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send reset instructions.';
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
          <span className="auth-heading-icon"><Mail size={21} /></span>
          <h1>Reset your password</h1>
          <p>Enter the email address linked to your account.</p>
        </div>
        {submitted ? (
          <div className="reset-success" role="status">
            <strong>Check your inbox</strong>
            <p>If an account exists for {email.trim()}, you’ll receive instructions to reset your password.</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {errorMessage && <div className="form-alert" role="alert">{errorMessage}</div>}
            <label htmlFor="reset-email">Email address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </div>
            <button type="submit" className="button button-primary auth-submit" disabled={loading}>
              {loading ? <><span className="button-spinner" /> Sending…</> : 'Send reset instructions'}
            </button>
          </form>
        )}
        <p className="auth-footnote"><Link to="/login"><ArrowLeft size={14} /> Back to sign in</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
