import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { AlertTriangle, RefreshCw, Sun, Focus, Crop } from 'lucide-react';

export const ImageValidationPage = () => {
  const { flowError, setCurrentStep, selectImageFile } = useScanFlow();

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#FFE3E3',
          color: '#C92A2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <AlertTriangle size={28} />
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#C92A2A', marginBottom: '8px' }}>
        We Couldn't Confidently Analyze This Photo
      </h2>

      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        {flowError || 'The uploaded photo did not pass visual leaf quality checks.'}
      </p>

      {/* Retake Advice Card */}
      <div
        style={{
          backgroundColor: '#FFF4E6',
          border: '1px solid #FFE066',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '24px',
        }}
      >
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#D9480F', marginBottom: '12px' }}>
          💡 How to Capture a Successful Photo:
        </h4>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
          <li>
            <strong>Move Closer:</strong> Position the camera 10–20 cm away so the leaf fills most of the frame.
          </li>
          <li>
            <strong>Check Lighting:</strong> Avoid glare, dark shadows, or nighttime flash reflection.
          </li>
          <li>
            <strong>Sharp Focus:</strong> Tap your phone screen to focus specifically on the leaf lesions.
          </li>
          <li>
            <strong>Leaf Foliage Only:</strong> Ensure plant leaves are visible rather than hands, soil, or background crops.
          </li>
        </ul>
      </div>

      <button onClick={() => setCurrentStep(STEPS.UPLOAD)} className="btn btn-primary" style={{ height: '48px' }}>
        <RefreshCw size={18} /> Try Another Photo
      </button>
    </div>
  );
};

export default ImageValidationPage;


