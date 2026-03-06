"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className={`${styles.sidebar} glass-panel`}>
      <div className={styles.logo}>
        <h1 className="title-glow">SupplySense</h1>
        <span className={styles.subtitle}>Tier-2 EV Supply Chain</span>
      </div>
      
      <ul className={styles.navList}>
        <li className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
            <span className={styles.icon}>🎯</span> Dashboard
          </Link>
        </li>
        <li className={`${styles.navItem} ${pathname === '/map' ? styles.active : ''}`}>
          <Link href="/map" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
            <span className={styles.icon}>🌍</span> Global Disruption Map
          </Link>
        </li>
        <li className={`${styles.navItem} ${pathname === '/suppliers' ? styles.active : ''}`}>
          <Link href="/suppliers" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
            <span className={styles.icon}>📦</span> Suppliers
          </Link>
        </li>
        <li className={`${styles.navItem} ${pathname === '/intelligence' ? styles.active : ''}`}>
          <Link href="/intelligence" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
            <span className={styles.icon}>🧠</span> Intelligence Engine
          </Link>
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
