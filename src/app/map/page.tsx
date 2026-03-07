'use client';

import React from 'react';
import { Globe, AlertTriangle } from 'lucide-react';
import DisruptionMap from '@/components/DisruptionMap';
import { mockDisruptions } from '@/data/mockData';

export default function MapPage() {
  const activeCount = mockDisruptions.length;
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe className="title-glow" /> Global Disruption Map
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Live tracking of Tier-1 and Tier-2 supply chain nodes.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle color="var(--danger-color)" />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Severe Threats</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{activeCount}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <DisruptionMap />
        
        {/* Overlay Legend */}
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'rgba(0,0,0,0.6)', padding: '16px', borderRadius: '8px', border: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)' }}>
          <h4 style={{ color: '#fff', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Threat Level</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger-color)' }}></div> Critical
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff9800' }}></div> High
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning-color)' }}></div> Medium
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
