import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useScanFlow } from '../../context/ScanFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, authMode, closeAuthModal, setAuthMode, login, register } = useAuth();
  const { claimCurrentScan } = useScanFlow();
  const { t } = useLanguage();

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
          {authMode === 'login' ? t('welcomeBack') : t('createAccount')}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {authMode === 'login' ? t('signInDesc') : t('registerDesc')}
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
              <label className="input-label">{t('fullNameLabel')}</label>
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
            <label className="input-label">{t('emailLabel')}</label>
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
            <label className="input-label">{t('passwordLabel')}</label>
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
              t('processing')
            ) : authMode === 'login' ? (
              <>
                <LogIn size={18} /> {t('signIn')}
              </>
            ) : (
              <>
                <UserPlus size={18} /> {t('register')}
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          {authMode === 'login' ? (
            <>
              {t('dontHaveAccount')}{' '}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('register');
                }}
                style={{ padding: '0 4px', minHeight: 'auto', display: 'inline', fontWeight: '700' }}
              >
                {t('signUpLink')}
              </button>
            </>
          ) : (
            <>
              {t('alreadyRegistered')}{' '}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('login');
                }}
                style={{ padding: '0 4px', minHeight: 'auto', display: 'inline', fontWeight: '700' }}
              >
                {t('signInLink')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

