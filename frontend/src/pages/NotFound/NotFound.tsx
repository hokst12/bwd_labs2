import { Button } from '../../components/Button';
import styles from './NotFound.module.css';

export const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Страница не найдена</p>
        <p className={styles.description}>
          Запрашиваемая вами страница не существует или была перемещена
        </p>
        <Button to="/" variant="primary" className={styles.button}>
          На главную
        </Button>
      </div>
    </div>
  );
};
