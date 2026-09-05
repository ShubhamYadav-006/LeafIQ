import React from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';

const STEP_ORDER = [
  { step: STEPS.START_CHECK, label: 'Start' },
  { step: STEPS.UPLOAD, label: 'Upload' },
  { step: STEPS.PREVIEW, label: 'Preview' },
  { step: STEPS.VALIDATION, label: 'Validate' },
  { step: STEPS.ANALYZING, label: 'Analyze' },
  { step: STEPS.INITIAL_ASSESSMENT, label: 'Visuals' },
  { step: STEPS.QUESTIONS, label: 'Questions' },
  { step: STEPS.FINAL_ASSESSMENT, label: 'Report' },
  { step: STEPS.ACTION_PLAN, label: 'Action' },
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
