import React from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';
import { CheckCircle2, History, PlusCircle } from 'lucide-react';

export const SaveScanPage = () => {
  const { currentScan, setCurrentStep, startCropCheck } = useScanFlow();

  const crop = currentScan?.crop || 'Tomato';
  const condition = currentScan?.final_condition || currentScan?.initial_condition || 'Early Blight';

  return (
    <div className="card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '36px 24px' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#EBFBEE',
          color: '#2B8A3E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <CheckCircle2 size={44} />
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '8px' }}>
        Scan Saved Successfully!
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Your crop health report and action plan have been securely persisted to your scan history.
      </p>

      {/* Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-base)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '28px',
          border: '1px solid var(--border)',
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
          Saved Record
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px' }}>
          {crop} — {condition}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Saved on {new Date().toLocaleDateString()}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={() => setCurrentStep(STEPS.HISTORY)} className="btn btn-primary" style={{ height: '50px' }}>
          <History size={20} /> View in Scan History
        </button>

        <button onClick={startCropCheck} className="btn btn-secondary">
          <PlusCircle size={18} /> Start Another Crop Check
        </button>
      </div>
    </div>
  );
};

export default SaveScanPage;
