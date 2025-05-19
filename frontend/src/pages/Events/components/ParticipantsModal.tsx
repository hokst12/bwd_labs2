import React from 'react';
import styles from '../Events.module.css';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  clearParticipants,
  fetchEventParticipants,
} from '../../../features/events/eventsSlice';

interface ParticipantsModalProps {
  eventId: number;
  onClose: () => void;
}

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  eventId,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { participants, participantsLoading } = useAppSelector(
    (state) => state.events,
  );

  React.useEffect(() => {
    dispatch(fetchEventParticipants(eventId));
    return () => {
      dispatch(clearParticipants());
    };
  }, [dispatch, eventId]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>Участники мероприятия</h3>
        {participantsLoading ? (
          <div>Загрузка...</div>
        ) : participants.length === 0 ? (
          <div>Нет участников</div>
        ) : (
          <ul className={styles.participantsList}>
            {participants.map((participant) => (
              <li key={participant.id} className={styles.participantItem}>
                <span>{participant.name}</span>
                <span className={styles.participantEmail}>
                  {participant.email}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button className={styles.modalCloseButton} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};
