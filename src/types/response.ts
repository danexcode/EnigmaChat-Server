import { UserResponseDto } from "./dtos";

export interface LoginResponse {
  token: string;
  required2fa?: boolean;
  message?: string;
  user?: UserResponseDto;
}
