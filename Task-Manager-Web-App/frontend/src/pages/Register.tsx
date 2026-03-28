import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
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

function AuthPreviewPanel() {
  return (
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
  );
}

export function Register() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminInviteToken, setAdminInviteToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleAvatarPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function clearAvatar() {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser({ name, email, password });
      navigate('/login');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split register-split">
      <div className="login-left">
        <header className="register-topbar">
          <span className="login-brand">Task Manager</span>
          <div className="register-guest" title="Guest">
            <span className="register-guest-avatar" />
            <span className="register-guest-label">Guest</span>
          </div>
        </header>

        <div className="login-form-area register-form-area">
          <h1 className="login-title">Create an Account</h1>
          <p className="login-subtitle">Join us today by entering your details below.</p>

          <div className="register-avatar-block">
            <button
              type="button"
              className="register-avatar-trigger"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload profile picture"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="register-avatar-img" />
              ) : (
                <span className="register-avatar-placeholder" />
              )}
            </button>
            {avatarPreview ? (
              <button
                type="button"
                className="register-avatar-remove"
                onClick={clearAvatar}
                aria-label="Remove profile picture"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
                </svg>
              </button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="register-avatar-input"
              onChange={handleAvatarPick}
            />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="register-form-grid">
              <div className="login-field">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="John"
                  required
                />
              </div>
              <div className="login-field">
                <label htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="login-field">
                <label htmlFor="reg-password">Password</label>
                <div className="login-password-wrap">
                  <input
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min 8 Characters"
                    minLength={8}
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
              <div className="login-field">
                <label htmlFor="reg-invite">Admin Invite Token</label>
                <input
                  id="reg-invite"
                  value={adminInviteToken}
                  onChange={(e) => setAdminInviteToken(e.target.value)}
                  autoComplete="off"
                  placeholder="6 Digit Code"
                />
              </div>
            </div>
            {error ? <p className="login-error">{error}</p> : null}
            <button type="submit" className="register-submit" disabled={loading}>
              {loading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </form>

          <p className="login-footer">
            Already have an account?{' '}
            <button type="button" className="login-footer-link" onClick={() => navigate('/login')}>
              Login
            </button>
          </p>
        </div>
      </div>

      <AuthPreviewPanel />
    </div>
  );
}
