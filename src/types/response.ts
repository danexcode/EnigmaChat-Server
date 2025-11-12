import { UserResponseDto } from "./dtos";

export interface LoginResponse {
  token: string;
  message?: string;
  required2fa?: boolean;
  user?: UserResponseDto;
}
