import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export const AIAnalysisPage = () => {
  const { previewUrl } = useScanFlow();

  return (
    <div className="card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '36px 24px' }}>
      {previewUrl && (
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 20px',
            border: '3px solid var(--primary)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <img src={previewUrl} alt="Analyzing Leaf" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
        <Loader2 size={24} color="var(--primary)" className="animate-spin" />
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary-hover)', margin: 0 }}>
          Analyzing Leaf Photo...
        </h2>
      </div>

      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
        LeafIQ is executing computer-vision feature extraction and initial assessment synthesis.
      </p>

      {/* Progress Timeline Steps */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
          backgroundColor: 'var(--bg-base)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--primary)' }}>
          <CheckCircle2 size={18} color="var(--primary)" />
          <span style={{ fontWeight: '600' }}>Leaf Image Validated</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-main)' }}>
          <Loader2 size={18} color="var(--primary)" className="animate-spin" />
          <span style={{ fontWeight: '600' }}>Checking Visual Patterns & Lesions...</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-light)' }}>
          <Circle size={18} />
          <span>Formulating Smart Follow-up Questions</span>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPage;


