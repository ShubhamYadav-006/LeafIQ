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

  const rawCrop = currentScan?.crop_name || currentScan?.crop?.name || currentScan?.crop || 'Tomato';
  const rawCondition = currentScan?.final_condition || currentScan?.assessment?.problem || currentScan?.initial_condition || 'Healthy';
  const crop = translateCrop(rawCrop);
  const condition = translateCondition(rawCondition);

  // Confidence rule: High, Medium, Low (No fake percentages or scientific probability claims)
  let confidenceLabel = 'Medium';
  if (currentScan?.assessment?.confidence && typeof currentScan.assessment.confidence === 'string') {
    confidenceLabel = currentScan.assessment.confidence;
  } else if (typeof currentScan?.final_confidence === 'string') {
    confidenceLabel = currentScan.final_confidence;
  } else if (typeof currentScan?.confidence === 'string') {
    confidenceLabel = currentScan.confidence;
  } else {
    const numConf = Number(currentScan?.final_confidence || currentScan?.initial_confidence || 0.85);
    confidenceLabel = numConf >= 0.85 ? 'High' : (numConf <= 0.50 ? 'Low' : 'Medium');
  }

  const isHealthy = rawCondition.toLowerCase().includes('healthy') || currentScan?.assessment?.status === 'healthy';
  const healthStatus = isHealthy ? 'Healthy' : 'Possible Problem Detected';
  const possibleProblem = isHealthy ? 'None (Healthy Foliage)' : condition;
  const rawConcern = currentScan?.concern_level || currentScan?.assessment?.concern_level || (isHealthy ? 'Low' : 'Attention Recommended');
  const concernLevel = translateConcern(rawConcern);

  const descriptionText = currentScan?.description || currentScan?.assessment?.description || currentScan?.assessment_summary || '';

  const immediateActions = actionPlan?.immediate_actions || currentScan?.how_to_fix || currentScan?.assessment?.how_to_fix || [
    'Prune and safely discard infected lower foliage to reduce spore load.',
    'Direct irrigation to the root zone to keep foliage dry.',
    'Sanitize pruning tools with rubbing alcohol between plants.',
  ];

  const preventionSteps = actionPlan?.prevention_steps || currentScan?.prevention || currentScan?.assessment?.prevention || [
    'Apply clean organic mulch around base to prevent soil splash during rain.',
    'Maintain adequate plant spacing (18–24 inches) for ventilation and fast leaf drying.',
    'Rotate crops out of the same plant family for 2–3 seasons.',
  ];

  const monitoringSteps = actionPlan?.monitoring_steps || currentScan?.what_to_monitor || currentScan?.assessment?.what_to_monitor || [
    'Inspect upper canopy and new leaves every 2–3 days.',
    'Monitor neighboring plants in the same bed for early lesion spots.',
    'Check leaf undersides for signs of moisture retention or secondary fungal growth.',
  ];

  const alternativeList = currentScan?.alternative_possibilities || currentScan?.alternatives || [];

  const disclaimer = actionPlan?.disclaimer || currentScan?.disclaimer ||
    'This is an AI-assisted visual assessment and is not a guaranteed expert diagnosis.';

  const imageSrc = previewUrl || (currentScan?.image_url
    ? (currentScan.image_url.startsWith('data:') || currentScan.image_url.startsWith('http')
        ? currentScan.image_url
        : `http://localhost:5000${currentScan.image_url}`)
    : '');

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

      {/* 1-5. Core Identification & Assessment Overview Card */}
      <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Leaf Thumbnail */}
          {imageSrc && (
            <div
              style={{
                width: '108px',
                height: '108px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: '#000000',
                border: '2px solid var(--border)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <img
                src={imageSrc}
                alt="Analyzed Leaf"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Assessment Core Header */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            {/* 1. Crop Identified */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <Sprout size={15} /> {crop}
              </span>

              {/* 2. Health Status Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: isHealthy ? '#EBFBEE' : '#FFF4E6',
                  color: isHealthy ? '#2B8A3E' : '#D9480F',
                  fontWeight: '700',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${isHealthy ? '#B2F2BB' : '#FFD8A8'}`,
                }}
              >
                {healthStatus}
              </span>

              {/* 5. Concern Level */}
              <ConcernBadge level={rawConcern} />
            </div>

            {/* 3. Possible Problem Headline */}
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>
              Possible Problem / Condition:
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: '800',
                color: isHealthy ? '#2B8A3E' : 'var(--primary-hover)',
                margin: '0 0 10px 0',
                lineHeight: '1.2',
              }}
            >
              {possibleProblem}
            </h1>

            {/* 4. AI-Assisted Confidence (Qualitative: High / Medium / Low) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                AI Assessment Confidence:
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: '700',
                  fontSize: '12.5px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: confidenceLabel === 'High' ? '#EBFBEE' : (confidenceLabel === 'Low' ? '#FFE3E3' : '#FFF9DB'),
                  color: confidenceLabel === 'High' ? '#2B8A3E' : (confidenceLabel === 'Low' ? '#C92A2A' : '#D97706'),
                  border: `1px solid ${confidenceLabel === 'High' ? '#B2F2BB' : (confidenceLabel === 'Low' ? '#FFA8A8' : '#FFE066')}`,
                }}
              >
                {confidenceLabel} Confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6, 7 & 8. What We Found, Visual Evidence & Description */}
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

        {/* 7. Visual Evidence List */}
        {(() => {
          const rawEv = currentScan?.visual_evidence || currentScan?.evidence || evidenceData?.visual || [];
          const items = Array.isArray(rawEv) ? rawEv : [];
          if (items.length === 0) return null;

          return (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '8px' }}>
                Visual Evidence Observed:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((ev, idx) => {
                  const title = typeof ev === 'string' ? ev : (ev.title || ev.description);
                  const desc = typeof ev === 'object' && ev.description !== ev.title ? ev.description : null;
                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-base)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <CheckCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                          {title}
                        </div>
                        {desc && (
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {desc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 8. Description */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '6px' }}>
            Description:
          </div>
          <p style={{ fontSize: '14.5px', color: 'var(--text-main)', lineHeight: '1.6', margin: 0, backgroundColor: '#F8F9FA', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            {descriptionText || `Visual analysis reveals foliage patterns consistent with ${condition} on ${crop}.`}
          </p>
        </div>
      </div>

      {/* 9. How to Fix (Safe Practical Guidance) */}
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

        {immediateActions.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            No corrective intervention needed. Plant appears in healthy condition.
          </p>
        ) : (
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
                  {typeof action === 'string' ? action : action.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10. Prevention & Cultural Care */}
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
              {typeof step === 'string' ? step : step.text}
            </li>
          ))}
        </ul>
      </div>

      {/* 11. What to Monitor */}
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
              {typeof step === 'string' ? step : step.text}
            </li>
          ))}
        </ul>
      </div>

      {/* 12. Alternative Possibilities (Only rendered when relevant) */}
      {alternativeList && alternativeList.length > 0 && (
        <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFF9DB',
                color: '#D9480F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Info size={18} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Alternative Possibilities
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alternativeList.map((alt, idx) => {
              const name = typeof alt === 'string' ? alt : (alt.problem || alt.condition_name || alt.condition || 'Other Condition');
              const conf = typeof alt === 'object' ? (alt.confidence || 'Low') : 'Low';
              const rat = typeof alt === 'object' ? (alt.rationale || '') : '';
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFF9DB',
                    border: '1px solid #FFE066',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14.5px', color: '#7E3E07' }}>
                      {name}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#D9480F', backgroundColor: '#FFF4E6', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      {conf} Confidence
                    </span>
                  </div>
                  {rat && (
                    <div style={{ fontSize: '13px', color: '#7E3E07' }}>
                      {rat}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
