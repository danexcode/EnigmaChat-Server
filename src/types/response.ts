import { UserResponseDto } from "./dtos";

export interface LoginResponse {
  token: string;
  message?: string;
  user?: UserResponseDto;
}
