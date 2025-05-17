import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { authService } from '../../api/auth';
import styles from './Main.module.css';

export const Main = () => {
  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.logoContainer}>
          <img src="/logo2.png" alt="EventApp Logo" className={styles.logo} />
        </div>

        <h1 className={styles.title}>
          Добро пожаловать{user ? `, ${user.name}` : ''}!
        </h1>
        <p className={styles.description}>
          Платформа для организации мероприятий
        </p>

        {isAuth ? (
          <div className={styles.authButtons}>
            <Button to="/events" variant="primary">
              Перейти к мероприятиям
            </Button>
          </div>
        ) : (
          <div className={styles.buttons}>
            <Button to="/auth">Войти</Button>
            <Button to="/register" variant="secondary">
              Регистрация
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
