'use client';

import { useState } from 'react';
import { CheckCircle2, Mail, Settings, X, Check } from 'lucide-react';
import styles from './ActionInbox.module.css';

interface ActionItem {
  id: string;
  type: 'email' | 'erp' | 'escalation';
  title: string;
  recipient: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  confidence: number;
}

const mockActions: ActionItem[] = [
  {
    id: 'a-1',
    type: 'email',
    title: 'Draft: Renegotiate OEM SLA Delivery',
    recipient: 'procurement-team@oem-alpha.de',
    content: "Notice of Force Majeure Delay: Due to severe Red Sea port congestion, we anticipate a 21-day delay on the Battery Management Controllers. We request a rolling delivery schedule to avoid 100% line stoppage. We will absorb standard air-freight premiums for 30% of the buffer stock.",
    status: 'pending',
    confidence: 94,
  },
  {
    id: 'a-2',
    type: 'erp',
    title: 'Draft: ERP Safety Stock Adjustment',
    recipient: 'SAP S/4HANA (System)',
    content: "Increase minimum buffer stock for part #EV-MCU-14nm from 14 days to 28 days based on TMC Yield Drop alerts.",
    status: 'pending',
    confidence: 88,
  }
];

export default function ActionInbox() {
  const [actions, setActions] = useState<ActionItem[]>(mockActions);

  const handleAction = (id: string, newStatus: 'approved' | 'rejected') => {
    setActions(actions.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const pendingActions = actions.filter(a => a.status === 'pending');

  if (pendingActions.length === 0) {
    return (
      <div className={`${styles.inboxWrapper} glass-panel`}>
        <div className={styles.emptyState}>
          <CheckCircle2 className={styles.icon} size={40} />
          <p>Inbox Zero. All AI-recommended actions have been processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.inboxWrapper} glass-panel`}>
      <div className={styles.header}>
        <h3>AI Co-Pilot Action Inbox</h3>
        <span className={styles.countBadge}>{pendingActions.length} Pending</span>
      </div>

      <div className={styles.list}>
        {pendingActions.map(action => (
          <div key={action.id} className={styles.actionCard}>
            <div className={styles.cardHeader}>
              <div className={styles.typeTag}>
                {action.type === 'email' ? <><Mail size={12} style={{marginRight: '6px', verticalAlign: 'middle'}}/>Email Draft</> : <><Settings size={12} style={{marginRight: '6px', verticalAlign: 'middle'}}/>ERP Command</>}
              </div>
              <div className={styles.confidence}>AI Confidence: {action.confidence}%</div>
            </div>
            
            <h4 className={styles.title}>{action.title}</h4>
            <p className={styles.recipient}>To: {action.recipient}</p>
            
            <div className={styles.contentPreview}>
              {action.content}
            </div>

            <div className={styles.actionButtons}>
              <button 
                className={`${styles.btn} ${styles.btnReject}`}
                onClick={() => handleAction(action.id, 'rejected')}
              >
                <X size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Reject Overide
              </button>
              <button 
                className={`${styles.btn} ${styles.btnApprove}`}
                onClick={() => handleAction(action.id, 'approved')}
              >
                <Check size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Approve & Execute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
