import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ErrorDisplay } from '../../components/ErrorDisplay/ErrorDisplay';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login, clearError, clearMessage, setMessage } from '../../features/auth/authSlice';
import styles from './Auth.module.css';

export const Auth = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const dispatch = useAppDispatch();
  const { user, loading, error, message } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/events');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      dispatch(setMessage(location.state.message));
    }
    return () => {
      dispatch(clearMessage());
    };
  }, [location, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email: formData.email, password: formData.password }));
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
              onClose={() => dispatch(clearMessage())}
            />
          )}

          {error && (
            <ErrorDisplay
              error={error.message}
              statusCode={error.statusCode}
              onClose={() => dispatch(clearError())}
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
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>

          <div className={styles.registerLink}>
            Нет аккаунта? <a href="/register">Зарегистрироваться</a>
          </div>
        </form>
      </main>
    </div>
  );
};