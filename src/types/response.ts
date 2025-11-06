export interface LoginResponse {
  token: string;
  required2fa: boolean;
  message?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    is2faEnabled: boolean;
  };
}
