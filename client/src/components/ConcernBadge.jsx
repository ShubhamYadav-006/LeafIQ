import React from 'react';

const CONCERN_THEMES = {
  Healthy: {
    bg: 'var(--badge-healthy-bg)',
    color: 'var(--badge-healthy-text)',
    icon: '🟢',
  },
  Monitor: {
    bg: 'var(--badge-monitor-bg)',
    color: 'var(--badge-monitor-text)',
    icon: '🟡',
  },
  'Attention Recommended': {
    bg: 'var(--badge-attention-bg)',
    color: 'var(--badge-attention-text)',
    icon: '🟠',
  },
  'High Concern': {
    bg: 'var(--badge-concern-bg)',
    color: 'var(--badge-concern-text)',
    icon: '🔴',
  },
  Uncertain: {
    bg: 'var(--badge-uncertain-bg)',
    color: 'var(--badge-uncertain-text)',
    icon: '⚪',
  },
};

export const ConcernBadge = ({ level = 'Uncertain', className = '' }) => {
  const theme = CONCERN_THEMES[level] || CONCERN_THEMES.Uncertain;

  return (
    <span
      className={`concern-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: theme.bg,
        color: theme.color,
      }}
    >
      <span>{theme.icon}</span>
      <span>{level}</span>
    </span>
  );
};

export default ConcernBadge;
