import React, { useRef, useState } from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { Camera, Upload, ArrowLeft, Image as ImageIcon, AlertTriangle } from 'lucide-react';

export const UploadPhotoPage = () => {
  const { selectImageFile, setCurrentStep, flowError, setFlowError } = useScanFlow();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFlowError(t('fileSizeError'));
      return;
    }

    // Validate MIME type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setFlowError(t('fileTypeError'));
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
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ textAlign: 'left', marginBottom: '16px' }}>
        <button
          onClick={() => setCurrentStep(STEPS.START_CHECK)}
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '14px' }}
        >
          <ArrowLeft size={16} /> {t('back')}
        </button>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '8px' }}>
        {t('uploadTitle')}
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        {t('uploadSubtitle')}
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
            textAlign: 'left',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{flowError}</span>
        </div>
      )}

      {/* Hidden inputs */}
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

      {/* Dropzone Container with Drag Over Support */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '3px solid var(--primary-hover)' : '2px dashed var(--primary)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: isDragging ? '#DCFCE7' : 'var(--primary-light)',
          padding: '40px 20px',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 0.2s ease',
          transform: isDragging ? 'scale(1.02)' : 'none',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Upload size={32} color="var(--primary)" />
        </div>
        <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '4px' }}>
          {isDragging ? t('dropzoneDrag') : t('dropzoneTitle')}
        </h4>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {t('dropzoneFormats')}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="btn btn-primary"
          style={{ flex: '1 1 200px' }}
        >
          <Camera size={20} /> {t('takePhotoCamera')}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary"
          style={{ flex: '1 1 200px' }}
        >
          <ImageIcon size={20} /> {t('browseGallery')}
        </button>
      </div>
    </div>
  );
};

export default UploadPhotoPage;


