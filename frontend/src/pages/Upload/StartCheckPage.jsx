import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { Sun, Focus, Crop, ArrowRight, ArrowLeft } from 'lucide-react';

export const StartCheckPage = () => {
  const { setCurrentStep, resetFlow } = useScanFlow();

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={resetFlow}
        className="btn btn-ghost"
        style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', marginBottom: '16px', fontSize: '14px' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '8px' }}>
        Check Your Crop Health
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        For accurate AI visual validation, please follow these simple leaf photo guidelines before uploading.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              flexShrink: 0,
            }}
          >
            <Sun size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>Use Natural Lighting</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Capture the leaf in clear daylight or bright, even lighting. Avoid heavy dark shadows.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              flexShrink: 0,
            }}
          >
            <Focus size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>Focus Closely on Leaf</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Keep the camera in sharp focus on the affected leaf spots or discolored regions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#E8F5E9',
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <Crop size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>Center the Foliage</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Ensure the plant leaf fills most of the photo frame rather than background soil or hands.
            </p>
          </div>
        </div>
      </div>

      <button onClick={() => setCurrentStep(STEPS.UPLOAD)} className="btn btn-primary" style={{ height: '50px' }}>
        Continue to Photo Upload <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default StartCheckPage;


