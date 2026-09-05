import React, { useState } from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';
import { useAuth } from '../context/AuthContext';
import { ActionPlanCard } from '../components/ActionPlanCard';
import { BookmarkPlus, RefreshCw, ArrowLeft } from 'lucide-react';

export const ActionPlanPage = () => {
  const {
    actionPlan,
    setCurrentStep,
    resetFlow,
    startCropCheck,
  } = useScanFlow();

  const { isAuthenticated, openAuthModal } = useAuth();

  const mockActionPlan = actionPlan || {
    immediate_actions: [
      'Prune heavily infected lower leaves and safely burn or bury them away from crop fields.',
      'Avoid overhead sprinkler watering; direct water specifically to plant roots to keep leaves dry.',
      'Sanitize shears with alcohol between plants to prevent spore transfer.',
    ],
    monitoring_steps: [
      'Inspect upper canopy leaves every 48 hours for new spot development.',
      'Observe neighboring plants in the same row for early yellowing signs.',
    ],
    prevention_steps: [
      'Ensure 40-50cm plant spacing for adequate air circulation.',
      'Apply copper-based protective fungicide per local agronomic guidelines if rainfall persists.',
    ],
    expert_guidance: 'Consult your local Krishi Vigyan Kendra (KVK) if leaf spot expansion exceeds 30% of field.',
    disclaimer: 'LeafIQ provides AI-assisted decision support and does not replace certified agronomist diagnosis.',
  };

  const handleSaveScan = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setCurrentStep(STEPS.SAVE_CONFIRMATION);
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

      <ActionPlanCard actionPlan={mockActionPlan} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
        <button onClick={handleSaveScan} className="btn btn-primary" style={{ height: '50px' }}>
          <BookmarkPlus size={20} /> Save Scan to History
        </button>

        <button onClick={startCropCheck} className="btn btn-secondary">
          <RefreshCw size={18} /> Start Another Crop Check
        </button>
      </div>
    </div>
  );
};

export default ActionPlanPage;
