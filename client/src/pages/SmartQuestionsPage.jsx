import React, { useState } from 'react';
import { useScanFlow, STEPS } from '../context/ScanFlowContext';
import { scanApi } from '../services/api';
import { ArrowRight, ArrowLeft, Check, HelpCircle } from 'lucide-react';

export const SmartQuestionsPage = () => {
  const {
    currentScan,
    questions,
    farmerAnswers,
    setFarmerAnswers,
    setCurrentStep,
    setFlowError,
  } = useScanFlow();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentQ = questions[questionIndex] || {
    id: 'q-default',
    question_text: 'Where are the spots located on the plant foliage?',
    options: [
      'Older leaves near the bottom',
      'Younger leaves at the top canopy',
      'Spread evenly across whole plant',
      'Stems or fruit only',
    ],
  };

  const selectedOption = farmerAnswers[currentQ.id] || '';

  const handleSelectOption = (option) => {
    setFarmerAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const handleNext = async () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      // Submit all answers to backend
      setSubmitting(true);
      setFlowError(null);
      setCurrentStep(STEPS.FARMER_ANSWERS);

      try {
        const answerPayload = Object.entries(farmerAnswers).map(([qId, opt]) => ({
          question_id: qId,
          selected_options: Array.isArray(opt) ? opt : [opt],
        }));

        if (currentScan?.id && answerPayload.length > 0) {
          await scanApi.submitAnswers(currentScan.id, answerPayload);
        }

        // Trigger final synthesis
        if (currentScan?.id) {
          const finalRes = await scanApi.finalizeScan(currentScan.id);
          if (finalRes.success) {
            setCurrentStep(STEPS.FINAL_ASSESSMENT);
          }
        }
      } catch (err) {
        console.error('Submit answers error:', err);
        setFlowError(err.message || 'Failed to submit answers. Proceeding with visual assessment.');
        setCurrentStep(STEPS.FINAL_ASSESSMENT);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Question Header & Counter */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
          Question {questionIndex + 1} of {Math.max(questions.length, 1)}
        </span>
        {questionIndex > 0 && (
          <button
            onClick={() => setQuestionIndex((prev) => prev - 1)}
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '13px' }}
          >
            <ArrowLeft size={14} /> Previous
          </button>
        )}
      </div>

      {/* Question Title */}
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-hover)', marginBottom: '20px' }}>
        {currentQ.question_text}
      </h3>

      {/* Option Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {currentQ.options?.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          return (
            <div
              key={idx}
              onClick={() => handleSelectOption(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-strong)',
                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '56px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: isSelected ? '700' : '500', color: 'var(--text-main)' }}>
                {opt}
              </span>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: isSelected ? 'none' : '2px solid var(--border-strong)',
                  backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isSelected && <Check size={16} color="#FFFFFF" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action CTA */}
      <button
        onClick={handleNext}
        className="btn btn-primary"
        disabled={!selectedOption || submitting}
        style={{ height: '50px' }}
      >
        {submitting ? (
          'Synthesizing Assessment...'
        ) : questionIndex < questions.length - 1 ? (
          <>
            Next Question <ArrowRight size={20} />
          </>
        ) : (
          <>
            Submit & View Final Report <ArrowRight size={20} />
          </>
        )}
      </button>
    </div>
  );
};

export default SmartQuestionsPage;
