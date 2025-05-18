export interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  createdBy: number;
  deletedAt: string | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}