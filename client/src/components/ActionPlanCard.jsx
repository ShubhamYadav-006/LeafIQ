import React from 'react';
import { AlertTriangle, CheckCircle, Shield, UserCheck, AlertCircle } from 'lucide-react';

export const ActionPlanCard = ({ actionPlan }) => {
  if (!actionPlan) return null;

  return (
    <div className="action-plan-wrapper" style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary-hover)' }}>
        📋 Recommended Action Plan
      </h3>

      {/* Tier 1: Immediate Actions */}
      {actionPlan.immediate_actions && actionPlan.immediate_actions.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #D9480F', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={20} color="#D9480F" />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#D9480F' }}>
              Immediate Steps (Do Today)
            </h4>
          </div>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-main)', fontSize: '15px' }}>
            {actionPlan.immediate_actions.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tier 2: Monitoring Steps */}
      {actionPlan.monitoring_steps && actionPlan.monitoring_steps.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #E67700', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={20} color="#E67700" />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#E67700' }}>
              What to Monitor (Next 3–5 Days)
            </h4>
          </div>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-main)', fontSize: '15px' }}>
            {actionPlan.monitoring_steps.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tier 3: Prevention */}
      {actionPlan.prevention_steps && actionPlan.prevention_steps.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #2B8A3E', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Shield size={20} color="#2B8A3E" />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#2B8A3E' }}>
              Long-term Prevention
            </h4>
          </div>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-main)', fontSize: '15px' }}>
            {actionPlan.prevention_steps.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expert Guidance Callout */}
      {actionPlan.expert_guidance && (
        <div
          style={{
            backgroundColor: 'var(--primary-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            gap: '12px',
          }}
        >
          <UserCheck size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h5 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '4px' }}>
              When to Consult an Agricultural Expert
            </h5>
            <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>{actionPlan.expert_guidance}</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {actionPlan.disclaimer && (
        <div
          style={{
            backgroundColor: '#F1F3F5',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{actionPlan.disclaimer}</span>
        </div>
      )}
    </div>
  );
};

export default ActionPlanCard;
