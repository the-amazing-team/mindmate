import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { StorybookProvider, moodPalette, useStorybook } from "@/lib/storybook-context";
import { Particles } from "@/components/storybook/Particles";
import { MoodSky } from "@/components/storybook/MoodSky";
import { BookFrame } from "@/components/storybook/BookFrame";
import { OpeningChapter } from "@/components/chapters/OpeningChapter";
import { HomeChapter } from "@/components/chapters/HomeChapter";
import { CompanionChapter } from "@/components/chapters/CompanionChapter";
import { JournalChapter } from "@/components/chapters/JournalChapter";
import { InsightsChapter } from "@/components/chapters/InsightsChapter";
import { CalmChapter } from "@/components/chapters/CalmChapter";
import { ProfileChapter } from "@/components/chapters/ProfileChapter";
import { PluginsChapter } from "@/components/chapters/PluginsChapter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindMate — A Living Storybook for the Heart" },
      {
        name: "description",
        content:
          "A cinematic AI mental wellness storybook. Journal, breathe, and explore your emotional universe.",
      },
      { property: "og:title", content: "MindMate — A Living Storybook" },
      {
        property: "og:description",
        content: "Open the book. Meet a compassionate AI companion. Heal at your own pace.",
      },
    ],
  }),
  component: () => (
    <StorybookProvider>
      <Experience />
    </StorybookProvider>
  ),
});

function Experience() {
  const { enteredBook, chapter, mood } = useStorybook();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Mood-reactive ambient sky */}
      <MoodSky mood={mood} />
      <Particles count={enteredBook ? 28 : 40} color={moodPalette[mood].particle} />

      <AnimatePresence mode="wait">
        {!enteredBook ? (
          <motion.div key="opening" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 1 }}>
            <OpeningChapter />
          </motion.div>
        ) : (
          <motion.div
            key="book"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
            className="py-12 sm:py-16"
          >
            <BookFrame>
              {chapter === "home" && <HomeChapter />}
              {chapter === "companion" && <CompanionChapter />}
              {chapter === "journal" && <JournalChapter />}
              {chapter === "insights" && <InsightsChapter />}
              {chapter === "calm" && <CalmChapter />}
              {chapter === "plugins" && <PluginsChapter />}
              {chapter === "profile" && <ProfileChapter />}
            </BookFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
