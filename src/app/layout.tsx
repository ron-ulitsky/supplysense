import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'SupplySense | Supply Chain Co-Pilot',
  description: 'Autonomous Supply Chain Resilience Agent for Tier-2 EV Manufacturers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ marginLeft: '320px', flex: 1, padding: '20px 24px 20px 0', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
