import { ChatGroq } from "@langchain/groq";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import { PROMPTS } from "./prompts";

/**
 * AI Processing Layer (LangGraph-lite)
 * Ported from Supabase Edge Functions to NestJS Local API
 */

const PipelineAAnnotation = Annotation.Root({
  section_id: Annotation<string>(),
  content: Annotation<string>(),
  primary_emotion: Annotation<string | null>(),
  emotion_score: Annotation<number | null>(),
  secondary_emotions: Annotation<string[]>(),
  valence: Annotation<string | null>(),
  reflection_text: Annotation<string | null>(),
  embedding_stored: Annotation<boolean>(),
});

const PipelineBAnnotation = Annotation.Root({
  user_id: Annotation<string>(),
  sections: Annotation<
    Array<{
      content: string;
      created_at: string;
      primary_emotion: string | null;
      emotion_score: number | null;
    }>
  >(),
  patterns: Annotation<any | null>(),
  summary: Annotation<string | null>(),
  recommendation: Annotation<string | null>(),
});

const PipelineCAnnotation = Annotation.Root({
  user_id: Annotation<string>(),
  question: Annotation<string>(),
  history: Annotation<any[]>(),
  profile_name: Annotation<string>(),
  question_embedding: Annotation<number[]>(),
  context_sections: Annotation<
    Array<{
      content: string;
      primary_emotion: string;
      emotion_score: number;
      date: string;
      similarity: number;
    }>
  >(),
  answer: Annotation<string | null>(),
});

