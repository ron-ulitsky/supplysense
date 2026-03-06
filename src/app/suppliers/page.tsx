import React from 'react';
import { Package } from 'lucide-react';

export default function SuppliersPage() {
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <Package size={64} style={{ marginBottom: '20px', color: 'var(--text-secondary)' }} />
      <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>Supplier Network Health</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.6' }}>
        This module tracks real-time performance, ESG compliance, and financial health scores for all Tier-2 EV component suppliers.
        <br /><br />
        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>[Prototype Limitation: Supplier database integration pending]</span>
      </p>
    </div>
  );
}
