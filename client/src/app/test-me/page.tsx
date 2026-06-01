"use client";

/**
 * Сам факт імпорту запускає код із файлу interceptors.ts, і він підключає interceptor до apiClient.
 */
import "@/shared/api/interceptors";
import { authService } from "@/features/auth/api/auth.service";

export default function GetMe() {
   const handleGetMe = async () => {
      try {
         const response = await authService.getMe();

         console.log("Me response:", response);
      } catch (error) {
         console.error("Get me error:", error);
      }
   };

   return (
      <div>
         <h1>Get me test</h1>
         <button onClick={handleGetMe}>getMe test</button>
      </div>
   );
}