const PipelineDAnnotation = Annotation.Root({
  user_id: Annotation<string>(),
  chat_summary: Annotation<string>(),
  journal_summary: Annotation<string>(),
  last_call_days_ago: Annotation<number>(),
  last_call_outcome: Annotation<string>(),
  urgency_score: Annotation<number | null>(),
  urgency_reason: Annotation<string | null>(),
  action: Annotation<string | null>(),
  message_preview: Annotation<string | null>(),
  delay_hours: Annotation<number | null>(),
  scheduled: Annotation<string | undefined>(),
  scheduled_at: Annotation<string | undefined>(),
});

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;
  private sb: SupabaseClient;
  private embedder: any;
  private chatGroq: ChatGroq;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>("GROQ_API_KEY"),
    });
    this.sb = createClient(
      this.configService.get<string>("SUPABASE_URL")!,
      this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    this.chatGroq = new ChatGroq({
      apiKey: this.configService.get<string>("GROQ_API_KEY"),
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
    });
  }

  async onModuleInit() {
    try {
      // Lazy load transformers to avoid blocking startup
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

  /**
   * (Removed manual runGraph implementation)
   */

  private async groqCall(
    system: string,
    user: string,
    maxTokens = 400,
    history: any[] = [],
  ) {
    const completion = await this.groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        ...history,
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });
    return completion.choices[0]?.message?.content ?? "";
  }

  private async embed(text: string): Promise<number[]> {
    if (!this.embedder) throw new Error("Embedder not initialized");
    const output = await this.embedder(text.slice(0, 8000), {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(output.data);
  }

  private parseJSON<T>(raw: string, fallback: T): T {
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return fallback;
    }
  }

  // ── PIEPELINE IMPLEMENTATIONS ──────────────────────────────────────────────

  async processJournal(payload: {
    section_id: string;
    content: string;
    journal_entry_id?: string;
  }) {
    const emotion_analysis = async (
      state: typeof PipelineAAnnotation.State,
    ) => {
      const raw = await this.groqCall(
        PROMPTS.PIPELINE_A.EMOTION_ANALYSIS.SYSTEM,
        PROMPTS.PIPELINE_A.EMOTION_ANALYSIS.USER(state.content),
        180,
      );
      const parsed = this.parseJSON(raw, {
        primary_emotion: "neutral",
        emotion_score: 0.5,
        secondary_emotions: [] as string[],
        valence: "mixed",
      });
      await this.sb.from("emotion_analysis").upsert(
        {
          section_id: state.section_id,
          primary_emotion: parsed.primary_emotion,
          emotion_score: parsed.emotion_score,
        },
        { onConflict: "section_id" },
      );
      return { ...parsed, secondary_emotions: parsed.secondary_emotions ?? [] };
    };

    const ai_reflection = async (state: typeof PipelineAAnnotation.State) => {
      const reflection_text = await this.groqCall(
        PROMPTS.PIPELINE_A.AI_REFLECTION.SYSTEM,
        PROMPTS.PIPELINE_A.AI_REFLECTION.USER(
          state.primary_emotion,
          state.content,
        ),
        160,
      );
      await this.sb.from("ai_reflections").upsert(
        {
          section_id: state.section_id,
          reflection_text,
        },
        { onConflict: "section_id" },
      );
      return { reflection_text };
    };

    const store_embedding = async (state: typeof PipelineAAnnotation.State) => {
      const enrichedText = `${state.content}\nEmotion: ${state.primary_emotion}`;
      const embedding = await this.embed(enrichedText);
      await this.sb.from("journal_embeddings").upsert(
        {
          section_id: state.section_id,
          embedding,
        },
        { onConflict: "section_id" },
      );
      return { embedding_stored: true };
    };

    const workflow = new StateGraph(PipelineAAnnotation)
      .addNode("emotion_analysis", emotion_analysis)
      .addNode("ai_reflection", ai_reflection)
      .addNode("store_embedding", store_embedding)
      .addEdge(START, "emotion_analysis")
      .addEdge("emotion_analysis", "ai_reflection")
      .addEdge("ai_reflection", "store_embedding")
      .addEdge("store_embedding", END);

    const app = workflow.compile();
    const result = await app.invoke({
      section_id: payload.section_id,
      content: payload.content,
      primary_emotion: null,
      emotion_score: null,
      secondary_emotions: [],
      valence: null,
      reflection_text: null,
      embedding_stored: false,
    });

    if (payload.journal_entry_id) {
      await this.sb
        .from("journal_entries")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", payload.journal_entry_id);
    }
    return result;
  }

  async generateInsights(payload: { user_id: string }) {
    const { data: sections } = await this.sb
      .from("journal_sections")
      .select(
        `
        id, content, created_at,
        journal_entries!inner(user_id),
        emotion_analysis(primary_emotion, emotion_score)
      `,
      )
      .eq("journal_entries.user_id", payload.user_id)
      .order("created_at", { ascending: false })
      .limit(30);

    const flatSections = ((sections as any[]) ?? []).map((s) => ({
      content: s.content,
      created_at: s.created_at,
      primary_emotion: s.emotion_analysis?.[0]?.primary_emotion ?? null,
      emotion_score: s.emotion_analysis?.[0]?.emotion_score ?? null,
    }));

    const pattern_detection = async (
      state: typeof PipelineBAnnotation.State,
    ) => {
      const entrySummary = state.sections
        .map(
          (s) =>
            `[${new Date(s.created_at).toLocaleDateString()}] emotion:${s.primary_emotion} — ${s.content.slice(0, 100)}`,
        )
        .join("\n");
      const raw = await this.groqCall(
        PROMPTS.PIPELINE_B.PATTERN_DETECTION.SYSTEM,
        PROMPTS.PIPELINE_B.PATTERN_DETECTION.USER(entrySummary),
        300,
      );
      const patterns = this.parseJSON(raw, {
        trend: "stable",
        dominant_emotions: [] as string[],
        stress_triggers: [] as string[],
        bright_spots: [] as string[],
        avg_emotion_score: 0.5,
      });
      return { patterns };
    };

    const generate_insights = async (
      state: typeof PipelineBAnnotation.State,
    ) => {
      const p = state.patterns;
      const [summary, recommendation] = await Promise.all([
        this.groqCall(
          PROMPTS.PIPELINE_B.WEEKLY_SUMMARY.SYSTEM,
          PROMPTS.PIPELINE_B.WEEKLY_SUMMARY.USER(p.trend, p.dominant_emotions),
          220,
        ),
        this.groqCall(
          PROMPTS.PIPELINE_B.RECOMMENDATION.SYSTEM,
          PROMPTS.PIPELINE_B.RECOMMENDATION.USER(p.stress_triggers),
          80,
        ),
      ]);
      await this.sb.from("insights").insert([
        {
          user_id: state.user_id,
          insight_type: "weekly_summary",
          insight_text: summary,
        },
        {
          user_id: state.user_id,
          insight_type: "recommendation",
          insight_text: recommendation,
        },
      ]);
      return { summary, recommendation };
    };

    const workflow = new StateGraph(PipelineBAnnotation)
      .addNode("pattern_detection", pattern_detection)
      .addNode("generate_insights", generate_insights)
      .addEdge(START, "pattern_detection")
      .addEdge("pattern_detection", "generate_insights")
      .addEdge("generate_insights", END);

    const app = workflow.compile();
    return app.invoke({
      user_id: payload.user_id,
      sections: flatSections,
      patterns: null,
      summary: null,
      recommendation: null,
    });
  }

  async chatWithContext(payload: {
    user_id: string;
    question: string;
    history?: any[];
    profile_name?: string;
  }) {
    const vector_search = async (state: typeof PipelineCAnnotation.State) => {
      const question_embedding = await this.embed(state.question);
      return { question_embedding };
    };

    const context_retrieval = async (
      state: typeof PipelineCAnnotation.State,
    ) => {
      const { data, error } = await this.sb.rpc("match_journal_sections", {
        query_embedding: state.question_embedding,
        match_user_id: state.user_id,
        match_threshold: 0.68,
        match_count: 5,
      });
      const context_sections = ((data as any[]) ?? []).map((row) => ({
        content: row.content,
        primary_emotion: row.primary_emotion ?? "unknown",
        emotion_score: row.emotion_score ?? 0,
        date: new Date(row.created_at).toLocaleDateString(),
        similarity: Math.round((row.similarity ?? 0) * 100),
      }));
      return { context_sections };
    };

    const ai_response = async (state: typeof PipelineCAnnotation.State) => {
      const contextBlock = state.context_sections
        .map(
          (s) =>
            `[${s.date}] emotion:${s.primary_emotion} — "${s.content.slice(0, 180)}"`,
        )
        .join("\n");
      const answer = await this.groqCall(
        PROMPTS.PIPELINE_C.CHAT_RESPONSE.SYSTEM(contextBlock),
        PROMPTS.PIPELINE_C.CHAT_RESPONSE.USER(state.question),
        500,
        (state.history ?? []).slice(-10),
      );
      return { answer };
    };

    const workflow = new StateGraph(PipelineCAnnotation)
      .addNode("vector_search", vector_search)
      .addNode("context_retrieval", context_retrieval)
      .addNode("ai_response", ai_response)
      .addEdge(START, "vector_search")
      .addEdge("vector_search", "context_retrieval")
      .addEdge("context_retrieval", "ai_response")
      .addEdge("ai_response", END);

    const app = workflow.compile();
    return app.invoke({
      user_id: payload.user_id,
      question: payload.question,
      history: payload.history ?? [],
      profile_name: payload.profile_name ?? "",
      question_embedding: [],
      context_sections: [],
      answer: null,
    });
  }

  async scheduleCheckin(payload: {
    user_id: string;
    chat_summary?: string;
    journal_summary?: string;
  }) {
    const { data: lastCall } = await this.sb
      .from("ai_call_logs")
      .select("call_ended_at, summary, ai_call_schedules!inner(user_id)")
      .eq("ai_call_schedules.user_id", payload.user_id)
      .order("call_ended_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastCallDaysAgo = lastCall?.call_ended_at
      ? Math.floor(
          (Date.now() - new Date(lastCall.call_ended_at).getTime()) /
            86_400_000,
        )
      : 999;

    const urgency_scoring = async (state: typeof PipelineDAnnotation.State) => {
      const raw = await this.groqCall(
        PROMPTS.PIPELINE_D.URGENCY_SCORING.SYSTEM,
        PROMPTS.PIPELINE_D.URGENCY_SCORING.USER(state.last_call_days_ago),
        120,
      );
      const parsed = this.parseJSON(raw, {
        urgency_score: 2,
        reason: "stable",
      });
      return {
        urgency_score: parsed.urgency_score,
        urgency_reason: parsed.reason,
      };
    };

    const schedule_decision = async (
      state: typeof PipelineDAnnotation.State,
    ) => {
      if ((state.urgency_score ?? 0) <= 3) return { action: "none" };
      const action = (state.urgency_score ?? 0) >= 7 ? "ai_call" : "checkin";
      const message_preview = await this.groqCall(
        PROMPTS.PIPELINE_D.NOTIFICATION_MESSAGE.SYSTEM(action),
        PROMPTS.PIPELINE_D.NOTIFICATION_MESSAGE.USER(state.urgency_reason),
        60,
      );
      return {
        action,
        message_preview,
        delay_hours: action === "ai_call" ? 2 : 8,
      };
    };

    const schedule_checkin = async (
      state: typeof PipelineDAnnotation.State,
    ) => {
      await this.sb.from("ai_checkins").insert({
        user_id: state.user_id,
        trigger_reason: state.urgency_reason,
        message: state.message_preview,
      });
      return { scheduled: "checkin" };
    };

    const schedule_call = async (state: typeof PipelineDAnnotation.State) => {
      const run_at = new Date(
        Date.now() + (state.delay_hours ?? 2) * 3_600_000,
      ).toISOString();
      await this.sb.from("ai_call_schedules").insert({
        user_id: state.user_id,
        scheduled_at: run_at,
        call_type: "check_in",
        trigger_source: state.urgency_reason,
        status: "pending",
      });
      return { scheduled: "call", scheduled_at: run_at };
    };

    const workflow = new StateGraph(PipelineDAnnotation)
      .addNode("urgency_scoring", urgency_scoring)
      .addNode("schedule_decision", schedule_decision)
      .addNode("schedule_checkin", schedule_checkin)
      .addNode("schedule_call", schedule_call)
      .addEdge(START, "urgency_scoring")
      .addEdge("urgency_scoring", "schedule_decision")
      .addConditionalEdges("schedule_decision", (state) => {
        if (state.action === "none") return END;
        return state.action === "ai_call"
          ? "schedule_call"
          : "schedule_checkin";
      })
      .addEdge("schedule_checkin", END)
      .addEdge("schedule_call", END);

    const app = workflow.compile();
    return app.invoke({
      user_id: payload.user_id,
      chat_summary: payload.chat_summary ?? "",
      journal_summary: payload.journal_summary ?? "",
      last_call_days_ago: lastCallDaysAgo,
      last_call_outcome: (lastCall as any)?.summary ?? "none",
      urgency_score: null,
      urgency_reason: null,
      action: null,
      message_preview: null,
      delay_hours: null,
    });
  }
}
