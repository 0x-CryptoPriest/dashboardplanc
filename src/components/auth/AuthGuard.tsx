import { clearAccessToken, hasAccessToken } from "@/lib/auth-token";
import { fetchCurrentUser } from "@/lib/planc-api";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

type AuthState = "checking" | "authenticated" | "unauthenticated";

export function AuthGuard() {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>(() =>
    hasAccessToken() ? "checking" : "unauthenticated",
  );

  useEffect(() => {
    let mounted = true;
    if (!hasAccessToken()) {
      setAuthState("unauthenticated");
      return;
    }

    const verify = async () => {
      try {
        await fetchCurrentUser();
        if (mounted) {
          setAuthState("authenticated");
        }
      } catch {
        clearAccessToken();
        if (mounted) {
          setAuthState("unauthenticated");
        }
      }
    };

    void verify();
    return () => {
      mounted = false;
    };
  }, []);

  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Checking session...</div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
