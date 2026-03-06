"use client";

import { useState } from 'react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('dashboard');
  return (
    <nav className={`${styles.sidebar} glass-panel`}>
      <div className={styles.logo}>
        <h1 className="title-glow">SupplySense</h1>
        <span className={styles.subtitle}>Tier-2 EV Supply Chain</span>
      </div>
      
      <ul className={styles.navList}>
        <li 
          className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className={styles.icon}>🎯</span> Dashboard
        </li>
        <li 
          className={`${styles.navItem} ${activeTab === 'map' ? styles.active : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <span className={styles.icon}>🌍</span> Global Disruption Map
        </li>
        <li 
          className={`${styles.navItem} ${activeTab === 'suppliers' ? styles.active : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          <span className={styles.icon}>📦</span> Suppliers
        </li>
        <li 
          className={`${styles.navItem} ${activeTab === 'intelligence' ? styles.active : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          <span className={styles.icon}>🧠</span> Intelligence Engine
        </li>
      </ul>

      <div className={styles.bottomSection}>
        <div className={styles.statusBox}>
          <div className={styles.statusIndicator}></div>
          <span>System Online</span>
        </div>
      </div>
    </nav>
  );
}
