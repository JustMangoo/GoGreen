import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect } from "react";

type AuthMode = "login" | "register";

export default function Authentication() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/");
      setSuccess("Logged in successfully!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("Failed to create user");

      // Create profile in profiles table
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
        },
      ]);

      if (profileError) throw profileError;

      setSuccess(
        "Account created! Please check your email to verify your account."
      );
      setEmail("");
      setPassword("");
      setTimeout(() => setMode("login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center text-2xl mb-6">
              {mode === "login" ? "Welcome Back" : "Join Us"}
            </h2>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                <span>{success}</span>
              </div>
            )}

            <form
              onSubmit={mode === "login" ? handleLogin : handleRegister}
              className="flex flex-col gap-4"
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <label className="input input-bordered w-full flex items-center gap-2">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <label className="input input-bordered w-full flex items-center gap-2">
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {mode === "login" ? "Logging in..." : "Creating account..."}
                  </>
                ) : mode === "login" ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <div className="divider">OR</div>

            <button
              type="button"
              className="btn btn-ghost w-full"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
                setSuccess(null);
              }}
            >
              {mode === "login"
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-sm opacity-60">
          <p>PickleIt - Learn Food Preservation Methods</p>
        </div>
      </div>
    </div>
  );
}
