import React, { createContext, useContext, useState } from 'react';
import { scanApi } from '../services/api';

const ScanFlowContext = createContext();

export const STEPS = {
  LANDING: 'LANDING',
  START_CHECK: 'START_CHECK',
  UPLOAD: 'UPLOAD',
  PREVIEW: 'PREVIEW',
  VALIDATION: 'VALIDATION',
  ANALYZING: 'ANALYZING',
  INITIAL_ASSESSMENT: 'INITIAL_ASSESSMENT',
  QUESTIONS: 'QUESTIONS',
  FARMER_ANSWERS: 'FARMER_ANSWERS',
  FINAL_ASSESSMENT: 'FINAL_ASSESSMENT',
  EVIDENCE: 'EVIDENCE',
  ACTION_PLAN: 'ACTION_PLAN',
  SAVE_CONFIRMATION: 'SAVE_CONFIRMATION',
  HISTORY: 'HISTORY',
  SCAN_DETAILS: 'SCAN_DETAILS',
  RESCAN: 'RESCAN',
  COMPARISON: 'COMPARISON',
};

export const ScanFlowProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.LANDING);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Scan data state
  const [currentScan, setCurrentScan] = useState(null);
  const [initialAssessment, setInitialAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [farmerAnswers, setFarmerAnswers] = useState({});
  const [finalAssessment, setFinalAssessment] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);

  // History & Re-scan / Comparison state
  const [selectedHistoryScanId, setSelectedHistoryScanId] = useState(null);
  const [historyScanDetails, setHistoryScanDetails] = useState(null);
  const [parentScanId, setParentScanId] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  // General error state
  const [flowError, setFlowError] = useState(null);

  const resetFlow = () => {
    setCurrentStep(STEPS.LANDING);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCurrentScan(null);
    setInitialAssessment(null);
    setQuestions([]);
    setFarmerAnswers({});
    setFinalAssessment(null);
    setActionPlan(null);
    setEvidenceData(null);
    setSelectedHistoryScanId(null);
    setHistoryScanDetails(null);
    setParentScanId(null);
    setComparisonResult(null);
    setFlowError(null);
  };

  const startCropCheck = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCurrentScan(null);
    setInitialAssessment(null);
    setQuestions([]);
    setFarmerAnswers({});
    setFinalAssessment(null);
    setActionPlan(null);
    setEvidenceData(null);
    setComparisonResult(null);
    setFlowError(null);
    setCurrentStep(STEPS.START_CHECK);
  };

  const selectImageFile = (file) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setFlowError(null);
    setCurrentStep(STEPS.PREVIEW);
  };

  const claimCurrentScan = async () => {
    if (currentScan?.id) {
      try {
        const res = await scanApi.claimScan(currentScan.id);
        if (res.success && res.data?.scan) {
          setCurrentScan(res.data.scan);
          return true;
        }
      } catch (err) {
        console.warn('Claiming scan error:', err);
      }
    }
    return false;
  };

  return (
    <ScanFlowContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedFile,
        setSelectedFile,
        previewUrl,
        setPreviewUrl,
        currentScan,
        setCurrentScan,
        initialAssessment,
        setInitialAssessment,
        questions,
        setQuestions,
        farmerAnswers,
        setFarmerAnswers,
        finalAssessment,
        setFinalAssessment,
        actionPlan,
        setActionPlan,
        evidenceData,
        setEvidenceData,
        selectedHistoryScanId,
        setSelectedHistoryScanId,
        historyScanDetails,
        setHistoryScanDetails,
        parentScanId,
        setParentScanId,
        comparisonResult,
        setComparisonResult,
        flowError,
        setFlowError,
        resetFlow,
        startCropCheck,
        selectImageFile,
        claimCurrentScan,
      }}
    >
      {children}
    </ScanFlowContext.Provider>
  );
};

export const useScanFlow = () => useContext(ScanFlowContext);
