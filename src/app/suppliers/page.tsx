'use client';

import React from 'react';
import { Package, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { mockSuppliers } from '@/data/mockData';

export default function SuppliersPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Package className="title-glow" /> Supplier Network Health
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Monitoring real-time performance, ESG compliance, and financial health for {mockSuppliers.length} active Tier-1 and Tier-2 suppliers.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {mockSuppliers.map(supplier => (
          <div key={supplier.id} className="glass-panel" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>{supplier.name}</h3>
                <span style={{ fontSize: '12px', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-secondary)' }}>Tier {supplier.tier}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} /> Region: {supplier.region}
                </div>
                <div>
                  Components: <span style={{ color: 'var(--accent-color)' }}>{supplier.componentsSupplied.join(', ')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Health Score</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: supplier.healthScore > 80 ? 'var(--success-color)' : supplier.healthScore > 50 ? 'var(--warning-color)' : 'var(--danger-color)' }}>
                  {supplier.healthScore}/100
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
                {supplier.activeAlerts > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--danger-color)', fontSize: '14px', fontWeight: 'bold' }}>
                    <ShieldAlert size={16} /> {supplier.activeAlerts} Alerts
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--success-color)', fontSize: '14px', fontWeight: 'bold' }}>
                    <CheckCircle2 size={16} /> Healthy
                  </div>
                )}
              </div>
              
              <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>
                View Profile
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
