import React from 'react';

const TRAJECTORY_THEMES = {
  improving: {
    bg: '#EBFBEE',
    color: '#2B8A3E',
    icon: '📈',
    label: 'Improving',
  },
  stable: {
    bg: '#FFF9DB',
    color: '#E67700',
    icon: '➡️',
    label: 'Stable',
  },
  worsening: {
    bg: '#FFE3E3',
    color: '#C92A2A',
    icon: '📉',
    label: 'Worsening',
  },
  unclear: {
    bg: '#F1F3F5',
    color: '#495057',
    icon: '❓',
    label: 'Unclear',
  },
};

export const TrajectoryBadge = ({ trajectory = 'unclear' }) => {
  const theme = TRAJECTORY_THEMES[trajectory?.toLowerCase()] || TRAJECTORY_THEMES.unclear;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: '14px',
        fontWeight: '700',
        backgroundColor: theme.bg,
        color: theme.color,
      }}
    >
      <span>{theme.icon}</span>
      <span>{theme.label}</span>
    </span>
  );
};

export default TrajectoryBadge;
