import React, { useState, useEffect } from 'react';
import { useScanFlow, STEPS } from '../../context/ScanFlowContext';
import { useLanguage } from '../../context/LanguageContext';
import { scanApi } from '../../services/api';
import { ConcernBadge } from '../../components/common/ConcernBadge';
import { Calendar, PlusCircle, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';

export const ScanHistoryPage = () => {
  const { setCurrentStep, setSelectedHistoryScanId, startCropCheck } = useScanFlow();
  const { t, translateCrop, translateCondition } = useLanguage();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await scanApi.listScans();
        if (res.success && res.data?.scans) {
          setScans(res.data.scans);
        }
      } catch (err) {
        console.error('Fetch scan history error:', err);
        setErrorMsg(err.message || 'Failed to load scan history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSelectScan = (scanId) => {
    setSelectedHistoryScanId(scanId);
    setCurrentStep(STEPS.SCAN_DETAILS);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-hover)', margin: 0 }}>
            {t('scanHistoryTitle')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {t('scanHistorySubtitle')}
          </p>
        </div>

        <button
          onClick={startCropCheck}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '8px 16px', minHeight: '40px', fontSize: '14px' }}
        >
          <PlusCircle size={16} /> {t('startCropCheck')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p>{t('processing')}</p>
        </div>
      ) : errorMsg ? (
        <div className="card" style={{ textAlign: 'center', color: '#C92A2A', backgroundColor: '#FFE3E3' }}>
          <p>{errorMsg}</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ImageIcon size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{t('noScansTitle')}</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {t('noScansDesc')}
          </p>
          <button onClick={startCropCheck} className="btn btn-primary" style={{ maxWidth: '240px', margin: '0 auto' }}>
            <PlusCircle size={18} /> {t('startCropCheck')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {scans.map((scan) => {
            const rawCrop = scan.crop_name || scan.crop || 'Crop';
            const rawCond = scan.final_condition || scan.initial_condition || 'Healthy';
            return (
              <div
                key={scan.id}
                onClick={() => handleSelectScan(scan.id)}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  marginBottom: 0,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                      {translateCrop(rawCrop)}
                    </h4>
                    <ConcernBadge level={scan.concern_level || 'attention'} />
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {t('conditionLabel')} <strong>{translateCondition(rawCond)}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>{t('scannedOn', { date: new Date(scan.created_at).toLocaleDateString() })}</span>
                  </div>
                </div>

                <ArrowRight size={20} color="var(--text-muted)" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScanHistoryPage;


