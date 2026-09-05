import React, { useState } from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { scanApi } from '../../services/api';
import { RefreshCw, Play, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export const ImagePreviewPage = () => {
  const {
    selectedFile,
    previewUrl,
    setCurrentStep,
    setCurrentScan,
    setFlowError,
    parentScanId,
  } = useScanFlow();

  const [uploading, setUploading] = useState(false);

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setFlowError(null);
    setCurrentStep(STEPS.VALIDATION);

    try {
      // 1. Upload scan to backend
      const res = await scanApi.uploadScan(selectedFile, parentScanId);
      if (res.success && res.data?.scan) {
        setCurrentScan(res.data.scan);

        // 2. Automatically trigger AI validation & analysis engine
        setCurrentStep(STEPS.ANALYZING);
        const analyzeRes = await scanApi.analyzeScan(res.data.scan.id);

        if (analyzeRes.success && analyzeRes.data) {
          // Check technical validation result
          if (analyzeRes.data.image_valid === false) {
            setFlowError(
              analyzeRes.data.validation_reason ||
                'Image failed leaf quality checks. Please upload a clearer leaf photo.'
            );
            setCurrentStep(STEPS.VALIDATION); // Stay on validation screen to display clear retake guidance
            return;
          }

          // Advance to Initial Assessment
          setCurrentStep(STEPS.INITIAL_ASSESSMENT);
        }
      }
    } catch (err) {
      console.error('Scan analysis error:', err);
      setFlowError(err.message || 'Failed to analyze crop image. Please retry.');
      setCurrentStep(STEPS.PREVIEW);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ textAlign: 'left', marginBottom: '12px' }}>
        <button
          onClick={() => setCurrentStep(STEPS.UPLOAD)}
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '14px' }}
        >
          <ArrowLeft size={16} /> Choose Another Photo
        </button>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '4px' }}>
        Inspect Leaf Photo
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Ensure the affected leaf spots and plant tissue are clearly visible before proceeding.
      </p>

      {/* Image Preview Container */}
      {previewUrl ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxHeight: '360px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: '#000000',
            marginBottom: '16px',
            border: '1px solid var(--border)',
          }}
        >
          <img
            src={previewUrl}
            alt="Leaf Preview"
            style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '360px' }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: '40px',
            backgroundColor: 'var(--bg-base)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
          }}
        >
          No image selected.
        </div>
      )}

      {selectedFile && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <span>📁 {selectedFile.name}</span>
          <span>⚖️ {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setCurrentStep(STEPS.UPLOAD)}
          className="btn btn-secondary"
          style={{ flex: 1 }}
          disabled={uploading}
        >
          <RefreshCw size={18} /> Retake / Retouch
        </button>

        <button
          onClick={handleStartAnalysis}
          className="btn btn-primary"
          style={{ flex: 1 }}
          disabled={uploading}
        >
          {uploading ? (
            'Uploading...'
          ) : (
            <>
              <Play size={18} /> Analyze Leaf
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewPage;


