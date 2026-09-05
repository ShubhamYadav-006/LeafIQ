import React from 'react';
import { Eye, MessageSquareCheck, AlertCircle } from 'lucide-react';

export const EvidenceBreakdown = ({ evidence, alternatives }) => {
  if (!evidence) return null;

  const visualList = evidence.visual || [];
  const farmerList = evidence.farmer_reported || [];

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>
        🔍 Transparent Evidence & Rationale
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Visual Evidence Card */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Eye size={20} color="var(--primary)" />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-hover)' }}>
              From the Leaf Photo (Visual)
            </h4>
          </div>
          {visualList.length > 0 ? (
            <ul style={{ paddingLeft: '18px', fontSize: '14px', color: 'var(--text-main)' }}>
              {visualList.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No visual features recorded.</p>
          )}
        </div>

        {/* Farmer-Reported Evidence Card */}
        <div className="card" style={{ borderTop: '4px solid #10B981', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageSquareCheck size={20} color="#10B981" />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#047857' }}>
              From Your Answers (Field Context)
            </h4>
          </div>
          {farmerList.length > 0 ? (
            <ul style={{ paddingLeft: '18px', fontSize: '14px', color: 'var(--text-main)' }}>
              {farmerList.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No farmer field observations recorded.</p>
          )}
        </div>
      </div>

      {/* Alternative Possibilities if available */}
      {alternatives && alternatives.length > 0 && (
        <div className="card" style={{ marginTop: '16px', backgroundColor: '#FFF9DB', border: '1px solid #FFE066' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertCircle size={18} color="#E67700" />
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#E67700' }}>
              Alternative Differential Possibilities
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alternatives.map((alt, idx) => (
              <div key={idx} style={{ fontSize: '14px', color: 'var(--text-main)' }}>
                <strong>{alt.condition_name}</strong> ({(alt.confidence * 100).toFixed(0)}% match) —{' '}
                <span>{alt.reasoning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceBreakdown;
