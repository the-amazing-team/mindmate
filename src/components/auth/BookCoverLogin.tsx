import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isDemoMode } from "@/lib/supabase";

type AuthMode = "signin" | "signup" | "magic" | "reset";

interface BookCoverLoginProps {
  onSuccess?: () => void;
  onGuestMode?: () => void;
}

export function BookCoverLogin({ onSuccess, onGuestMode }: BookCoverLoginProps) {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithMagicLink,
    resetPassword,
    enterGuestMode,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      let result: { error: string | null };

      if (mode === "signin") {
        result = await signInWithEmail(email, password);
        if (!result.error) onSuccess?.();
      } else if (mode === "signup") {
        result = await signUpWithEmail(email, password, name);
        if (!result.error) {
          setSuccess("Check your email to confirm your account.");
        }
      } else if (mode === "magic") {
        result = await signInWithMagicLink(email);
        if (!result.error) {
          setSuccess("A magic link has been sent to your email.");
        }
      } else {
        result = await resetPassword(email);
        if (!result.error) {
          setSuccess("Password reset email sent.");
        }
      }

      if (result.error) setError(result.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Google Sign-In Error:", error);
        setError(error);
      }
    } catch (e: any) {
      console.error("Google Sign-In Exception:", e);
      setError(e.message || "An unexpected error occurred during Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    enterGuestMode();
    onGuestMode?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Demo mode notice */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.85 0.08 80 / 0.4), oklch(0.78 0.1 60 / 0.3))",
            border: "1px dashed oklch(0.78 0.13 75 / 0.5)",
          }}
        >
          <p className="text-xs text-ink/70 handwritten">
            Running in demo mode — add Supabase credentials in <code>.env.local</code> to enable
            auth
          </p>
        </motion.div>
      )}

      {/* Mode tabs */}
      <div
        className="flex gap-1 mb-8 p-1.5 rounded-full"
        style={{ background: "oklch(0.88 0.05 75 / 0.5)" }}
      >
        {(["signin", "signup"] as AuthMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
              setSuccess(null);
            }}
            className="flex-1 py-2.5 rounded-full text-base transition-all duration-300"
            style={{
              background: mode === m ? "var(--gradient-gold)" : "transparent",
              color: mode === m ? "var(--ink)" : "var(--ink-soft)",
              fontFamily: "var(--font-hand)",
              fontSize: "1.25rem",
            }}
          >
            {m === "signin" ? "sign in" : "begin here"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {mode === "signup" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InkField
                icon={<User className="w-4 h-4" />}
                type="text"
                placeholder="your name"
                value={name}
                onChange={setName}
                autoComplete="name"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {mode !== "reset" && (
          <InkField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="your email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
        )}

        {mode === "reset" && (
          <InkField
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="your email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
        )}

        {(mode === "signin" || mode === "signup") && (
          <div className="relative">
            <InkField
              icon={<Lock className="w-4 h-4" />}
              type={showPassword ? "text" : "password"}
              placeholder="your secret"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-center"
              style={{ color: "var(--rose)", fontFamily: "var(--font-hand)" }}
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="handwritten text-sm text-center"
              style={{ color: "var(--sage)" }}
            >
              ✦ {success}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-full flex items-center justify-center gap-3 text-ink display text-xl"
          style={{
            background: loading ? "oklch(0.85 0.08 70)" : "var(--gradient-gold)",
            boxShadow: "0 6px 24px oklch(0.78 0.13 75 / 0.35)",
          }}
        >
          {loading ? (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="handwritten text-xl"
            >
              opening the door…
            </motion.span>
          ) : (
            <>
              <span className="handwritten text-2xl">
                {mode === "signin"
                  ? "enter"
                  : mode === "signup"
                    ? "begin my journey"
                    : mode === "magic"
                      ? "send magic link"
                      : "reset password"}
              </span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      {/* Google OAuth — styled as magical seal */}
      {(mode === "signin" || mode === "signup") && (
        <div className="mt-4">
          <div className="flex items-center gap-3 my-4">
            <div className="ink-divider flex-1" />
            <span className="handwritten text-ink-soft/60 text-sm">or</span>
            <div className="ink-divider flex-1" />
          </div>

          <motion.button
            onClick={handleGoogle}
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px oklch(0.78 0.13 75 / 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-full flex items-center justify-center gap-4 glass"
            style={{ border: "1px solid oklch(0.78 0.13 75 / 0.4)" }}
          >
            {/* Google G */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="handwritten text-xl text-ink">Continue with Google</span>
            <Sparkles className="w-4 h-4 text-gold" />
          </motion.button>
        </div>
      )}

      {/* Secondary actions */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {mode === "signin" && (
          <div className="flex gap-6">
            <button
              onClick={() => setMode("magic")}
              className="handwritten text-base text-ink-soft/70 hover:text-ink-soft transition-colors"
            >
              magic link ✦
            </button>
            <button
              onClick={() => setMode("reset")}
              className="handwritten text-base text-ink-soft/70 hover:text-ink-soft transition-colors"
            >
              forgot password
            </button>
          </div>
        )}
        {(mode === "magic" || mode === "reset") && (
          <button
            onClick={() => setMode("signin")}
            className="handwritten text-base text-ink-soft/70 hover:text-ink-soft transition-colors"
          >
            ← back to sign in
          </button>
        )}

        <button
          onClick={handleGuest}
          className="handwritten text-base text-ink-soft/40 hover:text-ink-soft/70 transition-colors mt-2"
        >
          read without signing in
        </button>
      </div>
    </motion.div>
  );
}

// Ink-style input field component
function InkField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={{ borderColor: focused ? "oklch(0.78 0.13 75 / 0.8)" : "oklch(0.5 0.05 50 / 0.25)" }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        background: "oklch(0.97 0.02 80 / 0.6)",
        border: "1px solid oklch(0.5 0.05 50 / 0.25)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span className="text-ink-soft/60 shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent handwritten text-2xl text-ink placeholder:text-ink-soft/40 focus:outline-none"
      />
    </motion.div>
  );
}
