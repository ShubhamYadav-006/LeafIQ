import React from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';
import { useAuth } from '../context/AuthContext';
import { Camera, Search, HelpCircle, ShieldCheck, ArrowRight, History } from 'lucide-react';

export const LandingPage = () => {
  const { startCropCheck, setCurrentStep } = useScanFlow();
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-wrapper">
      {/* Hero Card */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '40px 24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-hover)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
          }}
        >
          <span>🌱 AI-Assisted Crop Health Decision Support</span>
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--primary-hover)',
            marginBottom: '16px',
            lineHeight: '1.25',
          }}
        >
          Understand Your Crop.<br />
          Act Before Problems Spread.
        </h1>

        <p
          style={{
            fontSize: '17px',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto 28px',
          }}
        >
          Upload a photo of your leaf. LeafIQ validates the image, detects crop health symptoms, asks smart field questions, and provides a clear action plan.
        </p>

        <div style={{ maxWidth: '320px', margin: '0 auto' }}>
          <button onClick={startCropCheck} className="btn btn-primary" style={{ fontSize: '18px', height: '52px' }}>
            Start Crop Check <ArrowRight size={20} />
          </button>
        </div>

        {isAuthenticated && (
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => setCurrentStep(STEPS.HISTORY)}
              className="btn btn-ghost"
              style={{ fontSize: '14px' }}
            >
              <History size={16} /> View Your Past Scan History
            </button>
          </div>
        )}
      </div>

      {/* 4-Step Process Visual */}
      <div style={{ marginTop: '32px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            color: 'var(--text-main)',
          }}
        >
          How LeafIQ Protects Your Harvest
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Camera size={24} color="var(--primary)" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>1. Snap Leaf Photo</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Take a clear picture of the affected plant leaf using your phone camera.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Search size={24} color="#0284C7" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>2. AI Validation</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              AI extracts visual patterns (lesions, chlorosis, spot locations) deterministically.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <HelpCircle size={24} color="#D97706" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>3. Field Questions</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Answer 2-3 quick questions about field location and spread rate.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <ShieldCheck size={24} color="#16A34A" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>4. Action Plan</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Receive immediate steps, monitoring indicators, and prevention guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
