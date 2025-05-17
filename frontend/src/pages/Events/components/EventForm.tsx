import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsService } from '../../../api/events';
import { Button } from '../../../components/Button';
import { ErrorDisplay } from '../../../components/ErrorDisplay/ErrorDisplay';
import styles from '../Events.module.css';
import { authService } from '../../../api/auth';

export const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [error, setError] = useState<{message: string, statusCode?: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      const loadEvent = async () => {
        try {
          const event = await eventsService.getEvent(Number(id));
          setFormData({
            title: event.title,
            description: event.description || '',
            date: event.date.split('T')[0]
          });
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Не удалось загрузить мероприятие';
          const statusCode = err.response?.status || 500;
          setError({ message: errorMessage, statusCode });
        }
      };
      loadEvent();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Пользователь не авторизован');

      if (isEditMode && id) {
        await eventsService.updateEvent(Number(id), {
          title: formData.title,
          description: formData.description,
          date: formData.date
        });
      } else {
        await eventsService.createEvent({
          title: formData.title,
          description: formData.description,
          date: formData.date
        });
      }
      
      navigate('/events');
    } catch (err: any) {
      let errorMessage = err instanceof Error ? err.message : 
        isEditMode ? 'Не удалось обновить мероприятие' : 'Не удалось создать мероприятие';
      const statusCode = err.response?.status || 500;
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError({ message: errorMessage, statusCode });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* ErrorDisplay теперь рендерится отдельно от формы */}
      {error && (
        <ErrorDisplay 
          error={error.message}
          statusCode={error.statusCode}
          onClose={() => setError(null)}
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
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : isEditMode ? 'Обновить' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};