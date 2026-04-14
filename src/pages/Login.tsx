import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAccessToken, hasAccessToken, setAccessToken } from "@/lib/auth-token";
import { fetchCurrentUser, loginWithPassword } from "@/lib/planc-api";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type LoginLocationState = {
  from?: string;
};

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as LoginLocationState;
  const search = new URLSearchParams(location.search);
  const queryFrom = search.get("from");
  const redirectTarget =
    queryFrom && queryFrom.startsWith("/")
      ? queryFrom
      : state.from && state.from.startsWith("/")
        ? state.from
        : "/";

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      if (!hasAccessToken()) {
        return;
      }
      try {
        await fetchCurrentUser();
        if (mounted) {
          navigate("/", { replace: true });
        }
      } catch {
        clearAccessToken();
      }
    };
    void verify();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = await loginWithPassword(username.trim(), password);
      setAccessToken(payload.access_token);
      await fetchCurrentUser();
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      clearAccessToken();
      setError(err instanceof Error ? err.message : "login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/70">
        <CardHeader>
          <CardTitle className="text-xl">PlanC Login</CardTitle>
          <CardDescription>Sign in to access trading dashboard and system controls.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="text-xs text-loss">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
