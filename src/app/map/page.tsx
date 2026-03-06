import React from 'react';
import { Globe } from 'lucide-react';

export default function MapPage() {
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <Globe size={64} style={{ marginBottom: '20px', color: 'var(--text-secondary)' }} />
      <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>Global Disruption Map</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.6' }}>
        This module provides an interactive 3D globe visualizing supply chain flows and active geopolitical risk zones. 
        <br /><br />
        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>[Prototype Limitation: Map visualization under development]</span>
      </p>
    </div>
  );
}
