import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ImageValidationPage = () => {
  const { flowError, setCurrentStep } = useScanFlow();
  const { t } = useLanguage();

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#FFE3E3',
          color: '#C92A2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <AlertTriangle size={28} />
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#C92A2A', marginBottom: '8px' }}>
        {t('validationFailedTitle')}
      </h2>

      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        {flowError || t('validationFailedSubtitle')}
      </p>

      {/* Retake Advice Card */}
      <div
        style={{
          backgroundColor: '#FFF4E6',
          border: '1px solid #FFE066',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '24px',
        }}
      >
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#D9480F', marginBottom: '12px' }}>
          {t('captureTipsTitle')}
        </h4>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
          <li>
            <strong>{t('tip1Title')}</strong> {t('tip1Desc')}
          </li>
          <li>
            <strong>{t('tip2Title')}</strong> {t('tip2Desc')}
          </li>
          <li>
            <strong>{t('tip3Title')}</strong> {t('tip3Desc')}
          </li>
          <li>
            <strong>{t('tip4Title')}</strong> {t('tip4Desc')}
          </li>
        </ul>
      </div>

      <button onClick={() => setCurrentStep(STEPS.UPLOAD)} className="btn btn-primary" style={{ height: '48px' }}>
        <RefreshCw size={18} /> {t('tryAnotherPhoto')}
      </button>
    </div>
  );
};

export default ImageValidationPage;


