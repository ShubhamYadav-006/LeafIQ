import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Camera, Search, HelpCircle, ShieldCheck, ArrowRight, History } from 'lucide-react';

export const LandingPage = () => {
  const { startCropCheck, setCurrentStep } = useScanFlow();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="landing-wrapper">
      {/* Hero Card */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '40px 24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-hover)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
          }}
        >
          <span>🌱 {t('appTagline')}</span>
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--primary-hover)',
            marginBottom: '16px',
            lineHeight: '1.25',
          }}
        >
          {t('heroTitle')}
        </h1>

        <p
          style={{
            fontSize: '17px',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto 28px',
          }}
        >
          {t('heroSubtitle')}
        </p>

        <div style={{ maxWidth: '340px', margin: '0 auto' }}>
          <button onClick={startCropCheck} className="btn btn-primary" style={{ fontSize: '18px', height: '52px' }}>
            {t('startCropCheck')} <ArrowRight size={20} />
          </button>
        </div>

        {isAuthenticated && (
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => setCurrentStep(STEPS.HISTORY)}
              className="btn btn-ghost"
              style={{ fontSize: '14px' }}
            >
              <History size={16} /> {t('viewScanHistoryBtn')}
            </button>
          </div>
        )}
      </div>

      {/* 4-Step Process Visual */}
      <div style={{ marginTop: '32px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            color: 'var(--text-main)',
          }}
        >
          {t('howLeafIQProtects')}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Camera size={24} color="var(--primary)" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{t('snapLeafPhotoStep')}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('snapLeafPhotoDesc')}
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Search size={24} color="#0284C7" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{t('aiValidationStep')}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('aiValidationDesc')}
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <HelpCircle size={24} color="#D97706" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{t('fieldQuestionsStep')}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('fieldQuestionsDesc')}
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <ShieldCheck size={24} color="#16A34A" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{t('actionPlanStep')}</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {t('actionPlanDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


