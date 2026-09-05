import React from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { EvidenceBreakdown } from '../../components/evidence/EvidenceBreakdown';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const EvidencePage = () => {
  const { evidenceData, setCurrentStep } = useScanFlow();

  const mockEvidence = evidenceData || {
    visual: [
      'Dark water-soaked concentric lesions detected on leaf surface',
      'Chlorotic yellow halo surrounding primary necrotic spots',
      'Leaf edge drying and spot clustering observed',
    ],
    farmer_reported: [
      'Symptoms concentrated on lower/older foliage near ground level',
      'First noticed following recent overhead rain/irrigation',
    ],
  };

  return (
    <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <button
        onClick={() => setCurrentStep(STEPS.FINAL_ASSESSMENT)}
        className="btn btn-ghost"
        style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '14px', marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to Report
      </button>

      <EvidenceBreakdown evidence={mockEvidence} />

      <div style={{ marginTop: '28px' }}>
        <button onClick={() => setCurrentStep(STEPS.ACTION_PLAN)} className="btn btn-primary" style={{ height: '50px' }}>
          Continue to Action Plan <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default EvidencePage;


