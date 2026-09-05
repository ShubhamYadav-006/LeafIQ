import React, { useState, useEffect } from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { scanApi } from '../../services/api';
import { ConcernBadge } from '../../components/common/ConcernBadge';
import { ActionPlanCard } from '../../components/action-plan/ActionPlanCard';
import { EvidenceBreakdown } from '../../components/evidence/EvidenceBreakdown';
import { ArrowLeft, RefreshCw, Loader2, Calendar } from 'lucide-react';

export const ScanDetailsPage = () => {
  const {
    selectedHistoryScanId,
    setCurrentStep,
    setParentScanId,
  } = useScanFlow();

  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedHistoryScanId) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await scanApi.getScanDetails(selectedHistoryScanId);
        if (res.success && res.data) {
          setScanData(res.data);
        }
      } catch (err) {
        console.error('Fetch scan details error:', err);
        setErrorMsg(err.message || 'Failed to load past scan details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedHistoryScanId]);

  const handleStartRescan = () => {
    if (scanData?.scan?.id) {
      setParentScanId(scanData.scan.id);
      setCurrentStep(STEPS.RESCAN);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p>Loading scan snapshot details...</p>
      </div>
    );
  }

  if (errorMsg || !scanData) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#C92A2A', marginBottom: '16px' }}>{errorMsg || 'Scan record not found.'}</p>
        <button onClick={() => setCurrentStep(STEPS.HISTORY)} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to History
        </button>
      </div>
    );
  }

  const { scan, evidence, action_plan, alternatives } = scanData;

  return (
    <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <button
        onClick={() => setCurrentStep(STEPS.HISTORY)}
        className="btn btn-ghost"
        style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '14px', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to History
      </button>

      {/* Title & Metadata Header */}
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
            Historical Scan Snapshot
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', margin: '4px 0 0' }}>
            {scan.crop_name || scan.crop || 'Crop'} — {scan.final_condition || scan.initial_condition || 'Healthy'}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} />
            <span>Scanned on {new Date(scan.created_at).toLocaleString()}</span>
          </div>
        </div>
        <ConcernBadge level={scan.concern_level || 'attention'} />
      </div>

      {/* Image Preview if available */}
      {scan.image_url && (
        <div
          style={{
            width: '100%',
            maxHeight: '280px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: '#000000',
            marginBottom: '20px',
          }}
        >
          <img
            src={scan.image_url.startsWith('http') ? scan.image_url : `http://localhost:5000${scan.image_url}`}
            alt="Historical Leaf"
            style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '280px' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Evidence Section */}
      <EvidenceBreakdown evidence={evidence} alternatives={alternatives} />

      {/* Action Plan */}
      <ActionPlanCard actionPlan={action_plan} />

      {/* Primary Rescan CTA */}
      <div style={{ marginTop: '28px' }}>
        <button onClick={handleStartRescan} className="btn btn-primary" style={{ height: '50px' }}>
          <RefreshCw size={20} /> Re-scan / Track Plant Progress
        </button>
      </div>
    </div>
  );
};

export default ScanDetailsPage;


