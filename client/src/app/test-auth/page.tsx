"use client";

import { authService } from "@/features/auth/api/auth.service";
import { tokenStorage } from "@/features/auth/lib/token-storage";

export default function TestAuthPage() {
   const handleLogin = async () => {
      const response = await authService.login({
         email: "andrewcreator@testmail.com",
         password: "andrewpass",
      });

      tokenStorage.setToken(response.access_token);

      console.log("Login response:", response);
      console.log("Saved token:", tokenStorage.getToken());
   };

   return (
      <div>
         <h1>Auth test</h1>
         <button onClick={handleLogin}>Login test</button>
      </div>
   );
}
