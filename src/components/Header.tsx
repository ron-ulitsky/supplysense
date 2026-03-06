import { Search, Bell, User } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={`${styles.header} glass-panel`}>
      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} size={18} />
        <input type="text" placeholder="Search suppliers, POs, or disruption events..." />
      </div>

      <div className={styles.actions}>
        <div className={styles.actionButton}>
          <Bell size={20} />
          <div className={styles.badge}>3</div>
        </div>
        <div className={styles.profile}>
          <div className={styles.avatar}><User size={16} /></div>
          <span>Operations Lead</span>
        </div>
      </div>
    </header>
  );
}
