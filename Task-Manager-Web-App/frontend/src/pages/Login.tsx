import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { getErrorMessage } from '../utils/error';

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-left">
        <div className="login-brand">Task Manager</div>
        <div className="login-form-area">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Please enter your details to log in</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-password-wrap">
                <input
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Min 8 Characters"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>
            {error ? <p className="login-error">{error}</p> : null}
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <p className="login-footer">
            Don&apos;t have an account?{' '}
            <button type="button" className="login-footer-link" onClick={() => navigate('/register')}>
              SignUp
            </button>
          </p>
        </div>
      </div>

      <div className="login-right" aria-hidden="true">
        <div className="login-right-bg" />
        <div className="login-preview">
          <div className="login-preview-line login-preview-line-1" />
          <div className="login-preview-card login-preview-card-top">
            <div className="login-preview-tags">
              <span className="tag tag-pending">Pending</span>
              <span className="tag tag-priority">Medium Priority</span>
            </div>
            <h4>Social Media Campaign</h4>
            <p className="login-preview-desc">Planning content calendar for Q1 product launch.</p>
            <div className="login-preview-progress">
              <span>Task Done 4/10</span>
              <div className="login-preview-bar">
                <div className="login-preview-bar-fill" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="login-preview-meta">
              <span>Start: Jan 15</span>
              <span>Due: Feb 28</span>
            </div>
            <div className="login-preview-avatars">
              <span className="avatar-dot" />
              <span className="avatar-dot" />
              <span className="avatar-dot" />
            </div>
          </div>

          <div className="login-preview-users">
            <div className="login-preview-user">
              <span className="user-avatar" />
              <div>
                <strong>Adam Cole</strong>
                <span>adam@timetoprogram.com</span>
              </div>
            </div>
            <div className="login-preview-user">
              <span className="user-avatar user-avatar-alt" />
              <div>
                <strong>Luke Ryan</strong>
                <span>luke@timetoprogram.com</span>
              </div>
            </div>
          </div>

          <div className="login-preview-line login-preview-line-2" />

          <div className="login-preview-card login-preview-card-bottom">
            <div className="login-preview-tags">
              <span className="tag tag-pending">Pending</span>
              <span className="tag tag-priority">Medium Priority</span>
            </div>
            <h4>Social Media Campaign</h4>
            <p className="login-preview-desc">Scheduling posts across LinkedIn and Twitter.</p>
            <div className="login-preview-progress">
              <span>Task Done 4/10</span>
              <div className="login-preview-bar">
                <div className="login-preview-bar-fill" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="login-preview-meta">
              <span>Start: Jan 15</span>
              <span>Due: Feb 28</span>
            </div>
            <div className="login-preview-avatars">
              <span className="avatar-dot" />
              <span className="avatar-dot" />
              <span className="avatar-dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
