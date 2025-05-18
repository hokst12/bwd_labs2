import { useState, useEffect } from 'react';
import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps {
  error: string;
  statusCode?: number;
  onClose?: () => void;
  autoCloseDelay?: number;
}

export const ErrorDisplay = ({
  error,
  statusCode,
  onClose,
  autoCloseDelay = 5000,
}: ErrorDisplayProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const getErrorType = () => {
    if (!statusCode) return 'error-type';
    if (statusCode >= 500) return 'server-error-type';
    if (statusCode >= 400) return 'client-error-type';
    return 'success-type';
  };

  useEffect(() => {
    if (autoCloseDelay && onClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onClose]);

  const handleClose = () => {
    if (!onClose) return;

    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={styles['error-notification']}>
      <div
        className={`${styles['error-content']} ${styles[getErrorType()]} ${
          isClosing ? styles['closing'] : ''
        }`}
        style={{
          top: '80px',
          right: '20px',
        }}
      >
        {statusCode && statusCode !== 200 && (
          <div className={styles['error-code']}>Ошибка {statusCode}</div>
        )}
        <div className={styles['error-message']}>{error}</div>
        {onClose && (
          <button
            className={styles['close-btn']}
            onClick={handleClose}
            aria-label="Закрыть уведомление"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};