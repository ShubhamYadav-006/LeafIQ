import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ScanFlowProvider, useScanFlow, STEPS } from './context/ScanFlowContext';
import Navbar from './components/common/Navbar';
import AuthModal from './components/common/AuthModal';
import ProgressBar from './components/common/ProgressBar';

// Import All 17 Screens
import LandingPage from './pages/Landing/LandingPage';
import StartCheckPage from './pages/Upload/StartCheckPage';
import UploadPhotoPage from './pages/Upload/UploadPhotoPage';
import ImagePreviewPage from './pages/Upload/ImagePreviewPage';
import ImageValidationPage from './pages/Upload/ImageValidationPage';
import AIAnalysisPage from './pages/Assessment/AIAnalysisPage';
import InitialAssessmentPage from './pages/Assessment/InitialAssessmentPage';
import SmartQuestionsPage from './pages/Questions/SmartQuestionsPage';
import FarmerAnswersPage from './pages/Questions/FarmerAnswersPage';
import FinalAssessmentPage from './pages/Assessment/FinalAssessmentPage';
import EvidencePage from './pages/Comparison/EvidencePage';
import ActionPlanPage from './pages/Result/ActionPlanPage';
import SaveScanPage from './pages/Result/SaveScanPage';
import ScanHistoryPage from './pages/History/ScanHistoryPage';
import ScanDetailsPage from './pages/History/ScanDetailsPage';
import RescanPage from './pages/Comparison/RescanPage';
import ScanComparisonPage from './pages/Comparison/ScanComparisonPage';

const ScreenRouter = () => {
  const { currentStep } = useScanFlow();

  switch (currentStep) {
    case STEPS.LANDING:
      return <LandingPage />;
    case STEPS.START_CHECK:
      return <StartCheckPage />;
    case STEPS.UPLOAD:
      return <UploadPhotoPage />;
    case STEPS.PREVIEW:
      return <ImagePreviewPage />;
    case STEPS.VALIDATION:
      return <ImageValidationPage />;
    case STEPS.ANALYZING:
      return <AIAnalysisPage />;
    case STEPS.INITIAL_ASSESSMENT:
      return <InitialAssessmentPage />;
    case STEPS.QUESTIONS:
      return <SmartQuestionsPage />;
    case STEPS.FARMER_ANSWERS:
      return <FarmerAnswersPage />;
    case STEPS.FINAL_ASSESSMENT:
      return <FinalAssessmentPage />;
    case STEPS.EVIDENCE:
      return <EvidencePage />;
    case STEPS.ACTION_PLAN:
      return <ActionPlanPage />;
    case STEPS.SAVE_CONFIRMATION:
      return <SaveScanPage />;
    case STEPS.HISTORY:
      return <ScanHistoryPage />;
    case STEPS.SCAN_DETAILS:
      return <ScanDetailsPage />;
    case STEPS.RESCAN:
      return <RescanPage />;
    case STEPS.COMPARISON:
      return <ScanComparisonPage />;
    default:
      return <LandingPage />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <ScanFlowProvider>
        <Navbar />
        <main className="page-wrapper container">
          <ProgressBar />
          <ScreenRouter />
        </main>
        <AuthModal />
      </ScanFlowProvider>
    </AuthProvider>
  );
}
