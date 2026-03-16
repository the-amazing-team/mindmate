import { ChatGroq } from "@langchain/groq";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Groq from "groq-sdk";
import { PROMPTS } from "./prompts";

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;
  private embedder: any;
  private chatGroq: ChatGroq;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>("GROQ_API_KEY"),
    });
    this.chatGroq = new ChatGroq({
      apiKey: this.configService.get<string>("GROQ_API_KEY"),
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });
  }

  async onModuleInit() {
    try {
      this.logger.log("Loading embedding model...");
      const { pipeline } = await eval('import("@xenova/transformers")');
      this.embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
      this.logger.log("Embedding model loaded.");
    } catch (err) {
      this.logger.error("Failed to load embedding model", err);
    }
  }

  private async groqCall(
    system: string,
    user: string,
    maxTokens = 400,
    history: any[] = [],
  ) {
    const formattedHistory = history.map((item) => {
      if (typeof item === "string") {
        return { role: "user", content: item };
      }
      return item;
    });

    const completion = await this.groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        ...formattedHistory,
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });
    return completion.choices[0]?.message?.content ?? "";
  }

  private parseJSON<T>(raw: string, fallback: T): T {
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return fallback;
    }
  }

  // ── SIMPLIFIED PIEPELINE IMPLEMENTATIONS ──────────────────────────────────

  async processJournal(payload: { content: string }) {
    this.logger.log("Processing journal content...");
    
    // Emotion Analysis
    const rawEmotion = await this.groqCall(
      PROMPTS.PIPELINE_A.EMOTION_ANALYSIS.SYSTEM,
      PROMPTS.PIPELINE_A.EMOTION_ANALYSIS.USER(payload.content),
      180,
    );
    const rawAnalysis = this.parseJSON(rawEmotion, {
      primary_emotion: "neutral",
      emotion_score: 0.5,
      secondary_emotions: [] as string[],
      valence: "mixed",
    });

    const emotionAnalysis = {
      primary_emotion: rawAnalysis.primary_emotion ?? "neutral",
      emotion_score: rawAnalysis.emotion_score ?? 0.5,
      secondary_emotions: rawAnalysis.secondary_emotions ?? [],
      valence: rawAnalysis.valence ?? "mixed",
    };

    // AI Reflection
    const reflectionText = await this.groqCall(
      PROMPTS.PIPELINE_A.AI_REFLECTION.SYSTEM,
      PROMPTS.PIPELINE_A.AI_REFLECTION.USER(
        emotionAnalysis.primary_emotion,
        payload.content,
      ),
      160,
    );

    return {
      ...emotionAnalysis,
      reflection_text: reflectionText,
    };
  }

  async generateInsights(payload: { context: string }) {
    this.logger.log("Generating insights from context...");
    
    // Pattern Detection
    const rawPatterns = await this.groqCall(
      PROMPTS.PIPELINE_B.PATTERN_DETECTION.SYSTEM,
      PROMPTS.PIPELINE_B.PATTERN_DETECTION.USER(payload.context),
      300,
    );
    const rawParsed = this.parseJSON(rawPatterns, {
      trend: "stable",
      dominant_emotions: [] as string[],
      stress_triggers: [] as string[],
      bright_spots: [] as string[],
      avg_emotion_score: 0.5,
    });

    const patterns = {
      trend: rawParsed.trend ?? "stable",
      dominant_emotions: rawParsed.dominant_emotions ?? [],
      stress_triggers: rawParsed.stress_triggers ?? [],
      bright_spots: rawParsed.bright_spots ?? [],
      avg_emotion_score: rawParsed.avg_emotion_score ?? 0.5,
    };

    // Generate Summary and Recommendations
    const [summary, recommendation] = await Promise.all([
      this.groqCall(
        PROMPTS.PIPELINE_B.WEEKLY_SUMMARY.SYSTEM,
        PROMPTS.PIPELINE_B.WEEKLY_SUMMARY.USER(patterns.trend, patterns.dominant_emotions),
        220,
      ),
      this.groqCall(
        PROMPTS.PIPELINE_B.RECOMMENDATION.SYSTEM,
        PROMPTS.PIPELINE_B.RECOMMENDATION.USER(patterns.stress_triggers),
        80,
      ),
    ]);

    return {
      patterns,
      summary,
      recommendation,
    };
  }

  async chatWithContext(payload: {
    question: string;
    context: string;
    history?: any[];
  }) {
    this.logger.log("Responding to chat question with context...");
    
    const answer = await this.groqCall(
      PROMPTS.PIPELINE_C.CHAT_RESPONSE.SYSTEM(payload.context),
      PROMPTS.PIPELINE_C.CHAT_RESPONSE.USER(payload.question),
      500,
      (payload.history ?? []).slice(-10),
    );

    return { answer };
  }

  async scheduleCheckin(payload: { context: string }) {
    this.logger.log("Calculating check-in time from context...");
    
    // Urgency Scoring
    const rawUrgency = await this.groqCall(
      PROMPTS.PIPELINE_D.URGENCY_SCORING.SYSTEM,
      // Pass a dummy daysAgo or adapt if needed, for now just using context
      `Analyze the following context for urgency: ${payload.context}`,
      120,
    );
    
    const urgency = this.parseJSON(rawUrgency, {
      urgency_score: 2,
      reason: "stable",
    });

    // Calculate next check-in time based on urgency
    // Higher urgency = sooner check-in
    const delayHours = urgency.urgency_score >= 7 ? 2 : urgency.urgency_score >= 4 ? 8 : 24;
    const scheduledTime = new Date(Date.now() + delayHours * 3600000).toISOString();

    return {
      urgency_score: urgency.urgency_score,
      reason: urgency.reason,
      scheduled_at_utc: scheduledTime,
    };
  }
}
