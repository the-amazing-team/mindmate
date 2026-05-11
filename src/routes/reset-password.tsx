import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MoodSky } from "@/components/storybook/MoodSky";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase!.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate({ to: "/" }), 2000);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center p-6">
      <MoodSky mood="calm" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md paper rounded-2xl p-10 text-center"
        style={{ boxShadow: "var(--shadow-page)" }}
      >
        <Heart className="w-10 h-10 mx-auto mb-6 text-gold" strokeWidth={1} />
        <h2 className="display text-3xl text-ink mb-2">New Beginnings</h2>
        <p className="handwritten text-ink-soft text-lg mb-8">
          choose a new secret for your journey —
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <p className="display text-2xl text-sage">✦ Secret updated.</p>
            <p className="handwritten text-ink-soft">Taking you back to the prologue...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div
              className="flex items-center gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: "oklch(0.97 0.02 80 / 0.6)",
                border: "1px solid oklch(0.5 0.05 50 / 0.25)",
              }}
            >
              <Lock className="w-5 h-5 text-ink-soft/60" />
              <input
                type="password"
                placeholder="new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 bg-transparent handwritten text-2xl text-ink focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-rose handwritten">✦ {error}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-full flex items-center justify-center gap-3 text-ink display text-xl"
              style={{ background: "var(--gradient-gold)" }}
            >
              <span className="handwritten text-2xl">
                {loading ? "updating..." : "renew secret"}
              </span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
