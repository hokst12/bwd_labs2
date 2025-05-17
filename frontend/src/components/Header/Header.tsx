import { Link } from 'react-router-dom';
import cn from 'classnames';
import { authService } from '../../api/auth';
import styles from './Header.module.css';

export const Header = () => {
  const user = authService.getCurrentUser();
  const isAuth = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        EventApp
      </Link>
      <nav className={styles.nav}>
        {isAuth ? (
          <>
            <span className={styles.username}>{user?.name}</span>
            <button onClick={handleLogout} className={styles.link}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/auth" className={styles.link}>
              Войти
            </Link>
            <Link to="/register" className={cn(styles.link, styles.primary)}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
