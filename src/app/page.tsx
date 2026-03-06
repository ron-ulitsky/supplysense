"use client";

import { useState } from 'react';
import styles from './page.module.css';
import { mockDisruptions, DisruptionEvent } from '@/data/mockData';
import RiskAnalysisPanel from '@/components/RiskPanel';
import ActionInbox from '@/components/ActionInbox';

export default function Home() {
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionEvent | null>(null);

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
      />
      
      <div className={styles.headerRow}>
        <div className={styles.titleSection}>
          <h2 className="title-glow">IonTrack Overview</h2>
          <p>Global disruption risk assessment for Tier-2 EV Supply Chain.</p>
        </div>
        <div className={styles.controls}>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>Run Global AI Scan</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⚠️</span>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>3</div>
            <div className={styles.statLabel}>Active Disruptions</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>💰</span>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>$12.4M</div>
            <div className={styles.statLabel}>Revenue at Risk</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🤖</span>
          <div className={styles.statInfo}>
            <div className={styles.statValue} style={{ color: 'var(--success-color)' }}>14</div>
            <div className={styles.statLabel}>Auto-Mitigations (30d)</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📩</span>
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
          <div className={styles.mapPlaceholder}>
            {/* Mock positions for the disruptions */}
            <div className={styles.pulsingDot} style={{ top: '45%', left: '60%', backgroundColor: getSeverityColor('high') }}></div>
            <div className={styles.pulsingDot} style={{ top: '75%', left: '30%', backgroundColor: getSeverityColor('critical') }}></div>
            <div className={styles.pulsingDot} style={{ top: '35%', left: '80%', backgroundColor: getSeverityColor('medium') }}></div>
            <p className={styles.mapText}>Interactive Map Active<br/><span style={{fontSize: '11px', color: 'var(--text-secondary)'}}>Tracking 42 Tier-1/Tier-2 Nodes</span></p>
          </div>
        </div>
        
        <div className={styles.sideSection}>
          <div className={styles.sectionHeader}>
            <h3>Intelligence Feed (IonTrack)</h3>
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
                  <p style={{fontSize: '10px', marginTop: '2px'}}>+ {disruption.estimatedDelayDays} Days Lead Time</p>
                  <span className={styles.timestamp}>{new Date(disruption.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
