import { AuthShell, Aurora, Btn, Card, Divider, Input, Spinner, Stars, Toast } from "@/components/auth";
import { MindMateColors as C } from "@/constants/theme";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";

/* ════════════════════════════════════════════════
   AUTH LANDING & LOGIN SCREEN
════════════════════════════════════════════════ */
export default function AuthLandingScreen() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  
  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err" | "warn" | "info";
  } | null>(null);

  // Check session on mount
  useEffect(() => {
    // For custom auth, we might check local storage for a token/user
    // For now, let's just stay on the login screen
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setErrors({});
    
    try {
      const data = await authService.login(email, password);
      setToast({ msg: "Success! Signing in...", type: "ok" });
      
      if (data.backendUser && data.backendUser.onboarding_complete === false) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setToast({ msg: error.message || "Login failed", type: "err" });
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setToast({ msg: "Google login is currently disabled", type: "info" });
  };

  return (
    <AuthShell>
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClear={() => setToast(null)}
        />
      )}

      {!showLogin ? (
        <div style={{ animation: "fadeUp .6s .2s both", display: "flex", flexDirection: "column", gap: 16 }}>
          <Btn full onClick={() => router.push('/(auth)/signup')}>
            Get Started
          </Btn>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.sub,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Nunito',sans-serif",
              transition: "all .2s",
            }}
          >
            I already have an account
          </button>
        </div>
      ) : (
        <div style={{ animation: "fadeUp .5s both" }}>
          <Card>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 24,
                margin: "0 0 6px",
                color: C.text,
              }}
            >
              Welcome back 👋
            </h2>
            <p
              style={{
                fontSize: 13,
                color: C.sub,
                margin: "0 0 24px",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Sign in to continue your journey
            </p>


            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 18,
              }}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="you@example.com"
                error={errors.email}
                icon="📧"
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.password}
                icon="🔒"
                autoComplete="current-password"
                required
              />
            </div>

            <div style={{ textAlign: "right", marginTop: 8, marginBottom: 20 }}>
              <button
                onClick={() => router.push('/(auth)/forgot-password' as any)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.neon,
                  fontSize: 12,
                  fontFamily: "'Nunito',sans-serif",
                  fontWeight: 600,
                }}
              >
                Forgot password?
              </button>
            </div>

            <Btn full onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Spinner size={16} color="#fff" /> Signing in...
                </span>
              ) : (
                "Sign In →"
              )}
            </Btn>

            <p
              style={{
                textAlign: "center",
                marginTop: 18,
                fontSize: 13,
                color: C.sub,
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Don't have an account?{" "}
              <button
                onClick={() => router.push('/(auth)/signup')}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.neon,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                Sign up free
              </button>
            </p>
          </Card>
        </div>
      )}

      {/* Requirements note */}
      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 14,
          background: "rgba(255,255,255,.02)",
          border: "1px solid rgba(255,255,255,.05)",
          animation: "fadeUp .5s .2s both",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: C.muted,
            textAlign: "center",
            fontFamily: "'Nunito',sans-serif",
            lineHeight: 1.6,
          }}
        >
          🔒 End-to-end encrypted · 🤖 AI-powered insights · 📓 Private
          journaling
        </p>
      </div>
    </AuthShell>
  );
}

// Keep the sub-screens for forgot password etc. since they were in login.tsx

export function ForgotPasswordScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    
    // UI Mock
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <AuthShell>
      <Card style={{ animation: "fadeUp .5s .1s both" }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 24,
                margin: "0 auto 18px",
                background: `${C.cyan}22`,
                border: `1px solid ${C.cyan}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                animation: "floatB 4s ease-in-out infinite",
              }}
            >
              📬
            </div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 23,
                margin: "0 0 10px",
                color: C.text,
              }}
            >
              Reset email sent!
            </h2>
            <p
              style={{
                fontSize: 13,
                color: C.sub,
                lineHeight: 1.7,
                margin: "0 0 24px",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Check <strong style={{ color: C.cyan }}>{email}</strong> for a
              password reset link. It expires in 1 hour.
            </p>
            <Btn full onClick={onGoLogin} variant="outline" color={C.cyan}>
              Back to Sign In
            </Btn>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 22 }}>
              <button
                onClick={onGoLogin}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.sub,
                  fontSize: 13,
                  fontFamily: "'Nunito',sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: 0,
                  marginBottom: 18,
                }}
              >
                ← Back
              </button>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 20,
                  background: `${C.rose}22`,
                  border: `1px solid ${C.rose}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  animation: "floatB 4s ease-in-out infinite",
                  marginBottom: 14,
                }}
              >
                🔑
              </div>
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: 24,
                  margin: "0 0 6px",
                  color: C.text,
                }}
              >
                Forgot your password?
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: C.sub,
                  fontFamily: "'Nunito',sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Enter your email and we'll send you a reset link
              </p>
            </div>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={error}
              icon="📧"
              autoComplete="email"
            />
            <div style={{ marginTop: 18 }}>
              <Btn
                full
                onClick={handleSubmit}
                disabled={loading}
                color={C.rose}
              >
                {loading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Spinner size={16} color="#fff" /> Sending...
                  </span>
                ) : (
                  "Send Reset Link →"
                )}
              </Btn>
            </div>
            <p
              style={{
                textAlign: "center",
                marginTop: 16,
                fontSize: 12,
                color: C.muted,
                fontFamily: "'Nunito',sans-serif",
                lineHeight: 1.6,
              }}
            >
              Remembered it?{" "}
              <button
                onClick={onGoLogin}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.neon,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </Card>
    </AuthShell>
  );
}

export function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = "At least 8 characters required";
    if (password !== confirm) e.confirm = "Passwords do not match";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setErrors({});
    
    // UI Mock
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1000);
  };

  return (
    <AuthShell>
      <Card style={{ animation: "fadeUp .5s .1s both" }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 48,
                margin: "0 0 16px",
                animation: "floatB 4s ease-in-out infinite",
              }}
            >
              🎉
            </div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 24,
                margin: "0 0 10px",
                color: C.text,
              }}
            >
              Password updated!
            </h2>
            <p
              style={{
                fontSize: 14,
                color: C.sub,
                margin: "0 0 24px",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              You can now sign in with your new password.
            </p>
            <Btn full onClick={onDone}>
              Continue to App →
            </Btn>
          </div>
        ) : (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 20,
                background: `${C.lime}22`,
                border: `1px solid ${C.lime}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                marginBottom: 16,
                animation: "floatB 4s ease-in-out infinite",
              }}
            >
              🔒
            </div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 24,
                margin: "0 0 6px",
                color: C.text,
              }}
            >
              Set new password
            </h2>
            <p
              style={{
                fontSize: 13,
                color: C.sub,
                margin: "0 0 22px",
                fontFamily: "'Nunito',sans-serif",
              }}
            >
              Choose a strong password for your account
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                error={errors.password}
                icon="🔒"
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e: any) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                error={errors.confirm}
                icon="🔐"
                autoComplete="new-password"
              />
            </div>
            <div style={{ marginTop: 20 }}>
              <Btn
                full
                onClick={handleSubmit}
                disabled={loading}
                color={C.lime}
              >
                {loading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Spinner size={16} color="#fff" /> Updating...
                  </span>
                ) : (
                  "Update Password →"
                )}
              </Btn>
            </div>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
