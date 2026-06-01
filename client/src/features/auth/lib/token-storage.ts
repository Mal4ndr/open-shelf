/**
 * Даний код вирішує проблему централізації роботи з токеном, а також він дозволяє потенційну
 * міграцію на звичайні cookies (не httpOnly) у майбутньому.
 */

const TOKEN_KEY = "accessToken";

export const tokenStorage = {
   getToken(): string | null {
      return localStorage.getItem(TOKEN_KEY);
   },

   setToken(token: string): void {
      localStorage.setItem(TOKEN_KEY, token);
   },

   removeToken(): void {
      localStorage.removeItem(TOKEN_KEY);
   },
};
