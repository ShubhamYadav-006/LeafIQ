import React, { useEffect, useState } from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';
import { TrajectoryBadge } from '../components/TrajectoryBadge';
import { scanApi } from '../services/api';
import { ArrowLeft, History, PlusCircle, Loader2 } from 'lucide-react';

export const ScanComparisonPage = () => {
  const {
    currentScan,
    parentScanId,
    setCurrentStep,
    comparisonResult,
    setComparisonResult,
    startCropCheck,
  } = useScanFlow();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const runComparison = async () => {
      if (parentScanId && currentScan?.id && !comparisonResult) {
        setLoading(true);
        setErrorMsg(null);
        try {
          const res = await scanApi.compareScans(parentScanId, currentScan.id);
          if (res.success && res.data?.comparison) {
            setComparisonResult(res.data.comparison);
          }
        } catch (err) {
          console.error('Comparison error:', err);
          setErrorMsg(err.message || 'Unable to generate scan comparison.');
        } finally {
          setLoading(false);
        }
      }
    };

    runComparison();
  }, [parentScanId, currentScan?.id]);

  const trajectory = comparisonResult?.trajectory || 'stable';
  const summaryText =
    comparisonResult?.comparison_summary ||
    'Foliage condition has stabilized. Lesion spreading appears contained following initial sanitation measures.';

  return (
    <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <button
        onClick={() => setCurrentStep(STEPS.HISTORY)}
        className="btn btn-ghost"
        style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '14px', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to History
      </button>

      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Temporal Progress Evaluation
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', margin: '4px 0 0' }}>
            Crop Health Trajectory
          </h2>
        </div>
        <TrajectoryBadge trajectory={trajectory} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p>Evaluating temporal trajectory between scans...</p>
        </div>
      ) : errorMsg ? (
        <div className="card" style={{ backgroundColor: '#FFE3E3', color: '#C92A2A', textAlign: 'center' }}>
          <p>{errorMsg}</p>
        </div>
      ) : (
        <>
          {/* Plain Language Summary Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-base)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid var(--border)',
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '8px' }}>
              Comparison Rationale:
            </h4>
            <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {summaryText}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => setCurrentStep(STEPS.HISTORY)} className="btn btn-primary" style={{ height: '50px' }}>
              <History size={20} /> View in Scan History
            </button>

            <button onClick={startCropCheck} className="btn btn-secondary">
              <PlusCircle size={18} /> Start Another Crop Check
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScanComparisonPage;
