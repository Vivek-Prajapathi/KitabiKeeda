import { useState } from 'react';
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [visibleFields, setVisibleFields] = useState({ password: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (formData.password.length < 6) nextErrors.password = 'Use at least 6 characters.';
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register(formData.name.trim(), formData.email.trim(), formData.password);
      if (result?.success) {
        navigate('/activate-account', {
          state: {
            activationToken: result.activationToken,
            activationCode: result.activationCode,
            email: formData.email.trim(),
          },
        });
      } else if (result?.message) {
        setErrors((previous) => ({ ...previous, form: result.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (field) =>
    setVisibleFields((previous) => ({ ...previous, [field]: !previous[field] }));

  return (
    <div className="auth-page auth-page-register">
      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark"><BookOpen size={21} /></span>
          <span>Kitabi<span>Keeda</span></span>
        </Link>
        <div className="auth-heading">
          <span className="auth-heading-icon"><UserRound size={21} /></span>
          <h1>Create your account</h1>
          <p>Start building skills that move you forward.</p>
        </div>
        {errors.form && <div className="form-alert" role="alert">{errors.form}</div>}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-name">Full name</label>
          <div className={`input-with-icon ${errors.name ? 'has-error' : ''}`}>
            <UserRound size={18} />
            <input id="register-name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Your name" aria-invalid={Boolean(errors.name)} />
          </div>
          {errors.name && <span className="field-error">{errors.name}</span>}

          <label htmlFor="register-email">Email address</label>
          <div className={`input-with-icon ${errors.email ? 'has-error' : ''}`}>
            <Mail size={18} />
            <input id="register-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
          </div>
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label htmlFor="register-password">Password</label>
          <div className={`input-with-icon ${errors.password ? 'has-error' : ''}`}>
            <LockKeyhole size={18} />
            <input id="register-password" name="password" type={visibleFields.password ? 'text' : 'password'} autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" aria-invalid={Boolean(errors.password)} />
            <button type="button" className="input-action" onClick={() => toggleVisibility('password')} aria-label={visibleFields.password ? 'Hide password' : 'Show password'}>
              {visibleFields.password ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}

          <label htmlFor="register-confirm-password">Confirm password</label>
          <div className={`input-with-icon ${errors.confirmPassword ? 'has-error' : ''}`}>
            <LockKeyhole size={18} />
            <input id="register-confirm-password" name="confirmPassword" type={visibleFields.confirmPassword ? 'text' : 'password'} autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} placeholder="Enter your password again" aria-invalid={Boolean(errors.confirmPassword)} />
            <button type="button" className="input-action" onClick={() => toggleVisibility('confirmPassword')} aria-label={visibleFields.confirmPassword ? 'Hide password' : 'Show password'}>
              {visibleFields.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

          <button type="submit" className="button button-primary auth-submit" disabled={loading}>
            {loading ? <><span className="button-spinner" /> Creating account…</> : 'Create account'}
          </button>
        </form>
        <p className="auth-footnote">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Register;
