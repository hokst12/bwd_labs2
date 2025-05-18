import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { deleteEvent, restoreEvent } from '../../features/events/eventsSlice';
import { Button } from '../Button';
import type { Event } from '../../api/types';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
  showCreator?: boolean;
  showActions?: boolean;
  currentUserId?: number;
}

export const EventCard = ({
  event,
  showCreator = true,
  showActions = false,
  currentUserId,
}: EventCardProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/events/edit/${event.id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить мероприятие?')) {
      dispatch(deleteEvent(event.id));
    }
  };

  const handleRestore = () => {
    dispatch(restoreEvent(event.id));
  };

  const isOwner = currentUserId === event.createdBy;

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
          {showCreator && (
            <span className={styles.eventCreator}>
              <span>👤</span> {event.creator?.name || 'Вы'}
            </span>
          )}

          {showActions && isOwner && (
            <div className={styles.eventActions}>
              {event.deletedAt ? (
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
                    onClick={handleDelete}
                    variant="danger"
                    className={styles.actionButton}
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
  );
};
