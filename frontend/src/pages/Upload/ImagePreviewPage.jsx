import React, { useState } from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { scanApi } from '../../services/api';
import { RefreshCw, Play, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export const ImagePreviewPage = () => {
  const {
    selectedFile,
    previewUrl,
    setCurrentStep,
    setCurrentScan,
    setFinalAssessment,
    setActionPlan,
    setEvidenceData,
    setFlowError,
    parentScanId,
  } = useScanFlow();

  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setFlowError(null);
    setCurrentStep(STEPS.ANALYZING);

    try {
      // 1. Upload & analyze via Gemini multimodal engine
      const res = await scanApi.uploadScan(selectedFile, parentScanId);
      if (res.success && res.data) {
        // Handle direct response from all-in-one Gemini scan
        if (res.data.assessment || res.data.gemini_result) {
          if (res.data.image_valid === false || res.data.assessment?.status === 'insufficient_image') {
            setFlowError(
              res.data.description ||
              res.data.gemini_result?.description ||
              t('validationFailedSubtitle')
            );
            setCurrentStep(STEPS.VALIDATION);
            return;
          }

          setCurrentScan(res.data.scan);
          setFinalAssessment(res.data);
          setActionPlan(res.data.action_plan);
          setEvidenceData({ visual: res.data.evidence || [] });
          setCurrentStep(STEPS.FINAL_ASSESSMENT);
          return;
        }

        // Fallback: analyzeScan endpoint if upload only created record
        if (res.data.scan?.id) {
          setCurrentScan(res.data.scan);
          const analyzeRes = await scanApi.analyzeScan(res.data.scan.id);

          if (analyzeRes.success && analyzeRes.data) {
            if (analyzeRes.data.image_valid === false || analyzeRes.data.assessment?.status === 'insufficient_image') {
              setFlowError(
                analyzeRes.data.description ||
                analyzeRes.data.validation_reason ||
                t('validationFailedSubtitle')
              );
              setCurrentStep(STEPS.VALIDATION);
              return;
            }

            setCurrentScan(analyzeRes.data.scan);
            setFinalAssessment(analyzeRes.data);
            setActionPlan(analyzeRes.data.action_plan);
            setEvidenceData({ visual: analyzeRes.data.evidence || [] });
            setCurrentStep(STEPS.FINAL_ASSESSMENT);
          }
        }
      }
    } catch (err) {
      console.error('Scan analysis error:', err);
      setFlowError(err.message || t('validationFailedSubtitle'));
      setCurrentStep(STEPS.VALIDATION);
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
          <ArrowLeft size={16} /> {t('back')}
        </button>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '4px' }}>
        {t('inspectTitle')}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {t('inspectSubtitle')}
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
          {t('noImageSelected')}
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
          <RefreshCw size={18} /> {t('retakeButton')}
        </button>

        <button
          onClick={handleStartAnalysis}
          className="btn btn-primary"
          style={{ flex: 1 }}
          disabled={uploading}
        >
          {uploading ? (
            t('uploadingButton')
          ) : (
            <>
              <Play size={18} /> {t('analyzeButton')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewPage;


