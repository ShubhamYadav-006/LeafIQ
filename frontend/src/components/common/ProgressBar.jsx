import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';

const STEP_ORDER = [
  { step: STEPS.START_CHECK, label: 'Select Photo', phase: 1 },
  { step: STEPS.UPLOAD, label: 'Upload Photo', phase: 1 },
  { step: STEPS.PREVIEW, label: 'Inspect Photo', phase: 1 },
  { step: STEPS.VALIDATION, label: 'Validation', phase: 2 },
  { step: STEPS.ANALYZING, label: 'AI Diagnosis', phase: 2 },
  { step: STEPS.FINAL_ASSESSMENT, label: 'Results & Action Plan', phase: 3 },
];

export const ProgressBar = () => {
  const { currentStep } = useScanFlow();

  const currentIndex = STEP_ORDER.findIndex((s) => s.step === currentStep);
  if (currentIndex === -1) return null; // Don't render on Landing/History/Details

  const progressPercent = Math.round(((currentIndex + 1) / STEP_ORDER.length) * 100);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Step {currentIndex + 1} of {STEP_ORDER.length}: {STEP_ORDER[currentIndex]?.label}
        </span>
        <span>{progressPercent}%</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: 'var(--primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

