import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={`${styles.header} glass-panel`}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input type="text" placeholder="Search suppliers, POs, or disruption events..." />
      </div>

      <div className={styles.actions}>
        <div className={styles.actionButton}>
          <span>🔔</span>
          <div className={styles.badge}>3</div>
        </div>
        <div className={styles.profile}>
          <div className={styles.avatar}>OP</div>
          <span>Operations Lead</span>
        </div>
      </div>
    </header>
  );
}
