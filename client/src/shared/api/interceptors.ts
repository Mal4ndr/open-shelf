/**
 * Суть файлу полягає у налаштуванні перехоплювачів (interceptors) для запитів/відповідей
 * (наприклад, додавання токенів, обробка помилок).
 */

import { apiClient } from "./api-client";

apiClient.interceptors.request.use((config) => {
   return config;
});

apiClient.interceptors.response.use(
   (response) => response,
   async (error) => {
      return Promise.reject(error);
   },
);
