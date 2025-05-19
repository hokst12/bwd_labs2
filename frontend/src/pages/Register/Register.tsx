import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ErrorDisplay } from '../../components/ErrorDisplay/ErrorDisplay';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  register,
  clearError,
  SetError as setAuthError,
} from '../../features/auth/authSlice';
import styles from './Register.module.css';



export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      dispatch(setAuthError({
        message: 'Пароли не совпадают',
        statusCode: 400,
      }));
      return;
    }

    const resultAction = await dispatch(
      register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      }),
    );

    if (register.fulfilled.match(resultAction)) {
      navigate('/auth', {
        state: {
          message: 'Регистрация успешна! Теперь войдите в систему.',
        },
      });
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
              onClose={() => dispatch(clearError())}
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
              placeholder="Введите ваше имя"
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
              minLength={6}
              placeholder="Введите пароль (мин. 6 символов)"
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
              placeholder="Подтвердите пароль"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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