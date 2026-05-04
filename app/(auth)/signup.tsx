import {
  AuthShell,
  Btn,
  Card,
  Input,
  Spinner,
  Toast,
  GoogleBtn,
} from "@/components/auth";
import { MindMateColors as C } from "@/constants/theme";
import { authService } from "@/services/auth.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err" | "warn" | "info";
  } | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailChecking(true);
      const { available } = await authService.checkEmailAvailability(email);
      setEmailAvailable(available);
      setEmailChecking(false);

      if (!available) {
        setErrors(prev => ({ ...prev, email: "This email is already registered" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    if (confirm && password !== confirm) {
      setErrors(prev => ({ ...prev, confirm: "Passwords do not match" }));
    } else if (confirm && password === confirm) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirm;
        return newErrors;
      });
    }
  }, [password, confirm]);

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

    if (emailAvailable === false) {
      setErrors({ email: "This email is already registered. Please use another one." });
      setLoading(false);
      return;
    }

    try {
      await authService.signUp(email, password, fullName);
      setLoading(false);
      setSuccess(true);
    } catch (error: any) {
      setToast({ msg: error.message, type: "err" });
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setErrors({ otp: "Enter the 6-digit code" });
      return;
    }
    setVerifying(true);
    setErrors({});
    try {
      await authService.verifyOtp(email, otp);
      setToast({ msg: "Email verified successfully!", type: "ok" });
      // Redirect to onboarding directly
      setTimeout(() => {
        router.replace("/onboarding");
      }, 1000);
    } catch (error: any) {
      setToast({ msg: error.message || "Invalid code", type: "err" });
    } finally {
      setVerifying(false);
    }
  };

  if (success)
    return (
      <AuthShell>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClear={() => setToast(null)}
          />
        )}
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
            🔐
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
            Verify it's you
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
            We've sent a 6-digit code to{" "}
            <strong style={{ color: C.neon }}>{email}</strong>. Enter it below to
            verify your account.
          </p>

          <Input
            label="Verification Code"
            type="text"
            value={otp}
            onChange={(e: any) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="000000"
            error={errors.otp}
            icon="🔢"
            style={{ textAlign: "center", fontSize: 24, letterSpacing: 8 }}
            required
          />

          <div style={{ marginTop: 20 }}>
            <Btn full onClick={handleVerifyOtp} disabled={verifying}>
              {verifying ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Spinner size={16} color="#fff" /> Verifying...
                </span>
              ) : (
                "Verify & Continue →"
              )}
            </Btn>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: C.sub }}>
            Didn't receive the code?{" "}
            <button
              onClick={() => authService.sendOtp(email)}
              style={{
                background: "none",
                border: "none",
                color: C.neon,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Resend
            </button>
          </p>
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

         <GoogleBtn onClick={() => {}} disabled={true} />

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
            icon={emailChecking ? "⏳" : emailAvailable === true ? "✅" : emailAvailable === false ? "❌" : "📧"}
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
              show={showPassword}
              onToggleShow={() => setShowPassword(p => !p)}
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
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(p => !p)}
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
            onClick={() => router.push("/(auth)")}
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
