import { Header } from '../../components/Header/Header';
import { Outlet } from 'react-router-dom';
import styles from './Events.module.css';

export const Events = () => {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};