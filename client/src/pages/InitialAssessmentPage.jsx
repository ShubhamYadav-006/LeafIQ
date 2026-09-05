import React from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';
import { ConcernBadge } from '../components/ConcernBadge';
import { scanApi } from '../services/api';
import { HelpCircle, ArrowRight, Eye, AlertCircle } from 'lucide-react';

export const InitialAssessmentPage = () => {
  const {
    currentScan,
    setCurrentStep,
    setQuestions,
    setFlowError,
  } = useScanFlow();

  const handleFetchQuestions = async () => {
    if (!currentScan?.id) return;
    try {
      const res = await scanApi.getQuestions(currentScan.id);
      if (res.success && res.data?.questions) {
        setQuestions(res.data.questions);
        setCurrentStep(STEPS.QUESTIONS);
      }
    } catch (err) {
      console.error('Fetch questions error:', err);
      setFlowError(err.message || 'Failed to retrieve follow-up questions.');
      setCurrentStep(STEPS.FINAL_ASSESSMENT);
    }
  };

  const cropName = currentScan?.crop || 'Tomato';
  const cropConf = currentScan?.crop_confidence ? (currentScan.crop_confidence * 100).toFixed(0) : '95';
  const condition = currentScan?.initial_condition || 'Early Blight';
  const conditionConf = currentScan?.initial_confidence ? (currentScan.initial_confidence * 100).toFixed(0) : '85';
  const concernLevel = currentScan?.concern_level || 'Attention Recommended';

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Detected Crop
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', margin: 0 }}>
            {cropName} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>({cropConf}% match)</span>
          </h2>
        </div>
        <ConcernBadge level={concernLevel} />
      </div>

      {/* Preliminary Condition Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-base)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
          Preliminary Observation (Visual Pattern)
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
          {condition}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Initial Visual Confidence: <strong>{conditionConf}%</strong>
        </div>
      </div>

      {/* Visual Evidence Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Eye size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-hover)' }}>
            Observed Visual Indicators
          </h4>
        </div>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
          <li>Dark spots or necrotic lesions visible on plant leaf surface.</li>
          <li>Chlorosis (yellow halo) present surrounding central leaf tissue.</li>
          <li>Leaf edge drying or margin scorch pattern observed.</li>
        </ul>
      </div>

      {/* Reassurance Callout */}
      <div
        style={{
          backgroundColor: '#E0F2FE',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <HelpCircle size={22} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h5 style={{ fontSize: '15px', fontWeight: '700', color: '#0369A1', marginBottom: '4px' }}>
            Why Answer 2 Quick Questions?
          </h5>
          <p style={{ fontSize: '14px', color: '#0C4A6E' }}>
            Visual patterns alone can be ambiguous. Combining leaf photos with field context (spot location, rate of spread) ensures a reliable action plan.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={handleFetchQuestions} className="btn btn-primary" style={{ height: '50px' }}>
          Answer 2 Quick Questions <ArrowRight size={20} />
        </button>

        <button
          onClick={() => setCurrentStep(STEPS.FINAL_ASSESSMENT)}
          className="btn btn-ghost"
          style={{ fontSize: '14px' }}
        >
          Skip to Final Report
        </button>
      </div>
    </div>
  );
};

export default InitialAssessmentPage;
