import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsService } from '../../../api/events';
import { authService } from '../../../api/auth';
import { Button } from '../../../components/Button';
import { ErrorDisplay } from '../../../components/ErrorDisplay/ErrorDisplay';
import styles from '../Events.module.css';

interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  createdBy: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string, statusCode?: number} | null>(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventsService.getEvents();
        setEvents(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Не удалось загрузить мероприятия';
        const statusCode = err.response?.status || 500;
        setError({ message: errorMessage, statusCode });
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить мероприятие?')) return;
    
    try {
      await eventsService.deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Не удалось удалить мероприятие';
      const statusCode = err.response?.status || 500;
      setError({ message: errorMessage, statusCode });
      console.error('Ошибка удаления:', err);
    }
  };

  if (loading) return (
    <div className={styles.mainContent}>
      <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
        Загрузка мероприятий...
      </div>
    </div>
  );

  return (
    <div className={styles.mainContent}>
      {error && (
        <ErrorDisplay 
          error={error.message}
          statusCode={error.statusCode}
          onClose={() => setError(null)}
          autoCloseDelay={5000}
        />
      )}

      <div className={styles.eventsHeader}>
        <h1 className={styles.eventsTitle}>Мероприятия</h1>
        {currentUser && (
          <Link to="/events/new" className={styles.createButton}>
            <span>+</span> Создать мероприятие
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
          Нет доступных мероприятий
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {events.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventImage}>
                <span className={styles.eventDateBadge}>
                  {new Date(event.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className={styles.eventContent}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                {event.description && (
                  <p className={styles.eventDescription}>{event.description}</p>
                )}
                <div className={styles.eventFooter}>
                  <span className={styles.eventCreator}>
                    <span>👤</span> {event.creator?.name || 'Неизвестен'}
                  </span>
                  
                  {currentUser?.id === event.createdBy && (
                    <div className={styles.eventActions}>
                      <Button 
                        to={`/events/edit/${event.id}`}
                        variant="secondary"
                      >
                        Редактировать
                      </Button>
                      <Button 
                        onClick={() => handleDelete(event.id)}
                        variant="danger"
                      >
                        Удалить
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};