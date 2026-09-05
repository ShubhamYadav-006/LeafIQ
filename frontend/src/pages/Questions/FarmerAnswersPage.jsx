import React from 'react';
import { useScanFlow } from '../../context/ScanFlowContext';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export const FarmerAnswersPage = () => {
  const { farmerAnswers } = useScanFlow();

  return (
    <div className="card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '36px 24px' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <Sparkles size={32} color="var(--primary)" />
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '8px' }}>
        Synthesizing Multi-Signal Assessment...
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Combining visual leaf features with your field observations to formulate a reliable crop health diagnosis.
      </p>

      {/* Answer Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-base)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          textAlign: 'left',
          marginBottom: '24px',
          border: '1px solid var(--border)',
        }}
      >
        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
          Recorded Field Context:
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: 'var(--text-main)' }}>
          {Object.entries(farmerAnswers).map(([qId, val], idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>{Array.isArray(val) ? val.join(', ') : val}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>
        <Loader2 size={18} className="animate-spin" />
        <span>Generating Final Report & Action Plan...</span>
      </div>
    </div>
  );
};

export default FarmerAnswersPage;


