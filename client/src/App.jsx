import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ScanFlowProvider, useScanFlow, STEPS } from './context/ScanFlowContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProgressBar from './components/ProgressBar';

// Import All 17 Screens
import LandingPage from './pages/LandingPage';
import StartCheckPage from './pages/StartCheckPage';
import UploadPhotoPage from './pages/UploadPhotoPage';
import ImagePreviewPage from './pages/ImagePreviewPage';
import ImageValidationPage from './pages/ImageValidationPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import InitialAssessmentPage from './pages/InitialAssessmentPage';
import SmartQuestionsPage from './pages/SmartQuestionsPage';
import FarmerAnswersPage from './pages/FarmerAnswersPage';
import FinalAssessmentPage from './pages/FinalAssessmentPage';
import EvidencePage from './pages/EvidencePage';
import ActionPlanPage from './pages/ActionPlanPage';
import SaveScanPage from './pages/SaveScanPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import ScanDetailsPage from './pages/ScanDetailsPage';
import RescanPage from './pages/RescanPage';
import ScanComparisonPage from './pages/ScanComparisonPage';

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
