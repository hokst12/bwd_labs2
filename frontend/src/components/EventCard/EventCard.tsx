import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  deleteEvent,
  restoreEvent,
  subscribeToEvent,
  unsubscribeFromEvent,
  fetchEventParticipants,
  clearParticipants,
  type Event,
} from '../../features/events/eventsSlice';
import { Button } from '../Button';
import styles from './EventCard.module.css';
import { useState } from 'react';
import { ParticipantsModal } from '../../pages/Events/components/ParticipantsModal';
import { authService } from '../../api/auth';

interface EventCardProps {
  event: Event;
  showCreator?: boolean;
  showActions?: boolean;
}

export const EventCard = ({
  event,
  showCreator = true,
  showActions = false,
}: EventCardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [showParticipantsModal, setShowParticipantsModal] = useState<number | null>(null);
  const { participantsLoading } = useAppSelector((state) => state.events);

  const handleEdit = () => {
    navigate(`/events/edit/${event.id}`);
  };

  const handleDelete = (id: number) => {
      dispatch(deleteEvent(id));
      window.location.reload();
  };

  const handleRestore = () => {
    dispatch(restoreEvent(event.id));
  };

  const handleSubscribe = async () => {
    if (!currentUser) return;
    try {
      await dispatch(
        subscribeToEvent({
          eventId: event.id,
          userId: currentUser.id,
        }),
      ).unwrap();
    } catch (error) {
      console.error('Ошибка подписки:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!currentUser) return;
    try {
      await dispatch(
        unsubscribeFromEvent({
          eventId: event.id,
          userId: currentUser.id,
        }),
      ).unwrap();
    } catch (error) {
      console.error('Ошибка отписки:', error);
    }
  };

  const handleShowParticipants = () => {
    setShowParticipantsModal(event.id);
    dispatch(fetchEventParticipants(event.id));
  };

  const isOwner = currentUser?.id === event.createdBy;
  const isSubscribed = currentUser && event.subscribers?.includes(currentUser.id);

  return (
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
            Удалено: {new Date(event.deletedAt).toLocaleDateString('ru-RU')}
          </span>
        )}
      </div>
      <div className={styles.eventContent}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        {event.description && (
          <p className={styles.eventDescription}>{event.description}</p>
        )}

        <div className={styles.eventFooter}>
          <div className={styles.eventInfo}>
            {showCreator && (
              <span className={styles.eventCreator}>
                <span>👤</span> {event.creator?.name || 'Неизвестен'}
              </span>
            )}
          </div>

          {showActions && (
            <div className={styles.eventActions}>
              {isOwner ? (
                event.deletedAt ? (
                  <Button
                    onClick={handleRestore}
                    variant="success"
                    className={styles.actionButton}
                  >
                    Восстановить
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleEdit}
                      variant="secondary"
                      className={styles.actionButton}
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(event.id)}
                      variant="danger"
                      className={styles.actionButton}
                    >
                      Удалить
                    </Button>
                  </>
                )
              ) : !event.deletedAt && currentUser && (
                isSubscribed ? (
                  <Button
                    onClick={handleUnsubscribe}
                    variant="danger"
                    className={styles.actionButton}
                  >
                    Отписаться
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubscribe}
                    variant="primary"
                    className={styles.actionButton}
                  >
                    Подписаться
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {showParticipantsModal === event.id && (
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