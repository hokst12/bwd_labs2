import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsService } from '../../../api/events';
import { authService } from '../../../api/auth';
import { Button } from '../../../components/Button';
import { ErrorDisplay } from '../../../components/ErrorDisplay/ErrorDisplay';
import styles from '../Events.module.css';
import React from 'react';

interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  createdBy: number;
  deletedAt: string | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    statusCode?: number;
  } | null>(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsService.getEvents(showDeleted);

        // Сортируем мероприятия: сначала активные, потом удалённые
        const sortedEvents = [...data].sort((a, b) => {
          if (a.deletedAt && !b.deletedAt) return 1; // b (активное) должно быть первым
          if (!a.deletedAt && b.deletedAt) return -1; // a (активное) должно быть первым
          return new Date(a.date).getTime() - new Date(b.date).getTime(); // Сортировка по дате
        });

        setEvents(sortedEvents);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Не удалось загрузить мероприятия';
        const statusCode = err.response?.status || 500;
        setError({ message: errorMessage, statusCode });
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [showDeleted]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить мероприятие?')) return;

    try {
      await eventsService.deleteEvent(id);
      setEvents(
        events.map((event) =>
          event.id === id
            ? { ...event, deletedAt: new Date().toISOString() }
            : event,
        ),
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Не удалось удалить мероприятие';
      const statusCode = err.response?.status || 500;
      setError({ message: errorMessage, statusCode });
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await eventsService.restoreEvent(id);
      setEvents(
        events.map((event) =>
          event.id === id ? { ...event, deletedAt: null } : event,
        ),
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Не удалось восстановить мероприятие';
      const statusCode = err.response?.status || 500;
      setError({ message: errorMessage, statusCode });
    }
  };

  if (loading)
    return (
      <div className={styles.mainContent}>
        <div
          className={styles.card}
          style={{ textAlign: 'center', padding: '3rem' }}
        >
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
        />
      )}

      <div className={styles.eventsHeader}>
        <h1 className={styles.eventsTitle}>Мероприятия</h1>
        <div className={styles.eventsControls}>
          <div className={styles.toggleContainer}>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={() => setShowDeleted(!showDeleted)}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.toggleText}>
              {showDeleted ? 'Показать активные' : 'Показать удалённые'}
            </span>
          </div>

          {currentUser && (
    <Link to="/events/new" className={styles.createButton}>
      <span>+</span> Создать мероприятие
    </Link>
  )}
        </div>
      </div>

      {events.length === 0 ? (
        <div
          className={styles.card}
          style={{ textAlign: 'center', padding: '3rem' }}
        >
          {showDeleted
            ? 'Нет удалённых мероприятий'
            : 'Нет доступных мероприятий'}
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {events.map((event, index) => {
            // Добавляем разделитель перед первым удалённым мероприятием
            const showDivider =
              event.deletedAt && (index === 0 || !events[index - 1].deletedAt);

            return (
              <React.Fragment key={event.id}>
                {showDivider && (
                  <div className={styles.eventsDivider}>
                    Удалённые мероприятия
                  </div>
                )}
                <div
                  className={`${styles.eventCard} ${event.deletedAt ? styles.deletedEvent : ''}`}
                >
                  <div className={styles.eventImage}>
                    <span className={styles.eventDateBadge}>
                      {new Date(event.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {event.deletedAt && (
                      <span className={styles.deletedBadge}>
                        Удалено:{' '}
                        {new Date(event.deletedAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                  <div className={styles.eventContent}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    {event.description && (
                      <p className={styles.eventDescription}>
                        {event.description}
                      </p>
                    )}
                    <div className={styles.eventFooter}>
                      <span className={styles.eventCreator}>
                        <span>👤</span> {event.creator?.name || 'Неизвестен'}
                      </span>

                      {currentUser?.id === event.createdBy && (
                        <div className={styles.eventActions}>
                          {event.deletedAt ? (
                            <Button
                              onClick={() => handleRestore(event.id)}
                              variant="success"
                            >
                              Восстановить
                            </Button>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
