"use client";

import { useState } from 'react';
import { AlertTriangle, CircleDollarSign, Bot, MailWarning } from 'lucide-react';
import styles from './page.module.css';
import { mockDisruptions, DisruptionEvent } from '@/data/mockData';
import RiskAnalysisPanel from '@/components/RiskPanel';
import ActionInbox from '@/components/ActionInbox';
import DisruptionMap from '@/components/DisruptionMap';

export default function Home() {
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionEvent | null>(null);
  const [companyProfile, setCompanyProfile] = useState("Company A: High Cash, Low Inventory Buffer");

  const toggleProfile = () => {
    setCompanyProfile(prev =>
      prev === "Company A: High Cash, Low Inventory Buffer"
        ? "Company B: Low Cash, High Inventory Buffer"
        : "Company A: High Cash, Low Inventory Buffer"
    );
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical': return styles.severityCritical;
      case 'high': return styles.severityHigh;
      case 'medium': return styles.severityMedium;
      case 'low': return styles.severityLow;
      default: return styles.severityLow;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--danger-color)';
      case 'high': return 'var(--danger-color)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--success-color)';
    }
  };

  return (
    <div className={styles.dashboard} style={{ position: 'relative' }}>
      <RiskAnalysisPanel
        disruption={selectedDisruption}
        onClose={() => setSelectedDisruption(null)}
        companyProfile={companyProfile}
      />

      <div className={styles.headerRow}>
        <div className={styles.titleSection}>
          <h2 className="title-glow">SupplySense Overview</h2>
          <p>Global disruption risk assessment for Tier-2 EV Supply Chain.</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.profileToggleSection} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Profile:</span>
            <button
              onClick={toggleProfile}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {companyProfile.split(':')[0]} ⇄
            </button>
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>Run Global AI Scan</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <AlertTriangle className={styles.statIcon} size={24} style={{ color: 'var(--danger-color)' }} />
          <div className={styles.statInfo}>
            <div className={styles.statValue}>3</div>
            <div className={styles.statLabel}>Active Disruptions</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <CircleDollarSign className={styles.statIcon} size={24} style={{ color: 'var(--accent-color)' }} />
          <div className={styles.statInfo}>
            <div className={styles.statValue}>$12.4M</div>
            <div className={styles.statLabel}>Revenue at Risk</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Bot className={styles.statIcon} size={24} style={{ color: 'var(--success-color)' }} />
          <div className={styles.statInfo}>
            <div className={styles.statValue} style={{ color: 'var(--success-color)' }}>14</div>
            <div className={styles.statLabel}>Auto-Mitigations (30d)</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <MailWarning className={styles.statIcon} size={24} style={{ color: 'var(--warning-color)' }} />
          <div className={styles.statInfo}>
            <div className={styles.statValue} style={{ color: 'var(--warning-color)' }}>2</div>
            <div className={styles.statLabel}>Actions Awaiting Approval</div>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.mapSection}>
          <div className={styles.sectionHeader}>
            <h3>Global Disruption Map</h3>
            <span className={styles.liveTag}>LIVE</span>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: '500px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
            <DisruptionMap />
          </div>
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sectionHeader}>
            <h3>Intelligence Feed (SupplySense)</h3>
          </div>
          <div className={styles.feedList}>
            {mockDisruptions.map((disruption) => (
              <div
                key={disruption.id}
                className={styles.feedItem}
                onClick={() => setSelectedDisruption(disruption)}
              >
                <div className={`${styles.severity} ${getSeverityClass(disruption.severity)}`}></div>
                <div className={styles.feedContent}>
                  <h4>{disruption.title}</h4>
                  <p>Affects: {disruption.affectedComponents.join(', ')}</p>
                  <p style={{ fontSize: '10px', marginTop: '2px' }}>+ {disruption.estimatedDelayDays} Days Lead Time</p>
                  <span className={styles.timestamp}>{new Date(disruption.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', flex: 1 }}>
            <ActionInbox />
          </div>
        </div>
      </div>
    </div>
  );
}
