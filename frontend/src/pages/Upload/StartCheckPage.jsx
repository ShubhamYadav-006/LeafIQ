import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Focus, Crop, ArrowRight, ArrowLeft } from 'lucide-react';

export const StartCheckPage = () => {
  const { setCurrentStep, resetFlow } = useScanFlow();
  const { t } = useLanguage();

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={resetFlow}
        className="btn btn-ghost"
        style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', marginBottom: '16px', fontSize: '14px' }}
      >
        <ArrowLeft size={16} /> {t('backToHome')}
      </button>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '8px' }}>
        {t('checkCropHealthTitle')}
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        {t('checkCropHealthSubtitle')}
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
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>{t('naturalLightingTitle')}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('naturalLightingDesc')}
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
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>{t('focusCloselyTitle')}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('focusCloselyDesc')}
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
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>{t('centerFoliageTitle')}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('centerFoliageDesc')}
            </p>
          </div>
        </div>
      </div>

      <button onClick={() => setCurrentStep(STEPS.UPLOAD)} className="btn btn-primary" style={{ height: '50px' }}>
        {t('continueToUpload')} <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default StartCheckPage;


