import React, { useEffect } from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { ConcernBadge } from '../../components/common/ConcernBadge';
import { scanApi } from '../../services/api';
import { ArrowRight, ShieldCheck, BookmarkPlus, Eye } from 'lucide-react';

export const FinalAssessmentPage = () => {
  const {
    currentScan,
    setCurrentStep,
    setFinalAssessment,
    setActionPlan,
    setEvidenceData,
  } = useScanFlow();

  useEffect(() => {
    const fetchLatestDetails = async () => {
      if (currentScan?.id) {
        try {
          const res = await scanApi.getScanDetails(currentScan.id);
          if (res.success && res.data) {
            setFinalAssessment(res.data.scan);
            setActionPlan(res.data.action_plan);
            setEvidenceData(res.data.evidence);
          }
        } catch (err) {
          console.warn('Failed to fetch full scan report:', err);
        }
      }
    };

    fetchLatestDetails();
  }, [currentScan?.id]);

  const crop = currentScan?.crop || 'Tomato';
  const condition = currentScan?.final_condition || currentScan?.initial_condition || 'Early Blight';
  const confidence = currentScan?.final_confidence || currentScan?.initial_confidence || 0.89;
  const concernLevel = currentScan?.concern_level || 'Attention Recommended';

  return (
    <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '20px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {crop} Crop Health Assessment
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--primary-hover)', margin: '4px 0 0' }}>
            {condition}
          </h2>
        </div>
        <ConcernBadge level={concernLevel} />
      </div>

      {/* Primary Diagnostic Summary */}
      <div
        style={{
          backgroundColor: 'var(--bg-base)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
            Assessment Confidence
          </span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
            {(confidence * 100).toFixed(0)}% Confidence Match
          </span>
        </div>

        {/* Confidence Progress Meter */}
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--border)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(confidence * 100).toFixed(0)}%`,
              backgroundColor: 'var(--primary)',
            }}
          />
        </div>

        <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6' }}>
          LeafIQ visual analysis combined with your reported field symptoms indicates <strong>{condition}</strong> on your {crop} foliage. Prompt sanitation and moisture control measures are recommended to prevent canopy spread.
        </p>
      </div>

      {/* Action CTA Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={() => setCurrentStep(STEPS.EVIDENCE)} className="btn btn-secondary" style={{ height: '48px' }}>
          <Eye size={18} /> View Transparent Evidence ("Why")
        </button>

        <button onClick={() => setCurrentStep(STEPS.ACTION_PLAN)} className="btn btn-primary" style={{ height: '50px' }}>
          <ShieldCheck size={20} /> View Recommended Action Plan <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default FinalAssessmentPage;


