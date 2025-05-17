import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { authService } from '../../api/auth';
import { ErrorDisplay } from '../../components/ErrorDisplay/ErrorDisplay';
import styles from './Register.module.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<{message: string, statusCode?: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError({ message: 'Пароли не совпадают', statusCode: 400 });
      return;
    }

    try {
      setIsLoading(true);
      await authService.register(
        formData.email,
        formData.name,
        formData.password,
      );

      navigate('/auth', {
        state: {
          registrationSuccess: true,
          message: 'Регистрация успешна! Теперь войдите в систему.',
        },
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка регистрации';
      const statusCode = err.response?.status || 500;
      setError({ message: errorMessage, statusCode });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.mainContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.title}>Регистрация</h2>

          {error && (
            <ErrorDisplay 
              error={error.message}
              statusCode={error.statusCode}
              onClose={() => setError(null)}
              autoCloseDelay={5000}
            />
          )}

          <div className={styles.formGroup}>
            <label>Имя</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
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
              minLength={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Подтвердите пароль</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          <div className={styles.loginLink}>
            Уже есть аккаунт?{' '}
            <Button to="/auth" variant="text">
              Войти
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};