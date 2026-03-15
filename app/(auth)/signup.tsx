import {
  Aurora,
  Btn,
  Card,
  Divider,
  Input,
  Spinner,
  Stars,
  Toast,
} from "@/components/MindMateUI";
import { MindMateColors as C } from "@/constants/MindMateTheme";
import { useState } from "react";
import { useRouter } from "expo-router";

/* ════════════════════════════════════════════════
   SHARED AUTH SHELL
   (Duplicated for now, or could be moved to components)
════════════════════════════════════════════════ */
const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      minHeight: "100vh",
      background: C.void,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Aurora colors={[C.a1, C.a4, C.a2]} />
    <Stars n={24} />
    {/* Rings */}
    {[500, 380, 260].map((s, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: s,
          height: s,
          borderRadius: "50%",
          border: `1px solid rgba(192,132,252,${0.04 + i * 0.03})`,
          animation: `floatB ${7 + i}s ${i}s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />
    ))}
    <div
      style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}
    >
      {/* Logo */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
          animation: "fadeUp .6s both",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 26,
            margin: "0 auto 16px",
            background: `linear-gradient(135deg,${C.a1},${C.neon},${C.cyan})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            boxShadow: `0 0 40px ${C.neon}55`,
            animation: "floatB 5s ease-in-out infinite",
          }}
        >
          🧠
        </div>
        <h1
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 36,
            margin: "0 0 6px",
            background: `linear-gradient(135deg,#fff,${C.neon},${C.cyan})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
            animation: "shimmer 4s linear infinite",
          }}
        >
          MindMate
        </h1>
        <p
          style={{
            fontSize: 13,
            color: C.sub,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            fontFamily: "'Nunito',sans-serif",
            fontWeight: 300,
          }}
        >
          Elevate your mind
        </p>
      </div>
      {children}
    </div>
  </div>
);

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err" | "warn" | "info";
  } | null>(null);
  const [success, setSuccess] = useState(false);

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
  };

  const strengthColor = [C.rose, C.rose, C.amber, C.lime, C.cyan];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const pwStrength = getStrength(password);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters required";
    if (password !== confirm) e.confirm = "Passwords do not match";
    if (!agreed) e.agreed = "You must accept the terms";
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
    
    // UI Mock
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  if (success)
    return (
      <AuthShell>
        <Card style={{ textAlign: "center", animation: "fadeUp .5s both" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 26,
              margin: "0 auto 20px",
              background: `${C.lime}22`,
              border: `1px solid ${C.lime}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              animation: "floatB 4s ease-in-out infinite",
            }}
          >
            ✉️
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
            Check your email!
          </h2>
          <p
            style={{
              fontSize: 14,
              color: C.sub,
              lineHeight: 1.7,
              margin: "0 0 24px",
              fontFamily: "'Nunito',sans-serif",
            }}
          >
            We sent a confirmation link to{" "}
            <strong style={{ color: C.neon }}>{email}</strong>. Click it to
            activate your account.
          </p>
          <Btn full onClick={() => router.push('/(auth)/login')} variant="outline" color={C.neon}>
            Back to Sign In
          </Btn>
        </Card>
      </AuthShell>
    );

  return (
    <AuthShell>
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClear={() => setToast(null)}
        />
      )}
      <Card style={{ animation: "fadeUp .5s .1s both" }}>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 24,
            margin: "0 0 6px",
            color: C.text,
          }}
        >
          Create your account ✦
        </h2>
        <p
          style={{
            fontSize: 13,
            color: C.sub,
            margin: "0 0 22px",
            fontFamily: "'Nunito',sans-serif",
          }}
        >
          Start your mental wellness journey today
        </p>

        {/* Google */}
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              router.replace('/(tabs)');
            }, 1200);
          }}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            background: `${C.lift}CC`,
            border: `1px solid rgba(255,255,255,.1)`,
            color: C.text,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: "'Nunito',sans-serif",
            transition: "all .2s",
            marginBottom: 18,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <Divider />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 18,
          }}
        >
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e: any) => setFullName(e.target.value)}
            placeholder="Your full name"
            error={errors.fullName}
            icon="👤"
            autoComplete="name"
            required
          />
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
          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              error={errors.password}
              icon="🔒"
              autoComplete="new-password"
              required
            />
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          i <= pwStrength
                            ? strengthColor[pwStrength]
                            : "rgba(255,255,255,.08)",
                        transition: "background .3s",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: strengthColor[pwStrength],
                    fontFamily: "'Nunito',sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {strengthLabel[pwStrength]}
                </span>
              </div>
            )}
          </div>
          <Input
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e: any) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            error={errors.confirm}
            icon="🔐"
            autoComplete="new-password"
            required
          />
        </div>

        {/* Terms */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            margin: "18px 0",
          }}
        >
          <button
            onClick={() => setAgreed((a) => !a)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: `2px solid ${agreed ? C.neon : C.border}`,
              background: agreed ? C.neon : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
              transition: "all .2s",
            }}
          >
            {agreed && (
              <span style={{ fontSize: 11, color: "#000", fontWeight: 700 }}>
                ✓
              </span>
            )}
          </button>
          <div>
            <span
              style={{
                fontSize: 12,
                color: C.sub,
                fontFamily: "'Nunito',sans-serif",
                lineHeight: 1.6,
              }}
            >
              I agree to the{" "}
              <a href="#" style={{ color: C.neon, textDecoration: "none" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" style={{ color: C.neon, textDecoration: "none" }}>
                Privacy Policy
              </a>
              . Your data is encrypted and never sold.
            </span>
            {errors.agreed && (
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 11,
                  color: C.rose,
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                {errors.agreed}
              </p>
            )}
          </div>
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
              <Spinner size={16} color="#fff" /> Creating account...
            </span>
          ) : (
            "Create Account →"
          )}
        </Btn>

        {/* Password requirements */}
        <div
          style={{
            marginTop: 14,
            padding: "11px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.05)",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              fontFamily: "'Syne',sans-serif",
              letterSpacing: ".08em",
            }}
          >
            PASSWORD REQUIREMENTS
          </p>
          {[
            { rule: "At least 8 characters", met: password.length >= 8 },
            { rule: "One uppercase letter", met: /[A-Z]/.test(password) },
            { rule: "One number", met: /[0-9]/.test(password) },
            {
              rule: "One special character",
              met: /[^A-Za-z0-9]/.test(password),
            },
          ].map(({ rule, met }) => (
            <div
              key={rule}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 3,
              }}
            >
              <span style={{ fontSize: 11, color: met ? C.lime : C.muted }}>
                {met ? "✓" : "○"}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: met ? C.lime : C.muted,
                  fontFamily: "'Nunito',sans-serif",
                }}
              >
                {rule}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 13,
            color: C.sub,
            fontFamily: "'Nunito',sans-serif",
          }}
        >
          Already have an account?{" "}
          <button
            onClick={() => router.push('/(auth)/login')}
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
            Sign in
          </button>
        </p>
      </Card>
    </AuthShell>
  );
}
