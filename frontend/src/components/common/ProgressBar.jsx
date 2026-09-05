import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useLanguage } from '../../context/LanguageContext';

export const ProgressBar = () => {
  const { currentStep } = useScanFlow();
  const { t } = useLanguage();

  const STEP_ORDER = [
    { step: STEPS.START_CHECK, labelKey: 'stepSelect' },
    { step: STEPS.UPLOAD, labelKey: 'stepUpload' },
    { step: STEPS.PREVIEW, labelKey: 'stepPreview' },
    { step: STEPS.VALIDATION, labelKey: 'stepValidate' },
    { step: STEPS.ANALYZING, labelKey: 'stepAnalyze' },
    { step: STEPS.FINAL_ASSESSMENT, labelKey: 'stepResult' },
  ];

  const currentIndex = STEP_ORDER.findIndex((s) => s.step === currentStep);
  if (currentIndex === -1) return null; // Don't render on Landing/History/Details

  const progressPercent = Math.round(((currentIndex + 1) / STEP_ORDER.length) * 100);
  const currentLabel = t(STEP_ORDER[currentIndex]?.labelKey || 'stepUpload');

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          {t('stepOf', { current: currentIndex + 1, total: STEP_ORDER.length, label: currentLabel })}
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

