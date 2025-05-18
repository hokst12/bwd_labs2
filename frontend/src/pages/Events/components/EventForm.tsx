import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { ErrorDisplay } from '../../../components/ErrorDisplay/ErrorDisplay';
import styles from '../Events.module.css';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  createEvent, 
  updateEvent, 
  clearError,
  fetchEventById} from '../../../features/events/eventsSlice';

export const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error, loading, currentEvent,errorStatusCode, } = useAppSelector((state) => state.events);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
  });
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchEventById(Number(id)));
    }
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (currentEvent && isEditMode) {
      setFormData({
        title: currentEvent.title,
        description: currentEvent.description || '',
        date: currentEvent.date.split('T')[0],
      });
    }
  }, [currentEvent, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    const resultAction = isEditMode && id
      ? await dispatch(updateEvent({
          id: Number(id),
          eventData: {
            title: formData.title,
            description: formData.description,
            date: formData.date,
          }
        }))
      : await dispatch(createEvent({
          title: formData.title,
          description: formData.description,
          date: formData.date,
        }));

    if (createEvent.fulfilled.match(resultAction) || 
        updateEvent.fulfilled.match(resultAction)) {
      navigate('/events');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
       {error && (
  <ErrorDisplay
    error={error}
    statusCode={errorStatusCode}
    onClose={() => dispatch(clearError())}
    autoCloseDelay={5000}
  />
)}

      <div className={styles.formContainer}>
        <h2>{isEditMode ? 'Редактирование' : 'Создание'} мероприятия</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Название</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Дата</label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formActions}>
            <Button type="button" onClick={() => navigate('/events')}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? 'Сохранение...'
                : isEditMode
                  ? 'Обновить'
                  : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};