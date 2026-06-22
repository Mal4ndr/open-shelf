"use client";

import { useAuth } from "@/features/auth/model/auth-context";

export default function TestAuthStatePage() {
   const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();

   if (isLoading) {
      return <div>Loading auth state...</div>;
   }

   return (
      <div>
         <h1>Auth state test</h1>

         <p>Authenticated: {isAuthenticated ? "yes" : "no"}</p>

         <pre>{JSON.stringify(user, null, 2)}</pre>

         <button onClick={refreshUser}>Refresh user</button>
         <button onClick={logout}>Logout</button>
      </div>
   );
}
