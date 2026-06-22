"use client";

import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";

import { authService } from "@/features/auth/api/auth.service";
import { tokenStorage } from "@/features/auth/lib/token-storage";
import { LoginDto, User } from "@/features/auth/model/types/auth.types";

interface AuthContextValue {
   user: User | null;
   isAuthenticated: boolean;
   isLoading: boolean;
   login: (data: LoginDto) => Promise<void>;
   logout: () => void;
   refreshUser: () => Promise<void>;
}

/**
 * Це контейнер для зберігання стану авторизації.
 * Початкове значення null, поза провайдером контексту використовувати не можна.
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Це компонент, який оточує інші компоненти.
 * Він дає їм доступ до стану і методів авторизації через AuthContext.Provider.
 *
 * КОЛИ І ЯК ЦЕ ПРАЦЮЄ:
 * Коли програма стартує, AuthProvider запускає refreshUser.
 * Якщо є збережений токен, відбувається перевірка й отримання user.
 * Компоненти, які викликають useAuth(), отримують: user, isAuthenticated, isLoading,
 * login, logout, refreshUser.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
   /**
    * user — дані про поточного користувача або null, якщо ніхто не залогінений.
    * isLoading — індикатор, чи зараз відбувається перевірка/завантаження користувача.
    */
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   /**
    * Це функція, яка перевіряє токен і запитує інформацію про користувача з сервера.
    * Якщо токена немає, просто встановлює user в null. Якщо є токен, викликає
    * authService.getMe() і зберігає отримані дані в user. Якщо запит не вдався,
    * видаляє токен і очищує user.
    *
    * Це важлива логіка для того, щоб при перезавантаженні сторінки додаток міг
    * "відновити" сесію користувача.
    */
   const refreshUser = useCallback(async () => {
      const token = tokenStorage.getToken();

      if (!token) {
         setUser(null);
         return;
      }

      try {
         const currentUser = await authService.getMe();
         setUser(currentUser);
      } catch (error) {
         tokenStorage.removeToken();
         setUser(null);
         console.error("Failed to refresh user:", error);
      }
   }, []);

   /**
    * useEffect для ініціалізації
    * Коли AuthProvider змонтується, виконується ця логіка. Вона запускає refreshUser,
    * щоб одразу дізнатися, чи є авторизований користувач. Поки триває перевірка,
    * isLoading = true.
    */
   useEffect(() => {
      const initAuth = async () => {
         setIsLoading(true);
         await refreshUser();
         setIsLoading(false);
      };

      initAuth();
   }, [refreshUser]);

   /**
    * Виконує вхід: надсилає логін/пароль на сервер.
    * Зберігає отриманий токен у сховище (tokenStorage).
    * Потім запитує дані про поточного користувача і зберігає їх.
    */
   const login = async (data: LoginDto) => {
      const response = await authService.login(data);

      tokenStorage.setToken(response.access_token);

      const currentUser = await authService.getMe();
      setUser(currentUser);
   };

   /**
    * Приклад простого виходу: видаляє токен і очищає стан користувача.
    */
   const logout = () => {
      tokenStorage.removeToken();
      setUser(null);
   };

   /**
    * Створює обʼєкт значень для контексту.
    * useMemo тут потрібен, щоб не створювати новий обʼєкт на кожному рендері без потреби.
    * isAuthenticated визначається як Boolean(user) — якщо є користувач, то true.
    */
   const value = useMemo(
      () => ({
         user,
         isAuthenticated: Boolean(user),
         isLoading,
         login,
         logout,
         refreshUser,
      }),
      [user, isLoading, refreshUser],
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Це хук для зручного доступу до контексту. Він гарантує, що його використовують
 * тільки в середині AuthProvider.
 */
export function useAuth() {
   const context = useContext(AuthContext);

   if (!context) {
      throw new Error("useAuth must be used inside AuthProvider");
   }

   return context;
}
