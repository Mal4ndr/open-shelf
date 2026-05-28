/**
 * Цей файл є представником папки services, суть якої зберігати дрібні сервіси для роботи з API.
 */
import {
   AuthResponse,
   LoginDto,
   RegisterDto,
   RegisterResponse,
   User,
} from "@/features/auth/model/types/auth.types";
import { apiClient } from "../../../shared/api/api-client";

export const authService = {
   login: async (data: LoginDto): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>("/auth/login", data);

      return response.data;
   },

   register: async (data: RegisterDto): Promise<RegisterResponse> => {
      const response = await apiClient.post<RegisterResponse>("/auth/register", data);

      return response.data;
   },

   getMe: async (): Promise<User> => {
      const response = await apiClient.get<User>("/auth/me");

      return response.data;
   },
};
