/**
 * Даний файл є яскравим представником призначення папки api, суть якої у наданні єдиного,
 * централізованого моста між клієнтом та бекендом.
 */

import axios from "axios";
import { env } from "../config/env";

/**
 * axios.create() робить один центральний HTTP-клієнт для всього фронтенду
 */
export const apiClient = axios.create({
   /**
    * baseURL дозволяє не писати повні адреси в кожному запиті
    */
   baseURL: env.API_URL,
   withCredentials: true,
   headers: {
      /**
       * заголовок json підходить для типових REST-запитів
       */
      "Content-Type": "application/json",
   },
});

/**
 * Пізніше можна додати інтерсептори для обробки помилок, автоматичного
 * refresh токенів та логування запитів/відповідей.
 */
