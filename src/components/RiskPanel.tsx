'use client';

import { useState } from 'react';
import styles from './RiskPanel.module.css';
import { DisruptionEvent } from '@/data/mockData';
import { AIAnalysisResult, mockAIAnalysis } from '@/data/mockAIResult';
import Markdown from './Markdown';

interface Props {
  disruption: DisruptionEvent | null;
  onClose: () => void;
  companyProfile: string;
}

export default function RiskAnalysisPanel({ disruption, onClose, companyProfile }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [visibleExplanation, setVisibleExplanation] = useState<string | null>(null);

  if (!disruption) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setVisibleExplanation(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disruption,
          companyProfile,
          supplierDetails: { mock: "details" } // Mocking supplier details for now
        })
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Failed to analyze", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    if (impact.startsWith('High')) return 'var(--danger-color)';
    if (impact.startsWith('Medium')) return 'var(--warning-color)';
    return 'var(--success-color)';
  };

  return (
    <div className={`${styles.panelWrapper} glass-panel`}>
      <div className={styles.header}>
        <h3>Risk Intelligence Report</h3>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.disruptionDetails}>
        <h4 className="title-glow">{disruption.title}</h4>
        <p className={styles.region}>📍 {disruption.region}</p>
        <div className={styles.impactTags}>
          {disruption.affectedComponents.map(c => (
            <span key={c} className={styles.tag}>{c}</span>
          ))}
        </div>
      </div>

      {!analysis && !isAnalyzing && (
        <div className={styles.actionState}>
          <p>SupplySense AI is standing by to evaluate mitigation strategies.</p>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAnalyze}>
            Generate AI Mitigation Plan
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className={styles.actionState}>
          <div className={styles.spinner}></div>
          <p className={styles.thinkingText}>Gemini AI is simulating trade-offs for {companyProfile.split(':')[0]}...</p>
        </div>
      )}

      {analysis && (
        <div className={styles.analysisResults}>
          <div className={styles.summaryBox}>
            <span className={styles.icon}>🧠</span>
            <Markdown>{analysis.analysisSummary}</Markdown>
          </div>

          <h5 className={styles.stratTitle}>Recommended Mitigation Strategies</h5>
          <div className={styles.strategiesList}>
            {analysis.strategies.map((strat, idx) => (
              <div key={strat.id} className={styles.strategyCard}>
                <div className={styles.stratHeader}>
                  <div className={styles.badge}>Option {idx + 1}</div>
                  <h6>{strat.name}</h6>
                  <button
                    onClick={() => setVisibleExplanation(visibleExplanation === strat.id ? null : strat.id)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: '1px solid var(--accent-color)',
                      color: 'var(--accent-color)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Explain Logic ✨
                  </button>
                </div>
                <div className={styles.stratDesc}><Markdown>{strat.description}</Markdown></div>

                {visibleExplanation === strat.id && (
                  <div style={{
                    margin: '10px 0',
                    padding: '10px',
                    background: 'rgba(88, 101, 242, 0.1)',
                    borderLeft: '3px solid var(--accent-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>AI Reasoning:</strong> <Markdown>{strat.explanation}</Markdown>
                  </div>
                )}

                <div className={styles.tradeoffs}>
                  <div className={styles.tradeoffRow}>
                    <span className={styles.label}>Cost:</span>
                    <span style={{ color: getImpactColor(strat.tradeoffs.costImpact) }}>{strat.tradeoffs.costImpact}</span>
                  </div>
                  <div className={styles.tradeoffRow}>
                    <span className={styles.label}>SLA Risk:</span>
                    <span style={{ color: getImpactColor(strat.tradeoffs.serviceLevelImpact) }}>{strat.tradeoffs.serviceLevelImpact}</span>
                  </div>
                  <div className={styles.tradeoffRow}>
                    <span className={styles.label}>Resilience:</span>
                    <span style={{ color: getImpactColor(strat.tradeoffs.resilienceImpact) }}>{strat.tradeoffs.resilienceImpact}</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  {strat.suggestedActions.map((action, aIdx) => (
                    <button key={aIdx} className={styles.actionBtn}>
                      Execute: {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
