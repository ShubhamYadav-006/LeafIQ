import React, { useRef, useState } from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';
import { Camera, Upload, ArrowLeft, AlertTriangle } from 'lucide-react';

export const RescanPage = () => {
  const {
    selectImageFile,
    setCurrentStep,
    flowError,
    setFlowError,
  } = useScanFlow();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFlowError('File size exceeds 10MB limit.');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setFlowError('Unsupported file format.');
      return;
    }

    selectImageFile(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button
        onClick={() => setCurrentStep(STEPS.SCAN_DETAILS)}
        className="btn btn-ghost"
        style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '14px', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Cancel Re-scan
      </button>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '4px' }}>
        Follow-up Re-scan
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Capture a new photo of the same plant canopy to evaluate disease progress over time.
      </p>

      {flowError && (
        <div
          style={{
            backgroundColor: '#FFE3E3',
            color: '#C92A2A',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={18} />
          <span>{flowError}</span>
        </div>
      )}

      {/* Guidance Banner */}
      <div
        style={{
          backgroundColor: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid var(--border)',
        }}
      >
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '4px' }}>
          💡 Re-scan Alignment Tips:
        </h4>
        <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>
          Try to match the lighting, distance, and angle of your baseline scan for accurate trajectory comparison.
        </p>
      </div>

      {/* Hidden file & camera inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* Dropzone Container */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '3px solid var(--primary-hover)' : '2px dashed var(--primary)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: isDragging ? '#DCFCE7' : 'var(--surface)',
          padding: '36px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.2s ease',
          transform: isDragging ? 'scale(1.02)' : 'none',
        }}
      >
        <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
        <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '4px' }}>
          {isDragging ? 'Drop Follow-up Photo Here' : 'Tap or Drag Follow-up Photo Here'}
        </h4>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Supports JPG, PNG, WEBP (Max 10MB)
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="btn btn-primary"
          style={{ flex: '1 1 200px' }}
        >
          <Camera size={20} /> Take Follow-up Photo
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary"
          style={{ flex: '1 1 200px' }}
        >
          <Upload size={20} /> Select File
        </button>
      </div>
    </div>
  );
};

export default RescanPage;
