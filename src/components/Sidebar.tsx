import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <nav className={`${styles.sidebar} glass-panel`}>
      <div className={styles.logo}>
        <h1 className="title-glow">SupplySense</h1>
        <span className={styles.subtitle}>Tier-2 EV Supply Chain</span>
      </div>
      
      <ul className={styles.navList}>
        <li className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.icon}>🎯</span> Dashboard
        </li>
        <li className={styles.navItem}>
          <span className={styles.icon}>🌍</span> Global Disruption Map
        </li>
        <li className={styles.navItem}>
          <span className={styles.icon}>📦</span> Suppliers
        </li>
        <li className={styles.navItem}>
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
