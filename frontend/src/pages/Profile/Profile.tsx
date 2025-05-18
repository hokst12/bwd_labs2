// src/pages/Profile/Profile.tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUserInfo, fetchUserEvents, clearUserError } from '../../features/user/userSlice';
import { authService } from '../../api/auth';
import { Header } from '../../components/Header/Header';
import { ErrorDisplay } from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Profile.module.css';
import { EventCard } from '../../components/EventCard/EventCard';

export const Profile = () => {
  const dispatch = useAppDispatch();
  const { info, events, loading, error } = useAppSelector((state) => state.user);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserInfo(currentUser.id));
      dispatch(fetchUserEvents(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  const sortedEvents = [...events].sort((a, b) => {
    if (a.deletedAt && !b.deletedAt) return 1;
    if (!a.deletedAt && b.deletedAt) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  function handleEditEvent(eventId: number): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.profileContainer}>
        {error && (
        <ErrorDisplay
          error={error.message}
          statusCode={error.statusCode || 500}
          onClose={() => dispatch(clearUserError())}
          autoCloseDelay={5000}
        />
      )}

          <div className={styles.profileCard}>
            <h2 className={styles.profileTitle}>Личный кабинет</h2>
            
            {loading && !info ? (
              <div className={styles.loading}>Загрузка информации...</div>
            ) : (
              <div className={styles.userInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ID:</span>
                  <span className={styles.infoValue}>{currentUser?.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Имя:</span>
                  <span className={styles.infoValue}>{currentUser?.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{currentUser?.email}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.eventsSection}>
            <h3 className={styles.sectionTitle}>Мои мероприятия</h3>
            {loading && events.length === 0 ? (
              <div className={styles.loading}>Загрузка мероприятий...</div>
            ) : sortedEvents.length === 0 ? (
              <div className={styles.noEvents}>Нет созданных мероприятий</div>
            ) : (
              <div className={styles.eventsGrid}>
                {sortedEvents.map((event) => (
        <EventCard 
          key={event.id}
          event={event}
          showCreator={false}
          showActions={true}
          currentUserId={currentUser?.id}
        />
      ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};