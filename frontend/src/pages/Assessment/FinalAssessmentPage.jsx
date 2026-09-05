import React, { useEffect, useState } from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ConcernBadge } from '../../components/common/ConcernBadge';
import { scanApi } from '../../services/api';
import {
  Sprout,
  CheckCircle,
  Eye,
  Wrench,
  ShieldCheck,
  Activity,
  BookmarkPlus,
  RefreshCw,
  Info,
  GitCompare,
  History,
} from 'lucide-react';

export const FinalAssessmentPage = () => {
  const {
    currentScan,
    previewUrl,
    setCurrentStep,
    setParentScanId,
    startCropCheck,
    actionPlan,
    evidenceData,
    setFinalAssessment,
    setActionPlan,
    setEvidenceData,
    claimCurrentScan,
  } = useScanFlow();

  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { t, translateCrop, translateCondition, translateConcern } = useLanguage();
  const [claiming, setClaiming] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchLatestDetails = async () => {
      if (currentScan?.id && (!actionPlan || !evidenceData)) {
        try {
          const res = await scanApi.getScanDetails(currentScan.id);
          if (res.success && res.data) {
            setFinalAssessment(res.data.scan);
            setActionPlan(res.data.action_plan);
            setEvidenceData(res.data.evidence);
          }
        } catch (err) {
          console.warn('Failed to fetch complete scan details:', err);
        }
      }
    };

    fetchLatestDetails();
  }, [currentScan?.id]);

  // If user becomes authenticated while on this page and scan is unclaimed, auto-claim
  useEffect(() => {
    if (isAuthenticated && currentScan?.id && !currentScan.user_id && !saveSuccess) {
      handleSaveToAccount();
    }
  }, [isAuthenticated, currentScan?.id]);

  const handleSaveToAccount = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setClaiming(true);
    try {
      const claimed = await claimCurrentScan();
      if (claimed) {
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error('Failed to save scan:', err);
    } finally {
      setClaiming(false);
    }
  };

  const handleRescanComparison = () => {
    if (currentScan?.id) {
      setParentScanId(currentScan.id);
      setCurrentStep(STEPS.UPLOAD);
    }
  };

  const rawCrop = currentScan?.crop_name || currentScan?.crop || 'Tomato';
  const rawCondition = currentScan?.final_condition || currentScan?.initial_condition || 'Early Blight';
  const crop = translateCrop(rawCrop);
  const condition = translateCondition(rawCondition);
  const confidence = Number(currentScan?.final_confidence || currentScan?.initial_confidence || 0.90);
  const concernLevel = currentScan?.concern_level || (rawCondition.toLowerCase().includes('healthy') ? 'healthy' : 'attention');
  const summary = currentScan?.assessment_summary || '';

  const immediateActions = actionPlan?.immediate_actions || [
    'Prune and safely discard infected lower foliage to reduce spore load.',
    'Direct irrigation to the root zone to keep foliage dry.',
    'Sanitize pruning tools with rubbing alcohol between plants.',
  ];

  const preventionSteps = actionPlan?.prevention_steps || [
    'Apply clean organic mulch around base to prevent soil splash during rain.',
    'Maintain adequate plant spacing (18–24 inches) for ventilation and fast leaf drying.',
    'Rotate crops out of the same plant family for 2–3 seasons.',
  ];

  const monitoringSteps = actionPlan?.monitoring_steps || [
    'Inspect upper canopy and new leaves every 2–3 days.',
    'Monitor neighboring plants in the same bed for early lesion spots.',
    'Check leaf undersides for signs of moisture retention or secondary fungal growth.',
  ];

  const disclaimer = actionPlan?.disclaimer ||
    'LeafIQ provides an AI-assisted crop health assessment based on image visual cues and should not be treated as a definitive laboratory diagnosis.';

  const isHealthy = rawCondition.toLowerCase().includes('healthy');

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Agricultural Advisory Disclaimer Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FFF9DB',
          border: '1px solid #FFE066',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Info size={20} color="#D9480F" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13.5px', color: '#7E3E07', lineHeight: '1.5' }}>
          <strong>{t('disclaimerTitle')}</strong> {disclaimer}
        </span>
      </div>

      {/* 1. Result Header Card */}
      <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Leaf Thumbnail */}
          {(previewUrl || currentScan?.image_url) && (
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: '#000000',
                border: '2px solid var(--border)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <img
                src={previewUrl || (currentScan?.image_url ? `http://localhost:5000${currentScan.image_url}` : '')}
                alt="Analyzed Leaf"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Diagnosis Headline */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: '700',
                  fontSize: '13px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.5px',
                }}
              >
                <Sprout size={14} /> {crop}
              </span>
              <ConcernBadge level={concernLevel} />
            </div>

            <h1
              style={{
                fontSize: '26px',
                fontWeight: '800',
                color: isHealthy ? '#2B8A3E' : 'var(--primary-hover)',
                margin: '0 0 8px 0',
                lineHeight: '1.2',
              }}
            >
              {condition}
            </h1>

            {/* Confidence Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <div
                style={{
                  flex: 1,
                  maxWidth: '180px',
                  height: '8px',
                  backgroundColor: 'var(--border)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(confidence * 100)}%`,
                    backgroundColor: isHealthy ? '#2B8A3E' : 'var(--primary)',
                  }}
                />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                {t('confidenceMatch', { confidence: Math.round(confidence * 100) })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. What We Found (Symptoms & Visual Evidence) */}
      <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#EBFBEE',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Eye size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            {t('whatWeFound')}
          </h2>
        </div>

        <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px' }}>
          {summary || `Visual analysis detected clear markers consistent with ${condition} on ${crop} foliage.`}
        </p>

        {/* Visual Evidence Points */}
        {evidenceData?.visual && evidenceData.visual.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {evidenceData.visual.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <CheckCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {ev.title}
                  </div>
                  {ev.description && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {ev.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. How to Fix (Safe Practical Guidance) */}
      <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#E7F5FF',
              color: '#1C7ED6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wrench size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            {t('howToFix')}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {immediateActions.map((action, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                backgroundColor: '#F8F9FA',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {idx + 1}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {action}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Prevention & Cultural Care */}
      <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FFF4E6',
              color: '#F76707',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            {t('prevention')}
          </h2>
        </div>

        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {preventionSteps.map((step, idx) => (
            <li key={idx} style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {step}
            </li>
          ))}
        </ul>
      </div>

      {/* 5. What to Monitor */}
      <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#F3F0FF',
              color: '#7950F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={18} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            {t('whatToMonitor')}
          </h2>
        </div>

        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {monitoringSteps.map((step, idx) => (
            <li key={idx} style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {step}
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Save to History / Login Action Banner */}
      {!isAuthenticated ? (
        <div
          style={{
            backgroundColor: '#EBFBEE',
            border: '2px dashed var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <BookmarkPlus size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '6px' }}>
            {t('saveScanPromptTitle')}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', maxWidth: '500px', margin: '0 auto 16px' }}>
            {t('saveScanPromptDesc', { crop })}
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 24px', fontSize: '15px' }}
          >
            <BookmarkPlus size={18} /> {t('loginSaveButton')}
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#EBFBEE',
            border: '1px solid #D3F9D8',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-hover)' }}>
                {t('savedToAccount')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {t('loggedInAs')} {user?.full_name || user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentStep(STEPS.HISTORY)}
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '13px' }}
          >
            <History size={16} /> {t('viewInHistory')}
          </button>
        </div>
      )}

      {/* 7. Bottom Action Controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px', paddingBottom: '24px' }}>
        <button
          onClick={startCropCheck}
          className="btn btn-secondary"
          style={{ flex: '1 1 200px', height: '48px' }}
        >
          <RefreshCw size={18} /> {t('takeAnotherScan')}
        </button>

        {isAuthenticated && (
          <button
            onClick={handleRescanComparison}
            className="btn btn-primary"
            style={{ flex: '1 1 200px', height: '48px' }}
          >
            <GitCompare size={18} /> {t('rescanCompare')}
          </button>
        )}
      </div>

    </div>
  );
};

export default FinalAssessmentPage;
