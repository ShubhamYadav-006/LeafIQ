import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSelector = () => {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          minHeight: '36px',
          fontSize: '13px',
          fontWeight: '600',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--surface)',
        }}
        title="Change Language / भाषा बदलें / भाषा बदला"
      >
        <Globe size={16} color="var(--primary)" />
        <span style={{ fontWeight: '700' }}>{currentLang.native}</span>
        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            minWidth: '150px',
            overflow: 'hidden',
          }}
        >
          {languages.map((l) => {
            const isSelected = l.code === language;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-base)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{l.native} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({l.label})</span></span>
                {isSelected && <Check size={16} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
