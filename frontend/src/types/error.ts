export interface AppError {
    code?: number;  // HTTP статус или код ошибки
    title: string;  // Краткое описание
    message: string; // Подробное описание
  }