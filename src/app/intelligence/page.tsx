'use client';

import React, { useState } from 'react';
import { BrainCircuit, Settings, SlidersHorizontal, UserCog, Network, Save } from 'lucide-react';

export default function IntelligencePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
      
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrainCircuit className="title-glow" /> Intelligence Engine Configuration
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Tune the Gemini reasoning parameters, risk thresholds, and autonomous action permissions.
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          style={{ 
            padding: '10px 24px', 
            background: saved ? 'var(--success-color)' : 'var(--accent-color)', 
            border: 'none', 
            borderRadius: '6px', 
            color: '#fff', 
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.3s ease'
          }}
        >
          {isSaving ? 'Saving...' : saved ? 'Configuration Saved!' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Model Parameters */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <Settings size={20} color="var(--accent-color)" /> Foundation Model Parameters
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Active Model</label>
            <select style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }}>
              <option>gemini-2.5-flash (Optimized for speed/agents)</option>
              <option>gemini-2.5-pro (High complex reasoning)</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              Temperature: <span style={{ color: '#fff' }}>0.2</span>
            </label>
            <input type="range" min="0" max="1" step="0.1" defaultValue="0.2" style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>Strict/Analytical</span>
              <span>Creative</span>
            </div>
          </div>
        </div>

        {/* OEM SLA Constraints */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <Network size={20} color="var(--warning-color)" /> OEM SLA Constraints
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Maximum Acceptable Line Down Time (Hours)</label>
            <input type="number" defaultValue="4" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Premium Freight Approval Threshold ($)</label>
            <input type="number" defaultValue="50000" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff' }} />
          </div>
        </div>

        {/* Autonomous Execution Rules */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--panel-border)', gridColumn: '1 / -1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            <UserCog size={20} color="var(--danger-color)" /> Autonomous Execution Boundaries
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '12px' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>Require Human-in-the-Loop (HITL) for all actions</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Drafts emails and ERP suggestions into the Action Inbox, but requires manual clicks to execute.</div>
            </div>
            <div style={{ width: '40px', height: '24px', background: 'var(--accent-color)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>Auto-Approve High Confidence Actions ({'>'}95%)</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>If AI confidence exceeds 95% and financial impact is {`<`} threshold, bypass inbox and execute automatically.</div>
            </div>
            <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }}></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
