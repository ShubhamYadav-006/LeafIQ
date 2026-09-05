import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useScanFlow } from '../../context/ScanFlowContext';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, authMode, closeAuthModal, setAuthMode, login, register } = useAuth();
  const { claimCurrentScan } = useScanFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      // Auto-claim any current guest scan so it is preserved in their account
      await claimCurrentScan();

      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          marginBottom: 0,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: 'var(--primary-hover)' }}>
          {authMode === 'login' ? 'Welcome Back Farmer' : 'Create LeafIQ Account'}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {authMode === 'login'
            ? 'Sign in to save your crop assessments and track scan history.'
            : 'Register your account to manage historical crop checks.'}
        </p>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#FFE3E3',
              color: '#C92A2A',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {authMode === 'register' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="farmer@leafiq.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
            {submitting ? (
              'Processing...'
            ) : authMode === 'login' ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Register Account
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          {authMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('register');
                }}
                style={{ padding: '0 4px', minHeight: 'auto', display: 'inline', fontWeight: '700' }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('login');
                }}
                style={{ padding: '0 4px', minHeight: 'auto', display: 'inline', fontWeight: '700' }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

