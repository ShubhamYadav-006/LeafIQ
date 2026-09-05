import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CONCERN_THEMES = {
  healthy: {
    bg: 'var(--badge-healthy-bg)',
    color: 'var(--badge-healthy-text)',
    icon: '🟢',
  },
  monitor: {
    bg: 'var(--badge-monitor-bg)',
    color: 'var(--badge-monitor-text)',
    icon: '🟡',
  },
  attention: {
    bg: 'var(--badge-attention-bg)',
    color: 'var(--badge-attention-text)',
    icon: '🟠',
  },
  high_concern: {
    bg: 'var(--badge-concern-bg)',
    color: 'var(--badge-concern-text)',
    icon: '🔴',
  },
  uncertain: {
    bg: 'var(--badge-uncertain-bg)',
    color: 'var(--badge-uncertain-text)',
    icon: '⚪',
  },
};

export const ConcernBadge = ({ level = 'uncertain', className = '' }) => {
  const { translateConcern } = useLanguage();
  const normKey = level.toLowerCase().replace(/\s+/g, '_');
  const theme = CONCERN_THEMES[normKey] || CONCERN_THEMES[level] || CONCERN_THEMES.uncertain;
  const translatedLabel = translateConcern(normKey);

  return (
    <span
      className={`concern-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: '13px',
        fontWeight: '700',
        backgroundColor: theme.bg,
        color: theme.color,
      }}
    >
      <span>{theme.icon}</span>
      <span>{translatedLabel}</span>
    </span>
  );
};

export default ConcernBadge;

