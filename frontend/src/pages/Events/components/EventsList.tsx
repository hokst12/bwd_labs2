import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { ErrorDisplay } from '../../../components/ErrorDisplay/ErrorDisplay';
import styles from '../Events.module.css';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchEvents,
  deleteEvent,
  restoreEvent,
  toggleShowDeleted,
  clearError,
  subscribeToEvent,
  unsubscribeFromEvent,
  fetchEventParticipants,
  clearParticipants,
  type Event,
} from '../../../features/events/eventsSlice';
import { authService } from '../../../api/auth';
import { ParticipantsModal } from './ParticipantsModal';

export const EventsList = () => {
  const dispatch = useAppDispatch();
  const { events, loading, error, errorStatusCode, showDeleted, participants } =
    useAppSelector((state) => state.events);
  const currentUser = authService.getCurrentUser();
  const [showParticipantsModal, setShowParticipantsModal] = useState<
    number | null
  >(null);

  // Получаем актуальные данные о мероприятиях
  useEffect(() => {
    dispatch(fetchEvents(showDeleted));
  }, [dispatch, showDeleted]);

  const sortedEvents = [...events].sort((a: Event, b: Event) => {
    if (a.deletedAt && !b.deletedAt) return 1;
    if (!a.deletedAt && b.deletedAt) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const handleDelete = (id: number) => {
    dispatch(deleteEvent(id));
  };

  const handleRestore = (id: number) => {
    dispatch(restoreEvent(id));
  };

  const handleSubscribe = async (eventId: number) => {
    if (!currentUser) return;
    try {
      await dispatch(
        subscribeToEvent({
          eventId,
          userId: currentUser.id,
        }),
      ).unwrap();
      // Не нужно заново загружать все события - состояние обновится через extraReducers
    } catch (error) {
      console.error('Ошибка подписки:', error);
    }
  };
  
  const handleUnsubscribe = async (eventId: number) => {
    if (!currentUser) return;
    try {
      await dispatch(
        unsubscribeFromEvent({
          eventId,
          userId: currentUser.id,
        }),
      ).unwrap();
      // Не нужно заново загружать все события - состояние обновится через extraReducers
    } catch (error) {
      console.error('Ошибка отписки:', error);
    }
  };

  // Проверяем, подписан ли текущий пользователь на мероприятие
  const isUserSubscribed = (event: Event) => {
    if (!currentUser || !event.subscribers) return false;
    return event.subscribers.includes(currentUser.id);
  };

  if (loading) {
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
  }

  return (
    <div className={styles.mainContent}>
      {error && (
        <ErrorDisplay
          error={error}
          statusCode={errorStatusCode}
          onClose={() => dispatch(clearError())}
          autoCloseDelay={5000}
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
                onChange={() => dispatch(toggleShowDeleted())}
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

      {sortedEvents.length === 0 ? (
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
          {sortedEvents.map((event: Event, index) => {
            const showDivider =
              event.deletedAt &&
              (index === 0 || !sortedEvents[index - 1].deletedAt);

            return (
              <React.Fragment key={event.id}>
                {showDivider && (
                  <div className={styles.fullWidthDivider}>
                    <div className={styles.dividerContent}>
                      Удалённые мероприятия
                    </div>
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
                      <div className={styles.eventInfo}>
                        <span className={styles.eventCreator}>
                          <span>👤</span> {event.creator?.name || 'Неизвестен'}
                        </span>
                        <button
                          className={styles.participantsCount}
                          onClick={() => setShowParticipantsModal(event.id)}
                        >
                          <span>👥</span> {event.participantsCount} участники
                        </button>
                      </div>

                      {currentUser?.id === event.createdBy ? (
                        <div className={styles.eventActions}>
                          {event.deletedAt ? (
                            <></>
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
                      ) : (
                        !event.deletedAt &&
                        currentUser && (
                          <div className={styles.eventActions}>
                            {isUserSubscribed(event) ? (
                              <Button
                                onClick={() => handleUnsubscribe(event.id)}
                                variant="danger"
                              >
                                Отписаться
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleSubscribe(event.id)}
                                variant="primary"
                              >
                                Подписаться
                              </Button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {showParticipantsModal && (
        <ParticipantsModal
          eventId={showParticipantsModal}
          onClose={() => {
            setShowParticipantsModal(null);
            dispatch(clearParticipants());
          }}
        />
      )}
    </div>
  );
};
