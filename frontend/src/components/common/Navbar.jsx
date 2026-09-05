import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { Sprout, History, LogIn, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { setCurrentStep, resetFlow } = useScanFlow();

  return (
    <header
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={resetFlow}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '20px',
            color: 'var(--primary)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sprout size={22} color="var(--primary)" />
          </div>
          <span>LeafIQ</span>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated && (
            <button
              onClick={() => setCurrentStep(STEPS.HISTORY)}
              className="btn btn-ghost"
              style={{ padding: '8px 12px', minHeight: '38px', fontSize: '14px' }}
            >
              <History size={18} />
              <span className="hide-mobile">Scan History</span>
            </button>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-base)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <User size={16} color="var(--primary)" />
                <span className="hide-mobile">{user.full_name || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="btn btn-ghost"
                title="Log Out"
                style={{ padding: '8px', minHeight: '38px', width: '38px' }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', minHeight: '38px', fontSize: '14px', width: 'auto' }}
            >
              <LogIn size={18} /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

