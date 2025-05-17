import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { authService } from '../../api/auth';
import { ErrorDisplay } from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Auth.module.css';

export const Auth = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<{message: string, statusCode?: number} | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/events');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await authService.login(formData.email, formData.password);
      navigate('/events');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка авторизации';
      const statusCode = error.response?.status || 500;
      setError({ message: errorMessage, statusCode });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.mainContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.title}>Вход в систему</h2>

          {message && (
            <ErrorDisplay 
              error={message}
              statusCode={200}
              onClose={() => setMessage('')}
            />
          )}

          {error && (
            <ErrorDisplay 
              error={error.message}
              statusCode={error.statusCode}
              onClose={() => setError(null)}
              autoCloseDelay={5000}
            />
          )}

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Введите ваш email"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Введите ваш пароль"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>

          <div className={styles.registerLink}>
            Нет аккаунта? <a href="/register">Зарегистрироваться</a>
          </div>
        </form>
      </main>
    </div>
  );
};