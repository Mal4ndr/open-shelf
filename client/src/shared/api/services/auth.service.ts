/**
 * Цей файл є представником папки services, суть якої зберігати дрібні сервіси для роботи з API.
 */
import { apiClient } from "../api-client";

export const authService = {
   login: async (data: any) => {
      const response = await apiClient.post("/auth/login", data);

      return response.data;
   },

   me: async () => {
      const response = await apiClient.get("/auth/me");

      return response.data;
   },
};
