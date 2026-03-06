import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function IntelligencePage() {
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <BrainCircuit size={64} style={{ marginBottom: '20px', color: 'var(--text-secondary)' }} />
      <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>Intelligence Engine Settings</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.6' }}>
        Configure risk thresholds, custom Gemini prompt instructions, and OEM Service Level Agreement constraints.
        <br /><br />
        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>[Prototype Limitation: Head over to the Dashboard to see the Intelligence Engine in action]</span>
      </p>
    </div>
  );
}
