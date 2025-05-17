import { Link } from 'react-router-dom';
import cn from 'classnames';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  to?: string;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean; // Добавляем пропс disabled
}

export const Button = ({
  children,
  to,
  variant = 'primary',
  onClick,
  className,
  type = 'button',
  disabled = false, // Значение по умолчанию
}: ButtonProps) => {
  const buttonClass = cn(styles.button, styles[variant], className, {
    [styles.disabled]: disabled,
  });

  if (to) {
    return (
      <Link to={to} className={buttonClass}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      type={type} // Пробрасываем type в button
      disabled={disabled}
    >
      {children}
    </button>
  );
};
