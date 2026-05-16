/**
 * Даний файл є яскравим представником призначення папки api, суть якої у наданні єдиного,
 * централізованого моста між клієнтом та бекендом.
 */

import axios from "axios";
import { env } from "../config/env";

export const apiClient = axios.create({
   baseURL: env.API_URL,
   withCredentials: true,
   headers: {
      "Content-Type": "application/json",
   },
});
