// ============================================================
// Crisis Detection — Client-side fast pattern matching
// Runs before any API call as a safety layer
// ============================================================

export type CrisisLevel = "none" | "concern" | "crisis";

export interface CrisisAssessment {
  level: CrisisLevel;
  category: string | null;
  shouldShowResources: boolean;
  groundingExercise: string;
}

// High-risk patterns requiring immediate response
const CRISIS_PATTERNS = [
  /\b(kill|end)\s+(my|my self|myself|it all|everything)\b/i,
  /\b(want to|going to|thinking about|planning to)\s+(die|end my life)\b/i,
  /\bsuicid/i,
  /\bself.harm\b/i,
  /\bcut(ting)? myself\b/i,
  /\bno (reason|point) to (live|go on)\b/i,
  /\b(everyone|everything) would be better without me\b/i,
  /\bcan't (take|do) (it|this) anymore\b/i,
];

// Concern patterns (worth monitoring, gentle check-in)
const CONCERN_PATTERNS = [
  /\b(numb|empty|hollow|hollow inside)\b/i,
  /\b(hopeless|worthless|useless|burden)\b/i,
  /\b(don't want to wake up|wish I didn't exist)\b/i,
  /\b(what's the point|nothing matters)\b/i,
  /\bextreme(ly)? (anxious|panic|terrified)\b/i,
  /\b(breakdown|falling apart|can't cope)\b/i,
];

const GROUNDING_EXERCISES = [
  "Take one slow breath with me. In through your nose for 4 counts... hold for 4... out through your mouth for 6. You don't have to figure everything out right now.",
  "Place your feet flat on the floor. Feel the ground beneath you. Name 3 things you can see right now. You are here. You are safe in this moment.",
  "Put one hand on your chest and feel your heartbeat. It's still going. You're still here. That matters. Take one breath, then another.",
  "Look around and find something soft — a blanket, your sleeve, a pillow. Touch it. Feel its texture. You are in your body. Your body is safe right now.",
];

export function detectCrisis(text: string): CrisisAssessment {
  // Check for crisis-level language
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        level: "crisis",
        category: "safety",
        shouldShowResources: true,
        groundingExercise:
          GROUNDING_EXERCISES[Math.floor(Math.random() * GROUNDING_EXERCISES.length)],
      };
    }
  }

  // Check for concern-level language
  for (const pattern of CONCERN_PATTERNS) {
    if (pattern.test(text)) {
      return {
        level: "concern",
        category: "emotional-distress",
        shouldShowResources: false,
        groundingExercise:
          GROUNDING_EXERCISES[Math.floor(Math.random() * GROUNDING_EXERCISES.length)],
      };
    }
  }

  return {
    level: "none",
    category: null,
    shouldShowResources: false,
    groundingExercise: "",
  };
}

export const CRISIS_RESOURCES = {
  title: "You don't have to carry this alone",
  resources: [
    { name: "Crisis Text Line", detail: "Text HOME to 741741", url: "sms:741741" },
    { name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988", url: "tel:988" },
    {
      name: "International Association for Suicide Prevention",
      detail: "iasp.info/resources/Crisis_Centres/",
      url: "https://www.iasp.info/resources/Crisis_Centres/",
    },
  ],
};
