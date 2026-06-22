"use client";

/**
 * Рядок що активує інтерсептори для всього client додатку.
 */
import "@/shared/api/interceptors";

/**
 * AuthProvider використовує React-хуки, а їх можна запускати тільки в клієнтському
 * компоненті. Тому на початку файлу є "use client"
 */
import { AuthProvider } from "@/features/auth/model/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
   return <AuthProvider>{children}</AuthProvider>;
}
