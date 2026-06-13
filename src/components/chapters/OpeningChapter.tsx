/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart } from "lucide-react";
import { useStorybook } from "@/lib/storybook-context";
import { useAuth } from "@/lib/auth-context";
import { BookCoverLogin } from "@/components/auth/BookCoverLogin";
import { PersonalityTestFlow } from "@/components/auth/PersonalityTestFlow";
import { useState, useEffect } from "react";
import { supabase, isDemoMode } from "@/lib/supabase";

type OpeningState = "landing" | "book-opening" | "auth" | "onboarding";

export function OpeningChapter() {
  const { enterBook, profile } = useStorybook();
  const { user, isGuest, loading } = useAuth();
  const [state, setState] = useState<OpeningState>("landing");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Auto-advance if user is already authenticated
  useEffect(() => {
    if (loading) return;
    if (user) {
      checkOnboarding();
    } else if (isGuest) {
      enterBook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuest, loading, enterBook]);

  const checkOnboarding = async () => {
    if (isDemoMode || !supabase || !user) {
      console.log("CheckOnboarding: Demo mode or no Supabase/user connection. Entering book.");
      enterBook();
      return;
    }
    try {
      console.log("CheckOnboarding: Querying profiles for user id:", user.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = (await supabase!
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .maybeSingle()) as any;

      if (error) {
        console.error("CheckOnboarding: Supabase error:", error);
        throw error;
      }

      console.log("CheckOnboarding: Fetched profiles onboarding status:", data);

      if (data?.onboarding_complete) {
        console.log("CheckOnboarding: Profiles row has onboarding_complete = true. Entering book.");
        enterBook();
      } else {
        console.log(
          "CheckOnboarding: Profiles row has onboarding_complete = false or row is missing. Redirecting to onboarding.",
        );
        // No profile or not complete -> Start onboarding
        setState("onboarding");
        setNeedsOnboarding(true);
      }
    } catch (err) {
      console.warn("Onboarding check failed, falling back to local profile state:", err);
      if (profile.onboarding_complete) {
        console.log(
          "CheckOnboarding: Local profile has onboarding_complete = true. Entering book.",
        );
        enterBook();
      } else {
        console.log(
          "CheckOnboarding: Local profile has onboarding_complete = false. Showing onboarding assessment.",
        );
        setState("onboarding");
        setNeedsOnboarding(true);
      }
    }
  };

  const handleBeginClick = () => {
    setState("book-opening");
    setTimeout(() => setState("auth"), 1200);
  };

  const handleAuthSuccess = () => {
    if (user) checkOnboarding();
  };

  const handleGuestMode = () => {
    enterBook();
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    enterBook();
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="handwritten text-moonlight/60 text-2xl"
        >
          the pages are turning…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Floating ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute w-150 h-150 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.78 0.13 75 / 0.25), transparent 60%)",
        }}
      />

      {/* Secondary aurora glow */}
      <motion.div
        animate={{ x: [-20, 20, -20], y: [-10, 15, -10] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-100 h-100 rounded-full blur-[100px] pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle, oklch(0.75 0.09 295 / 0.5), transparent 70%)",
          top: "20%",
          right: "10%",
        }}
      />

      <AnimatePresence mode="wait">
        {/* LANDING STATE */}
        {state === "landing" && (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 2 }}
              className="handwritten text-2xl sm:text-3xl text-moonlight/80 italic mb-10"
            >
              "Every feeling deserves a page."
            </motion.p>

            {/* The storybook */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
              className="relative mb-12"
            >
              {/* Book cover */}
              <div
                className="relative w-80 h-110 sm:w-120 sm:h-160 rounded-xl mx-auto overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, oklch(0.3 0.08 30), oklch(0.18 0.06 20))",
                  boxShadow:
                    "0 40px 80px -20px oklch(0.1 0.05 20 / 0.8), 8px 0 0 oklch(0.15 0.05 20) inset, -2px 0 0 oklch(0.4 0.06 30 / 0.5) inset",
                }}
              >
                {/* Leather texture */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, oklch(0.5 0.05 30 / 0.3) 0, oklch(0.5 0.05 30 / 0.3) 1px, transparent 1px, transparent 4px)",
                  }}
                />

                {/* Golden border */}
                <div
                  className="absolute inset-3 rounded pointer-events-none"
                  style={{
                    border: "1px solid oklch(0.78 0.13 75 / 0.6)",
                    boxShadow:
                      "inset 0 0 20px oklch(0.78 0.13 75 / 0.1), 0 0 20px oklch(0.78 0.13 75 / 0.2)",
                  }}
                />

                {/* Embossed title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Heart
                      className="w-20 h-20 mx-auto mb-4"
                      style={{ color: "oklch(0.78 0.13 75)" }}
                      strokeWidth={1}
                    />
                  </motion.div>
                  <h1
                    className="display text-6xl font-light tracking-wide"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.9 0.1 80), oklch(0.78 0.13 75), oklch(0.65 0.12 50))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "none",
                    }}
                  >
                    MindMate
                  </h1>
                  <p className="handwritten text-sm text-moonlight/50 tracking-widest">
                    a living storybook for the heart
                  </p>

                  {/* Floating ink particles on the cover */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 2 + Math.random() * 3,
                        height: 2 + Math.random() * 3,
                        background: "oklch(0.78 0.13 75 / 0.6)",
                        left: `${15 + Math.random() * 70}%`,
                        top: `${10 + Math.random() * 80}%`,
                      }}
                      animate={{
                        y: [-5, -20, -5],
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        delay: Math.random() * 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>

                {/* Spine shadow */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, oklch(0.1 0.03 20 / 0.7), transparent)",
                  }}
                />
              </div>
            </motion.div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 1.2 }}
              onClick={handleBeginClick}
              whileHover={{ scale: 1.05, boxShadow: "0 0 60px oklch(0.78 0.13 75 / 0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="group relative z-10 inline-flex items-center gap-3 px-10 py-4 rounded-full glass text-ink"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <BookOpen className="w-5 h-5 transition-transform group-hover:rotate-6" />
              <span className="display text-lg">Begin Your Journey</span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4, duration: 2 }}
              className="absolute bottom-10 handwritten text-moonlight/40 text-base"
            >
              breathe in… breathe out…
            </motion.p>
          </motion.div>
        )}

        {/* BOOK-OPENING ANIMATION */}
        {state === "book-opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -160 }}
              transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
              style={{
                transformPerspective: 1200,
                transformOrigin: "left center",
                background: "linear-gradient(160deg, oklch(0.94 0.04 80), oklch(0.88 0.06 75))",
              }}
              className="w-80 h-110 sm:w-120 sm:h-160 rounded-r-xl"
            />
            <p className="handwritten text-moonlight/60 text-xl mt-8 animate-pulse">
              the pages are opening…
            </p>
          </motion.div>
        )}

        {/* AUTH FORM — Inside the book */}
        {state === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="relative z-10 w-80 sm:w-120"
          >
            {/* Parchment page background */}
            <div
              className="paper rounded-2xl p-8 sm:p-10"
              style={{
                boxShadow: "var(--shadow-page)",
                minHeight: "440px",
              }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <Heart
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: "var(--gold)" }}
                    strokeWidth={1.5}
                  />
                </motion.div>
                <h2 className="display text-3xl text-ink mb-1">Welcome home.</h2>
                <p className="handwritten text-ink-soft text-base">
                  sign in to continue your story —
                </p>
              </div>

              <BookCoverLogin onSuccess={handleAuthSuccess} onGuestMode={handleGuestMode} />

              {/* Page footer decoration */}
              <div className="mt-8 pt-4 border-t border-dashed border-ink-soft/20 text-center">
                <p className="handwritten text-ink/30 text-xs">
                  your words are safe here · encrypted · private
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ONBOARDING */}
        {state === "onboarding" && needsOnboarding && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-80 sm:w-150"
          >
            <div
              className="paper rounded-2xl p-8 sm:p-10"
              style={{ boxShadow: "var(--shadow-page)" }}
            >
              <PersonalityTestFlow onComplete={handleOnboardingComplete} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
