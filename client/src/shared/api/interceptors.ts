/**
 * Суть файлу полягає у налаштуванні перехоплювачів (interceptors) для запитів/відповідей
 * (наприклад, додавання токенів, обробка помилок). Інтерсептори мають side-effect, беруть
 * apiClient і навішують на нього правида перед запитом/після відповіді.
 */

import { tokenStorage } from "@/features/auth/lib/token-storage";
import { apiClient } from "./api-client";

apiClient.interceptors.request.use((config) => {
   const token = tokenStorage.getToken();

   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
   }

   return config;
});

apiClient.interceptors.response.use(
   (response) => response,
   async (error) => {
      return Promise.reject(error);
   },
);
