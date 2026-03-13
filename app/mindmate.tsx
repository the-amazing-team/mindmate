import { useCallback, useEffect, useRef, useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  void:"#04060F", deep:"#080C1A", surface:"#0C1020",
  lift:"#111827", card:"#141C30", border:"rgba(148,163,184,0.08)",
  neon:"#A78BFA", cyan:"#34D399", rose:"#F87171",
  amber:"#FBBF24", lime:"#86EFAC", pink:"#F472B6", blue:"#60A5FA",
  text:"#F8FAFF", sub:"#94A3B8", muted:"#3D4F6A",
  a1:"#6D28D9", a2:"#0F766E", a3:"#9F1239", a4:"#1D4ED8",
};

const MOOD = [
  {e:"😞",l:"Low",c:"#F87171",v:0},
  {e:"😔",l:"Meh",c:"#FB923C",v:1},
  {e:"😐",l:"Okay",c:"#FBBF24",v:2},
  {e:"🙂",l:"Good",c:"#86EFAC",v:3},
  {e:"😊",l:"Great",c:"#34D399",v:4},
];

const TAGS = ["Work 💼","Anxiety 😰","Sleep 🌙","Family 🏡","Joy ✨","Exercise 💪","Stress 😤","Gratitude 🙏","Focus 🎯","Relationships 💞"];

const PLUGINS = [
  {id:"breathe",name:"4-7-8 Breathing",icon:"🌬️",author:"@wellness_dev",installs:"12.4k",cat:"Calm",color:C.cyan,desc:"Guided breathing cycles to activate your parasympathetic nervous system.",active:true},
  {id:"cbt",name:"CBT Thought Record",icon:"🧩",author:"@therapy_tools",installs:"8.1k",cat:"Therapy",color:C.neon,desc:"Structured cognitive distortion identification and reframing exercises.",active:false},
  {id:"gratitude",name:"Daily Gratitude 3x3",icon:"🙏",author:"@mindful_builds",installs:"21k",cat:"Habits",color:C.amber,desc:"Three gratitude prompts, three times a day. Rewires negativity bias.",active:true},
  {id:"body",name:"Body Scan Meditation",icon:"🧘",author:"@somatic_lab",installs:"5.3k",cat:"Calm",color:C.blue,desc:"Progressive body awareness meditation from head to toe.",active:false},
  {id:"sleep",name:"Sleep Wind-Down",icon:"🌙",author:"@sleep_science",installs:"17.8k",cat:"Sleep",color:C.pink,desc:"30-min evening routine: dimming reflections, tomorrow prep, sleep cue.",active:false},
  {id:"affirmations",name:"Identity Affirmations",icon:"⚡",author:"@neuro_habits",installs:"9.2k",cat:"Growth",color:"#F59E0B",desc:"Science-backed identity-based affirmation system to shift self-concept.",active:true},
];

const JOURNAL_ENTRIES = [
  {id:1,mood:3,text:"Had a really productive day. Pushed through that feature I've been avoiding for two weeks. The team loved the demo. Feeling genuinely accomplished — but also a little drained from it all.",tags:["Work 💼","Joy ✨"],date:"Today, 9:14 PM",insight:"Your productivity peaks correlate with completing avoided tasks. Procrastination may be your biggest energy drain."},
  {id:2,mood:1,text:"Woke up with this heavy feeling that I couldn't shake. Deadlines are piling up. I snapped at my sister over dinner and immediately felt terrible about it.",tags:["Anxiety 😰","Stress 😤","Family 🏡"],date:"Yesterday, 8:42 PM",insight:"High stress tends to spill into relationships. You might benefit from a brief decompression ritual before family time."},
  {id:3,mood:4,text:"Morning run at 6am. First time in two weeks. Everything looked different in that early light. Journaled for 20 minutes after. This is what consistency feels like.",tags:["Exercise 💪","Gratitude 🙏"],date:"Mon, 7:31 AM",insight:"Your highest mood entries all include physical movement. Morning is your optimal window for exercise."},
  {id:4,mood:2,text:"Nothing particularly wrong, nothing particularly right. Just... existing. Sometimes I wonder if I'm living on autopilot. What am I actually working toward?",tags:["Focus 🎯"],date:"Sun, 11:58 PM",insight:"Existential questioning often precedes meaningful directional shifts. This restlessness is a signal, not a problem."},
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0;}
::-webkit-scrollbar{width:0;height:0;}
input,textarea{font-family:inherit;}
button{font-family:inherit;outline:none;cursor:pointer;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes breatheIn{0%{transform:scale(1)}50%{transform:scale(1.6)}100%{transform:scale(1)}}
@keyframes ripple{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.4);opacity:0}}
@keyframes panicPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(248,113,113,0.4)}50%{transform:scale(1.02);box-shadow:0 0 0 20px rgba(248,113,113,0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes waveIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
`;

// ─── SHARED COMPONENTS ─────────────────────────────────────────────────────────
type OrbProps = { x: number; y: number; size: number; color: string; delay?: number };
const Orb: React.FC<OrbProps> = ({x,y,size,color,delay=0}) => (
  <div style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:size,height:size,borderRadius:"50%",
    background:`radial-gradient(circle,${color}28 0%,transparent 70%)`,
    transform:"translate(-50%,-50%)",pointerEvents:"none",
    animation:`float ${6+delay}s ${delay}s ease-in-out infinite`}}/>
);

type TagProps = { label: string; color?: string };
const Tag: React.FC<TagProps> = ({label,color=C.neon}) => (
  <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:600,
    background:`${color}18`,color,border:`1px solid ${color}30`,
    fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:".03em",whiteSpace:"nowrap"}}>
    {label}
  </span>
);

type GlassCardProps = { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; delay?: number };
const GlassCard: React.FC<GlassCardProps> = ({children,style={},onClick=undefined,delay=0}) => (
  <div onClick={onClick} style={{
    background:`linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.01))`,
    border:`1px solid ${C.border}`,borderRadius:20,
    backdropFilter:"blur(12px)",
    animation:`fadeUp .5s ${delay}s both`,
    cursor:onClick?"pointer":"default",
    transition:"transform .2s, box-shadow .2s",
    ...style
  }}>{children}</div>
);

type PillProps = { children: React.ReactNode; active?: boolean; color?: string; onClick?: () => void; size?: "sm"|"md" };
const Pill: React.FC<PillProps> = ({children,active,color=C.neon,onClick=undefined,size="md"}) => (
  <button onClick={onClick} style={{
    padding:size==="sm"?"4px 10px":"7px 15px",
    borderRadius:50,
    background:active?`${color}22`:"transparent",
    border:`1.5px solid ${active?color:C.border}`,
    color:active?color:C.sub,
    fontSize:size==="sm"?10:12,fontWeight:active?700:500,
    fontFamily:"'Plus Jakarta Sans',sans-serif",
    transition:"all .2s",
    boxShadow:active?`0 0 12px ${color}25`:"none",
  }}>{children}</button>
);

type MoodDotProps = { mood: number; size?: number };
const MoodDot: React.FC<MoodDotProps> = ({mood,size=32}) => (
  <div style={{width:size,height:size,borderRadius:size/3,
    background:`${MOOD[mood]?.c}22`,border:`1.5px solid ${MOOD[mood]?.c}55`,
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:size*.52,flexShrink:0,
    boxShadow:`0 0 ${size*.4}px ${MOOD[mood]?.c}33`}}>
    {MOOD[mood]?.e}
  </div>
);

const Spinner = ({size=20,color=C.neon}) => (
  <div style={{width:size,height:size,borderRadius:"50%",
    border:`2px solid ${color}30`,borderTop:`2px solid ${color}`,
    animation:"spin .7s linear infinite"}}/>
);

// ─── INSIGHT DASHBOARD ────────────────────────────────────────────────────────
const InsightDashboard = () => {
  const [period,setPeriod] = useState("week");
  const weekMoods = [2,3,1,4,3,4,null];
  const days = ["M","T","W","T","F","S","S"];
  const topTags = [
    {tag:"Work 💼",count:8,pct:72,color:C.neon},
    {tag:"Stress 😤",count:6,pct:54,color:C.rose},
    {tag:"Gratitude 🙏",count:5,pct:45,color:C.cyan},
    {tag:"Exercise 💪",count:4,pct:36,color:C.lime},
    {tag:"Anxiety 😰",count:3,pct:27,color:C.amber},
  ];
  const moodDist = [
    {label:"Great",count:4,c:C.cyan},{label:"Good",count:7,c:C.lime},
    {label:"Okay",count:5,c:C.amber},{label:"Meh",count:3,c:"#FB923C"},{label:"Low",count:2,c:C.rose},
  ];
  const total = moodDist.reduce((s,x)=>s+x.count,0);

  return(
    <div style={{flex:1,overflowY:"auto",padding:"0 0 24px"}}>

      {/* Header */}
      <div style={{padding:"18px 20px 12px",borderBottom:`1px solid ${C.border}`,
        background:`linear-gradient(180deg,${C.surface},transparent)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:C.text,letterSpacing:"-.02em"}}>
              Your Insights ◈
            </h2>
            <p style={{fontSize:11,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",marginTop:2}}>Powered by AI pattern recognition</p>
          </div>
          <div style={{display:"flex",gap:4}}>
            {["week","month"].map(p=>(
              <Pill key={p} active={period===p} onClick={()=>setPeriod(p)} size="sm"
                color={C.neon}>{p}</Pill>
            ))}
          </div>
        </div>

        {/* Summary KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {label:"Avg Mood",val:"3.2",unit:"/4",color:C.lime,icon:"📈"},
            {label:"Streak",val:"7",unit:"days",color:C.amber,icon:"🔥"},
            {label:"Entries",val:"21",unit:"total",color:C.cyan,icon:"✦"},
          ].map((k,i)=>(
            <GlassCard key={i} delay={i*.06} style={{padding:"12px 10px",textAlign:"center"}} onClick={undefined}>
              <div style={{fontSize:16,marginBottom:3}}>{k.icon}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:k.color,lineHeight:1}}>
                {k.val}<span style={{fontSize:10,color:C.muted,fontWeight:400}}>{k.unit}</span>
              </div>
              <div style={{fontSize:9,color:C.muted,marginTop:2,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>{k.label}</div>
            </GlassCard>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:16}}>

        {/* Mood Timeline */}
        <GlassCard delay={.1} style={{padding:"14px 16px"}} onClick={undefined}>
          <p style={{fontSize:10,color:C.sub,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:12}}>Mood Timeline</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:56}}>
            {weekMoods.map((v,i)=>{
              const h = v==null ? 4 : Math.round((v/4)*48)+8;
              const col = v==null ? C.muted+"40" : MOOD[v]?.c;
              const isToday = i===6;
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:"100%",height:h,borderRadius:"4px 4px 0 0",
                    background:v==null?C.muted+"20":`linear-gradient(180deg,${col}CC,${col}60)`,
                    boxShadow:v!=null&&isToday?`0 0 10px ${col}66`:"none",
                    border:isToday?`1px solid ${col}77`:"none",
                    transition:"height .4s ease",position:"relative"}}>
                    {isToday&&v!=null&&<div style={{position:"absolute",top:-3,left:"50%",transform:"translateX(-50%)",
                      width:6,height:6,borderRadius:"50%",background:col,boxShadow:`0 0 8px ${col}`}}/>}
                  </div>
                  <span style={{fontSize:8,color:isToday?C.neon:C.muted,fontWeight:isToday?700:400,
                    fontFamily:"'Syne',sans-serif",letterSpacing:".05em"}}>{days[i]}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Mood Distribution */}
        <GlassCard delay={.15} style={{padding:"14px 16px"}} onClick={undefined}>
          <p style={{fontSize:10,color:C.sub,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:12}}>Mood Distribution</p>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {moodDist.map((m,i)=>{
              const pct = Math.round((m.count/total)*100);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:11,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",width:34}}>{m.label}</span>
                  <div style={{flex:1,height:7,borderRadius:4,background:C.border,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",borderRadius:4,
                      background:`linear-gradient(90deg,${m.c}CC,${m.c}88)`,
                      animation:`fadeIn .8s ${i*.08}s both`}}/>
                  </div>
                  <span style={{fontSize:10,color:m.c,fontWeight:700,fontFamily:"'Syne',sans-serif",width:28,textAlign:"right"}}>{m.count}x</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Top Themes */}
        <GlassCard delay={.2} style={{padding:"14px 16px"}} onClick={undefined}>
          <p style={{fontSize:10,color:C.sub,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:12}}>Top Themes</p>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {topTags.map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",color:C.sub,flex:1}}>{t.tag}</span>
                <div style={{width:80,height:5,borderRadius:3,background:C.border,overflow:"hidden"}}>
                  <div style={{width:`${t.pct}%`,height:"100%",background:t.color,borderRadius:3,
                    animation:`fadeIn .6s ${.2+i*.07}s both`}}/>
                </div>
                <span style={{fontSize:10,color:t.color,fontWeight:700,fontFamily:"'Syne',sans-serif",width:16,textAlign:"right"}}>{t.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Summary */}
        <GlassCard delay={.25} style={{
          padding:"16px",
          background:`linear-gradient(135deg,${C.a1}12,${C.a2}08)`,
          border:`1px solid ${C.neon}25`}} onClick={undefined}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:28,height:28,borderRadius:10,background:`${C.neon}22`,
              border:`1px solid ${C.neon}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🤖</div>
            <span style={{fontSize:10,fontWeight:700,color:C.neon,letterSpacing:".1em",
              fontFamily:"'Syne',sans-serif",textTransform:"uppercase"}}>AI Weekly Summary</span>
          </div>
          <p style={{fontSize:13,color:C.text,lineHeight:1.75,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            This week shows a <span style={{color:C.lime,fontWeight:600}}>positive upward trend</span> — your mood improved from Monday's low after exercise on Wednesday. Work stress is your dominant theme ({">"}70% of entries), with stress and joy appearing as a correlated pair. Your best days align with morning routines.
          </p>
          <div style={{marginTop:12,padding:"10px 12px",borderRadius:12,
            background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`}}>
            <p style={{fontSize:11,color:C.amber,fontWeight:700,fontFamily:"'Syne',sans-serif",marginBottom:4}}>
              💡 Recommendation
            </p>
            <p style={{fontSize:12,color:C.sub,lineHeight:1.65,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Schedule 20-min buffer before work calls. Your post-stress entries suggest you need decompression time that you're not currently building in.
            </p>
          </div>
        </GlassCard>

        {/* Emotional Radar */}
        <GlassCard delay={.3} style={{padding:"14px 16px"}} onClick={undefined}>
          <p style={{fontSize:10,color:C.sub,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:12}}>Emotional Landscape</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              {label:"Resilience",val:74,c:C.cyan},
              {label:"Stress load",val:62,c:C.rose},
              {label:"Social health",val:48,c:C.neon},
              {label:"Mindfulness",val:81,c:C.lime},
            ].map((e,i)=>(
              <div key={i} style={{flex:"0 0 calc(50% - 4px)",background:"rgba(255,255,255,.02)",
                border:`1px solid ${C.border}`,borderRadius:14,padding:"11px 13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:11,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{e.label}</span>
                  <span style={{fontSize:13,fontWeight:800,color:e.c,fontFamily:"'Syne',sans-serif"}}>{e.val}%</span>
                </div>
                <div style={{height:4,borderRadius:2,background:C.border}}>
                  <div style={{width:`${e.val}%`,height:"100%",borderRadius:2,
                    background:`linear-gradient(90deg,${e.c}99,${e.c})`,
                    animation:`fadeIn .7s ${i*.1}s both`}}/>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// ─── JOURNAL SCREEN ───────────────────────────────────────────────────────────
const JournalScreen = () => {
  type JournalEntry = typeof JOURNAL_ENTRIES[number];
  const [view,setView] = useState<"list"|"write"|"detail">("list");
  const [selected,setSelected] = useState<JournalEntry|null>(null);
  const [entries,setEntries] = useState<JournalEntry[]>(JOURNAL_ENTRIES);
  const [text,setText] = useState("");
  const [moodIdx,setMoodIdx] = useState<number|null>(null);
  const [selTags,setSelTags] = useState<string[]>([]);
  const [saving,setSaving] = useState(false);
  const [saved,setSaved] = useState(false);
  const [filter,setFilter] = useState<string>("all");

  const filtered = filter==="all" ? entries : entries.filter(e=>MOOD[e.mood]?.l.toLowerCase()===filter);

  const handleSave = async () => {
    if(!text.trim()&&moodIdx===null)return;
    setSaving(true);
    await new Promise(r=>setTimeout(r,900));
    const newEntry: JournalEntry = {id:Date.now(),mood:moodIdx??2,text,tags:selTags,date:"Just now",
      insight:"Your entry has been saved. AI insight will appear after analysis."};
    setEntries(e=>[newEntry,...e]);
    setSaving(false); setSaved(true);
    setTimeout(()=>{setView("list");setText("");setMoodIdx(null);setSelTags([]);setSaved(false);},1400);
  };

  if(view==="detail"&&selected) return(
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{padding:"16px 20px 8px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setView("list");setSelected(null);}} style={{background:`${C.lift}`,
          border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 11px",color:C.sub,fontSize:12,
          fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600}}>← Back</button>
        <span style={{fontSize:11,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{selected.date}</span>
      </div>
      <div style={{padding:"0 20px 28px",display:"flex",flexDirection:"column",gap:14,animation:"fadeUp .4s both"}}>
        <GlassCard style={{padding:"16px"}} onClick={undefined}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <MoodDot mood={selected.mood} size={44}/>
            <span style={{fontSize:12,color:MOOD[selected.mood]?.c,fontWeight:700,
              fontFamily:"'Syne',sans-serif"}}>{MOOD[selected.mood]?.l}</span>
          </div>
          <p style={{fontSize:14,color:C.text,lineHeight:1.85,fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:12}}>{selected.text}</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {selected.tags.map((t: string)=><Tag key={t} label={t}/>) }
          </div>
        </GlassCard>
        <GlassCard style={{padding:"16px",background:`linear-gradient(135deg,${C.a1}14,${C.a4}08)`,border:`1px solid ${C.neon}22`}} onClick={undefined}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:16}}>🤖</span>
            <span style={{fontSize:10,fontWeight:700,color:C.neon,letterSpacing:".1em",fontFamily:"'Syne',sans-serif"}}>AI INSIGHT</span>
          </div>
          <p style={{fontSize:13,color:C.sub,lineHeight:1.75,fontStyle:"italic",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>"{selected.insight}"</p>
        </GlassCard>
      </div>
    </div>
  );

  if(view==="write") return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{padding:"16px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <button onClick={()=>setView("list")} style={{background:C.lift,border:`1px solid ${C.border}`,
          borderRadius:10,padding:"7px 11px",color:C.sub,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 11px",borderRadius:20,
          background:`${C.neon}14`,border:`1px solid ${C.neon}30`}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.lime,animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:9,color:C.neon,fontFamily:"'Syne',sans-serif",fontWeight:700,letterSpacing:".08em"}}>AI INSIGHTS ON</span>
        </div>
      </div>
      <div style={{padding:"0 20px 24px",flex:1,display:"flex",flexDirection:"column",gap:13}}>
        <GlassCard delay={0} style={{padding:"14px"}} onClick={undefined}>
          <p style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:10}}>How are you feeling?</p>
          <div style={{display:"flex",gap:6}}>
            {MOOD.map((m,i)=>(
              <button key={i} onClick={()=>setMoodIdx(i)} style={{
                flex:1,padding:"10px 0",borderRadius:12,
                border:`2px solid ${moodIdx===i?m.c:"transparent"}`,
                background:moodIdx===i?`${m.c}18`:`${C.surface}88`,
                fontSize:20,cursor:"pointer",transition:"all .25s",
                transform:moodIdx===i?"scale(1.12) translateY(-3px)":"scale(1)",
                boxShadow:moodIdx===i?`0 6px 20px ${m.c}44`:"none"}}>
                {m.e}
              </button>
            ))}
          </div>
        </GlassCard>
        <div style={{position:"relative",flex:1,minHeight:160}}>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="What's on your mind today? Write freely..."
            style={{width:"100%",height:"100%",minHeight:160,
              background:`${C.lift}CC`,border:`1.5px solid ${text.length>0?C.neon+"44":C.border}`,
              borderRadius:16,padding:"13px 13px 40px",color:C.text,fontSize:14,
              fontFamily:"'Plus Jakarta Sans',sans-serif",resize:"none",outline:"none",
              lineHeight:1.8,boxSizing:"border-box",transition:"border-color .3s"}}/>
          <div style={{position:"absolute",bottom:10,left:13,right:13,
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{text.length} chars</span>
            <span style={{fontSize:16,opacity:.5}}>🎤</span>
          </div>
        </div>
        <GlassCard delay={.1} style={{padding:"12px 14px"}} onClick={undefined}>
          <p style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:8}}>Tags</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {TAGS.map(t=>(
              <button key={t} onClick={()=>setSelTags((s:string[])=>s.includes(t)?s.filter(x=>x!==t):[...s,t])} style={{
                padding:"5px 10px",borderRadius:20,fontSize:11,cursor:"pointer",transition:"all .2s",
                background:selTags.includes(t)?`${C.neon}20`:"transparent",
                border:`1px solid ${selTags.includes(t)?C.neon:C.border}`,
                color:selTags.includes(t)?C.neon:C.sub,
                fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:selTags.includes(t)?600:400}}>
                {t}
              </button>
            ))}
          </div>
        </GlassCard>
        {saved?(
          <div style={{padding:"14px",borderRadius:14,background:`${C.cyan}14`,
            border:`1px solid ${C.cyan}33`,textAlign:"center",animation:"fadeUp .3s both"}}>
            <span style={{fontSize:14,color:C.cyan,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>✓ Saved & analyzed</span>
          </div>
        ):(
          <button onClick={handleSave} disabled={saving||(!text.trim()&&moodIdx===null)} style={{
            padding:"14px",borderRadius:16,
            background:(!text.trim()&&moodIdx===null)?C.muted+"22":`linear-gradient(135deg,${C.a1},${C.a1}CC)`,
            border:`1px solid ${(!text.trim()&&moodIdx===null)?C.border:C.neon+"44"}`,
            color:(!text.trim()&&moodIdx===null)?C.muted:C.text,fontSize:14,fontWeight:700,
            fontFamily:"'Syne',sans-serif",cursor:(!text.trim()&&moodIdx===null)||saving?"default":"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:(!text.trim()&&moodIdx===null)?"none":`0 8px 28px ${C.a1}44`}}>
            {saving?<><Spinner size={16}/> Saving...</>:"Save & Get AI Insights ✦"}
          </button>
        )}
      </div>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{padding:"16px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:C.text,letterSpacing:"-.02em"}}>Journal ✦</h2>
        <button onClick={()=>setView("write")} style={{
          padding:"8px 14px",borderRadius:12,
          background:`linear-gradient(135deg,${C.a1},${C.a1}CC)`,
          border:`1px solid ${C.neon}44`,
          color:C.text,fontSize:12,fontWeight:700,fontFamily:"'Syne',sans-serif",
          boxShadow:`0 4px 16px ${C.a1}44`}}>
          + New Entry
        </button>
      </div>
      <div style={{padding:"0 20px 8px",display:"flex",gap:5,overflowX:"auto"}}>
        {[{v:"all",l:"All"},{v:"great",l:"Great"},{v:"good",l:"Good"},{v:"okay",l:"Okay"},{v:"meh",l:"Meh"},{v:"low",l:"Low"}].map(f=>(
          <Pill key={f.v} active={filter===f.v} onClick={()=>setFilter(f.v)} size="sm"
            color={f.v==="all"?C.neon:MOOD.find(m=>m.l.toLowerCase()===f.v)?.c||C.neon}>{f.l}</Pill>
        ))}
      </div>
      <div style={{padding:"8px 20px 24px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map((e,i)=>(
          <GlassCard key={e.id} delay={i*.06} onClick={()=>{setSelected(e);setView("detail");}} style={{padding:"14px 15px"}}>
            <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
              <MoodDot mood={e.mood}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,color:MOOD[e.mood]?.c,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{MOOD[e.mood]?.l}</span>
                  <span style={{fontSize:10,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{e.date}</span>
                </div>
                <p style={{fontSize:12,color:C.sub,lineHeight:1.6,fontFamily:"'Plus Jakarta Sans',sans-serif",
                  overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",marginBottom:7}}>{e.text}</p>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {e.tags.slice(0,3).map(t=><Tag key={t} label={t} color={C.neon}/>)}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// ─── CHAT WITH JOURNAL ────────────────────────────────────────────────────────
const ChatScreen = () => {
  type ChatMsg = { role: "ai"|"user"; text: string };
  const [msgs,setMsgs] = useState<ChatMsg[]>([
    {role:"ai",text:"Hey 👋 I'm your MindMate AI. I've read through your recent journal entries and I'm here to help you reflect deeper. What would you like to explore today?"},
  ]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement|null>(null);

  const quickPrompts = [
    "What patterns do you see in my mood?",
    "Why do I feel so stressed at work?",
    "Help me reframe my anxious thoughts",
    "What's been going well lately?",
  ];

  const send = useCallback(async(text=input)=>{
    if(!text.trim()||loading)return;
    const userMsg: ChatMsg = {role:"user",text:text.trim()};
    setMsgs((m) => [...m, userMsg]);
    setInput(""); setLoading(true);
    try{
      const res = await fetch("http://localhost:3000/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          messages:[...msgs,userMsg].map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),
        }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, {role:"ai",text:data.content?.[0]?.text||"I'm here with you. Tell me more 💙"}]);
    }catch{
      setMsgs((m) => [...m, {role:"ai",text:"Something got in the way — but I'm still here. What were you saying? 💙"}]);
    }
    setLoading(false);
  },[input,loading,msgs]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Chat header */}
      <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,flexShrink:0,
        display:"flex",alignItems:"center",gap:12}}>
        <div style={{position:"relative"}}>
          <div style={{width:38,height:38,borderRadius:13,
            background:`linear-gradient(135deg,${C.a1},${C.neon}CC)`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,
            boxShadow:`0 0 14px ${C.neon}33`,animation:"float 5s ease-in-out infinite"}}>🤖</div>
          <div style={{position:"absolute",bottom:-1,right:-1,width:9,height:9,borderRadius:"50%",
            background:C.lime,border:`2px solid ${C.deep}`,animation:"pulse 2s infinite"}}/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,fontFamily:"'Syne',sans-serif",color:C.text}}>MindMate AI</div>
          <div style={{fontSize:10,color:C.lime,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600}}>● Online · Has read your journal</div>
        </div>
        <div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:20,
          background:`${C.neon}14`,border:`1px solid ${C.neon}28`}}>
          <span style={{fontSize:9,color:C.neon,fontFamily:"'Syne',sans-serif",fontWeight:700,letterSpacing:".06em"}}>
            {JOURNAL_ENTRIES.length} ENTRIES
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:11}}>
        {msgs.length===1&&(
          <div style={{animation:"fadeUp .5s both"}}>
            <p style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
              fontFamily:"'Syne',sans-serif",marginBottom:8}}>Quick prompts</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {quickPrompts.map((q,i)=>(
                <button key={i} onClick={()=>send(q)} style={{
                  padding:"10px 13px",borderRadius:12,textAlign:"left",fontSize:12,
                  background:`${C.lift}99`,border:`1px solid ${C.border}`,
                  color:C.sub,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",
                  transition:"all .2s",animation:`fadeUp .4s ${i*.07}s both`}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",
            animation:"waveIn .3s both"}}>
            {m.role==="ai"&&(
              <div style={{width:26,height:26,borderRadius:9,background:`${C.neon}22`,
                border:`1px solid ${C.neon}33`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:12,marginRight:7,flexShrink:0,alignSelf:"flex-end"}}>🤖</div>
            )}
            <div style={{maxWidth:"80%",padding:"11px 14px",
              borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
              background:m.role==="user"
                ?`linear-gradient(135deg,${C.a1},${C.a1}CC)`
                :`${C.card}CC`,
              border:m.role==="ai"?`1px solid ${C.border}`:"none",
              fontSize:13,lineHeight:1.7,color:C.text,
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              boxShadow:m.role==="user"?`0 4px 16px ${C.a1}44`:`0 2px 8px rgba(0,0,0,.3)`}}>
              {m.text}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",alignItems:"flex-end",gap:7}}>
            <div style={{width:26,height:26,borderRadius:9,background:`${C.neon}22`,
              border:`1px solid ${C.neon}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
            <div style={{padding:"11px 15px",borderRadius:"16px 16px 16px 4px",
              background:`${C.card}CC`,border:`1px solid ${C.border}`,display:"flex",gap:4,alignItems:"center"}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.neon,
                  animation:`bounce 1.2s ${i*.2}s ease-in-out infinite`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ask about your journal, feelings, patterns..."
            rows={1}
            style={{flex:1,background:`${C.lift}CC`,border:`1.5px solid ${input?C.neon+"44":C.border}`,
              borderRadius:14,padding:"10px 12px",color:C.text,fontSize:13,resize:"none",outline:"none",
              lineHeight:1.5,maxHeight:80,overflow:"auto",fontFamily:"'Plus Jakarta Sans',sans-serif",
              transition:"border-color .3s"}}/>
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{
            width:42,height:42,borderRadius:13,flexShrink:0,
            background:input.trim()?`linear-gradient(135deg,${C.a1},${C.neon})`:`${C.lift}`,
            border:`1px solid ${input.trim()?C.neon+"55":C.border}`,
            color:C.text,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:input.trim()?`0 0 16px ${C.neon}33`:"none",
            transition:"all .2s"}}>↑</button>
        </div>
        <p style={{textAlign:"center",fontSize:9,color:C.muted,marginTop:5,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          AI · Private · Journal-aware
        </p>
      </div>
    </div>
  );
};

// ─── PANIC MODE ────────────────────────────────────────────────────────────────
const PanicScreen = () => {
  const [phase,setPhase] = useState<"idle"|"breathe"|"ground"|"affirm"|"done">("idle");
  const [breatheStep,setBreatheStep] = useState<"in"|"hold"|"out">("in");
  const [breatheCount,setBreatheCount] = useState<number>(0);
  const [groundStep,setGroundStep] = useState<number>(0);
  const [affirmIdx,setAffirmIdx] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  const AFFIRMATIONS = [
    "This feeling is temporary. It will pass.",
    "I am safe right now. My body is doing its job.",
    "I have gotten through hard moments before.",
    "I choose calm. I breathe and return to now.",
  ];

  const GROUND = [
    {n:5,sense:"See",q:"Name 5 things you can see right now"},
    {n:4,sense:"Touch",q:"Name 4 things you can physically feel"},
    {n:3,sense:"Hear",q:"Name 3 sounds you can hear"},
    {n:2,sense:"Smell",q:"Name 2 things you can smell"},
    {n:1,sense:"Taste",q:"Name 1 thing you can taste"},
  ];

  useEffect(()=>{
    if(phase==="breathe"){
      const cycle = async()=>{
        setBreatheStep("in");
        await new Promise(r=>setTimeout(r,4000));
        setBreatheStep("hold");
        await new Promise(r=>setTimeout(r,7000));
        setBreatheStep("out");
        await new Promise(r=>setTimeout(r,8000));
        setBreatheCount(c=>{
          if(c+1>=3){setPhase("ground");return 0;}
          return c+1;
        });
      };
      timerRef.current = setTimeout(cycle,100);
    }
    return()=>{if(timerRef.current) clearTimeout(timerRef.current);};
  },[phase,breatheCount]);

  const breatheScale = breatheStep==="in"?1.55:breatheStep==="hold"?1.55:1;
  const breatheLabel = breatheStep==="in"?"Breathe In":breatheStep==="hold"?"Hold":breatheStep==="out"?"Breathe Out":"";
  const breatheColor = breatheStep==="in"?C.cyan:breatheStep==="hold"?C.neon:C.rose;

  if(phase==="idle") return(
    <div style={{flex:1,overflowY:"auto",padding:"24px 20px",display:"flex",flexDirection:"column"}}>
      <div style={{textAlign:"center",marginBottom:28,animation:"fadeUp .5s both"}}>
        <div style={{width:68,height:68,borderRadius:24,margin:"0 auto 14px",
          background:`${C.rose}18`,border:`1px solid ${C.rose}44`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
          animation:"float 5s ease-in-out infinite"}}>🆘</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:6}}>Panic Mode</h2>
        <p style={{fontSize:13,color:C.sub,lineHeight:1.7,fontFamily:"'Plus Jakarta Sans',sans-serif",maxWidth:260,margin:"0 auto"}}>
          You're safe. We'll guide you through a 3-step reset using breathing, grounding, and affirmations.
        </p>
      </div>

      <button onClick={()=>setPhase("breathe")} style={{
        padding:"18px",borderRadius:18,textAlign:"center",marginBottom:14,
        background:`linear-gradient(135deg,${C.rose}22,${C.rose}0A)`,
        border:`1.5px solid ${C.rose}55`,cursor:"pointer",
        animation:"panicPulse 2.5s ease-in-out infinite"}}>
        <div style={{fontSize:24,marginBottom:6}}>🌬️</div>
        <div style={{fontSize:15,fontWeight:800,fontFamily:"'Syne',sans-serif",color:C.rose,marginBottom:4}}>Start 4-7-8 Breathing</div>
        <div style={{fontSize:12,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>3 cycles · ~3 minutes · Activates calm response</div>
      </button>

      <div style={{display:"flex",flexDirection:"column",gap:8,animation:"fadeUp .5s .15s both"}}>
        {[
          {icon:"🧘",title:"5-4-3-2-1 Grounding",sub:"Anchor to the present moment",color:C.cyan},
          {icon:"💬",title:"Crisis Line",sub:"Talk to a real human · 24/7 free",color:C.amber},
          {icon:"🤖",title:"Chat with MindMate AI",sub:"I'm here. Tell me what's happening.",color:C.neon},
        ].map((a,i)=>(
          <GlassCard key={i} delay={.2+i*.07} style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}
            onClick={()=>a.title.includes("Grounding")&&setPhase("ground")}>
            <div style={{width:38,height:38,borderRadius:12,background:`${a.color}18`,
              border:`1px solid ${a.color}33`,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:16,flexShrink:0}}>{a.icon}</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",color:a.color}}>{a.title}</div>
              <div style={{fontSize:11,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",marginTop:2}}>{a.sub}</div>
            </div>
            <span style={{marginLeft:"auto",color:C.muted,fontSize:14}}>›</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  if(phase==="breathe") return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:"28px 24px",position:"relative",overflow:"hidden"}}>
      <Orb x={50} y={30} size={300} color={breatheColor} delay={0}/>
      <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
        <p style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",
          fontFamily:"'Syne',sans-serif"}}>Cycle {breatheCount+1} of 3</p>
        <div style={{position:"relative",width:160,height:160,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {[1,1.4,1.8].map((s,i)=>(
            <div key={i} style={{position:"absolute",width:160,height:160,borderRadius:"50%",
              border:`1px solid ${breatheColor}${20-i*5}`,
              transform:`scale(${breatheScale*s})`,
              transition:`transform ${breatheStep==="in"?"4s":breatheStep==="hold"?"0.3s":"8s"} ease-in-out`,
              pointerEvents:"none"}}/>
          ))}
          <div style={{width:96,height:96,borderRadius:"50%",
            background:`radial-gradient(circle,${breatheColor}44,${breatheColor}11)`,
            border:`2px solid ${breatheColor}66`,
            transform:`scale(${breatheScale})`,
            transition:`transform ${breatheStep==="in"?"4s":breatheStep==="hold"?"0.3s":"8s"} ease-in-out`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,
            boxShadow:`0 0 40px ${breatheColor}33`}}>
            {breatheStep==="in"?"☁️":breatheStep==="hold"?"✨":"🌊"}
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",color:breatheColor,
            letterSpacing:"-.02em",animation:"fadeIn .4s both"}}>{breatheLabel}</p>
          <p style={{fontSize:13,color:C.sub,marginTop:5,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {breatheStep==="in"?"Inhale slowly through your nose (4s)":
             breatheStep==="hold"?"Hold gently, stay still (7s)":
             "Exhale fully through your mouth (8s)"}
          </p>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:8,height:8,borderRadius:"50%",
              background:i<breatheCount?breatheColor:`${breatheColor}30`,
              transition:"background .3s"}}/>
          ))}
        </div>
        <button onClick={()=>{setPhase("idle");setBreatheCount(0);}} style={{
          background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,
          padding:"8px 18px",color:C.muted,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          End session
        </button>
      </div>
    </div>
  );

  if(phase==="ground") return(
    <div style={{flex:1,overflowY:"auto",padding:"24px 20px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{textAlign:"center",animation:"fadeUp .4s both"}}>
        <div style={{width:56,height:56,borderRadius:20,margin:"0 auto 12px",
          background:`${C.cyan}18`,border:`1px solid ${C.cyan}33`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🧘</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:4}}>5-4-3-2-1 Grounding</h2>
        <p style={{fontSize:12,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1.6}}>
          Anchor yourself to the present moment
        </p>
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"center"}}>
        {GROUND.map((g,i)=>(
          <div key={i} style={{width:42,height:42,borderRadius:12,
            background:i===groundStep?`${C.cyan}22`:i<groundStep?`${C.lime}18`:`${C.lift}55`,
            border:`1px solid ${i===groundStep?C.cyan:i<groundStep?C.lime:C.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,fontWeight:700,color:i===groundStep?C.cyan:i<groundStep?C.lime:C.muted,
            fontFamily:"'Syne',sans-serif",transition:"all .3s"}}>
            {i<groundStep?"✓":g.n}
          </div>
        ))}
      </div>
      <GlassCard style={{padding:"20px",textAlign:"center",
        background:`linear-gradient(135deg,${C.cyan}12,transparent)`,border:`1px solid ${C.cyan}22`,
        animation:"fadeUp .4s .1s both"}} onClick={undefined}>
        <div style={{fontSize:32,marginBottom:8}}>
          {groundStep===0?"👀":groundStep===1?"🤚":groundStep===2?"👂":groundStep===3?"👃":"👅"}
        </div>
        <p style={{fontSize:11,color:C.cyan,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
          fontFamily:"'Syne',sans-serif",marginBottom:8}}>{GROUND[groundStep]?.sense}</p>
        <p style={{fontSize:15,color:C.text,fontWeight:600,fontFamily:"'Syne',sans-serif",lineHeight:1.5}}>
          {GROUND[groundStep]?.q}
        </p>
      </GlassCard>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>{if(groundStep>0)setGroundStep(s=>s-1);}} style={{
          flex:1,padding:"12px",borderRadius:13,background:`${C.lift}88`,
          border:`1px solid ${C.border}`,color:C.sub,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>← Back</button>
        <button onClick={()=>{
          if(groundStep<GROUND.length-1) setGroundStep(s=>s+1);
          else setPhase("affirm");
        }} style={{
          flex:2,padding:"12px",borderRadius:13,
          background:`linear-gradient(135deg,${C.a2}CC,${C.cyan}88)`,
          border:`1px solid ${C.cyan}44`,color:C.text,fontSize:13,
          fontWeight:700,fontFamily:"'Syne',sans-serif"}}>
          {groundStep<GROUND.length-1?"I named them →":"Done! Continue →"}
        </button>
      </div>
      <button onClick={()=>setPhase("idle")} style={{background:"none",border:"none",
        color:C.muted,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"4px 0"}}>
        ← Back to Panic Mode
      </button>
    </div>
  );

  if(phase==="affirm") return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:"28px 24px",gap:20}}>
      <Orb x={50} y={40} size={280} color={C.neon} delay={0}/>
      <div style={{position:"relative",zIndex:2,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
        <div style={{fontSize:36,animation:"float 4s ease-in-out infinite"}}>💜</div>
        <p style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",
          fontFamily:"'Syne',sans-serif"}}>{affirmIdx+1} of {AFFIRMATIONS.length}</p>
        <GlassCard style={{padding:"22px 20px",textAlign:"center",border:`1px solid ${C.neon}25`,
          background:`linear-gradient(135deg,${C.a1}12,transparent)`}} onClick={undefined}>
          <p style={{fontSize:17,color:C.text,lineHeight:1.8,fontFamily:"'Syne',sans-serif",fontWeight:600,
            letterSpacing:"-.01em",animation:"fadeIn .5s both"}}>
            "{AFFIRMATIONS[affirmIdx]}"
          </p>
        </GlassCard>
        <div style={{display:"flex",gap:8}}>
          {AFFIRMATIONS.map((_,i)=>(
            <div key={i} style={{width:i===affirmIdx?18:7,height:7,borderRadius:4,
              background:i===affirmIdx?C.neon:`${C.neon}30`,transition:"all .3s"}}/>
          ))}
        </div>
        {affirmIdx<AFFIRMATIONS.length-1?(
          <button onClick={()=>setAffirmIdx(i=>i+1)} style={{
            padding:"13px 28px",borderRadius:14,
            background:`linear-gradient(135deg,${C.a1},${C.a1}CC)`,
            border:`1px solid ${C.neon}44`,color:C.text,fontSize:13,fontWeight:700,
            fontFamily:"'Syne',sans-serif",boxShadow:`0 6px 20px ${C.a1}44`}}>
            Next affirmation →
          </button>
        ):(
          <button onClick={()=>setPhase("idle")} style={{
            padding:"13px 28px",borderRadius:14,
            background:`linear-gradient(135deg,${C.cyan}AA,${C.lime}77)`,
            border:`1px solid ${C.cyan}44`,color:C.deep,fontSize:13,fontWeight:700,
            fontFamily:"'Syne',sans-serif",boxShadow:`0 6px 20px ${C.cyan}44`}}>
            ✓ I feel better now
          </button>
        )}
      </div>
    </div>
  );
};

// ─── COMMUNITY PLUGINS ─────────────────────────────────────────────────────────
const PluginsScreen = () => {
  type Plugin = typeof PLUGINS[number];
  const [plugins,setPlugins] = useState<Plugin[]>(PLUGINS);
  const [cat,setCat] = useState<string>("All");
  const [search,setSearch] = useState<string>("");
  const [detail,setDetail] = useState<Plugin|null>(null);

  const cats = ["All","Calm","Therapy","Habits","Sleep","Growth"];
  const toggle = (id: string) => setPlugins((ps: Plugin[])=>ps.map(p=>p.id===id?{...p,active:!p.active}:p));

  const filtered = plugins.filter(p=>{
    const matchCat = cat==="All"||p.cat===cat;
    const matchSearch = !search.trim()||p.name.toLowerCase().includes(search.toLowerCase())||p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  const active = plugins.filter(p=>p.active);

  if(detail) return(
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{padding:"16px 20px 10px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setDetail(null)} style={{background:C.lift,border:`1px solid ${C.border}`,
          borderRadius:10,padding:"7px 11px",color:C.sub,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600}}>← Plugins</button>
      </div>
      <div style={{padding:"0 20px 28px",animation:"fadeUp .4s both"}}>
        <GlassCard style={{padding:"20px",marginBottom:14}} onClick={undefined}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:14}}>
            <div style={{width:56,height:56,borderRadius:20,background:`${detail.color}18`,
              border:`1px solid ${detail.color}33`,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:22,flexShrink:0}}>{detail.icon}</div>
            <div style={{flex:1}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:C.text,marginBottom:3}}>{detail.name}</h3>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <Tag label={detail.cat} color={detail.color}/>
                <span style={{fontSize:10,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{detail.author}</span>
              </div>
            </div>
          </div>
          <p style={{fontSize:13,color:C.sub,lineHeight:1.75,fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:14}}>
            {detail.desc} Scientifically designed to help you build consistent mental wellness habits through guided interactions.
          </p>
          <div style={{display:"flex",gap:10,padding:"11px 14px",borderRadius:12,
            background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,marginBottom:14}}>
            {[{l:"Installs",v:detail.installs},{l:"Rating",v:"4.8 ★"},{l:"Updated",v:"2 days ago"}].map((s,i)=>(
              <div key={i} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,fontFamily:"'Syne',sans-serif",color:detail.color}}>{s.v}</div>
                <div style={{fontSize:9,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif",marginTop:2,letterSpacing:".06em",textTransform:"uppercase"}}>{s.l}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>{toggle(detail.id);setDetail({...detail,active:!detail.active});}} style={{
            width:"100%",padding:"13px",borderRadius:14,fontSize:14,fontWeight:700,
            fontFamily:"'Syne',sans-serif",cursor:"pointer",transition:"all .2s",
            background:detail.active?`${C.rose}18`:`linear-gradient(135deg,${detail.color}CC,${detail.color}88)`,
            border:`1px solid ${detail.active?C.rose+"55":detail.color+"44"}`,
            color:detail.active?C.rose:C.deep,
            boxShadow:detail.active?"none":`0 6px 20px ${detail.color}44`}}>
            {detail.active?"Remove Plugin ✕":"Install Plugin ✦"}
          </button>
        </GlassCard>
        <GlassCard style={{padding:"16px"}}>
          <p style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:11}}>What you'll get</p>
          {[
            "Daily prompts tailored to your journal history",
            "AI-powered progress tracking & insights",
            "Syncs with your mood data automatically",
            "Notification reminders you control",
          ].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:10}}>
              <div style={{width:18,height:18,borderRadius:6,background:`${detail.color}22`,
                border:`1px solid ${detail.color}44`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:10,flexShrink:0,marginTop:1}}>✓</div>
              <span style={{fontSize:12,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1.6}}>{f}</span>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{padding:"16px 20px 10px"}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:C.text,
          letterSpacing:"-.02em",marginBottom:3}}>Plugins ⬡</h2>
        <p style={{fontSize:11,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:12}}>
          Extend MindMate with community wellness tools
        </p>
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:.4}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search plugins..."
            style={{width:"100%",padding:"10px 13px 10px 32px",borderRadius:12,
              background:`${C.lift}CC`,border:`1px solid ${C.border}`,
              color:C.text,fontSize:13,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
          {cats.map(c=>(
            <Pill key={c} active={cat===c} onClick={()=>setCat(c)}>{c}</Pill>
          ))}
        </div>
      </div>

      {active.length>0&&cat==="All"&&!search&&(
        <div style={{padding:"0 20px 10px"}}>
          <p style={{fontSize:10,color:C.lime,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Syne',sans-serif",marginBottom:7}}>Active ({active.length})</p>
          <div style={{display:"flex",gap:7,overflowX:"auto"}}>
            {active.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 12px",
                borderRadius:20,background:`${p.color}18`,border:`1px solid ${p.color}33`,
                flexShrink:0,cursor:"pointer"}} onClick={()=>setDetail(p)}>
                <span style={{fontSize:14}}>{p.icon}</span>
                <span style={{fontSize:11,color:p.color,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{padding:"4px 20px 24px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map((p,i)=>(
          <GlassCard key={p.id} delay={i*.05} style={{padding:"14px 15px",
            border:p.active?`1px solid ${p.color}33`:undefined}} onClick={()=>setDetail(p)}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:15,background:`${p.color}18`,
                border:`1px solid ${p.color}33`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",color:C.text}}>{p.name}</span>
                  {p.active&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:8,
                    background:`${p.color}22`,color:p.color,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:".06em"}}>ON</span>}
                </div>
                <p style={{fontSize:11,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1.5,
                  overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.desc}</p>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                  <Tag label={p.cat} color={p.color}/>
                  <span style={{fontSize:10,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{p.installs} installs</span>
                </div>
              </div>
              <button onClick={e=>{e.stopPropagation();toggle(p.id);}} style={{
                width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",
                transition:"background .25s",flexShrink:0,position:"relative",
                background:p.active?C.neon:C.muted+"40"}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:C.text,
                  position:"absolute",top:3,transition:"left .25s",
                  left:p.active?19:3}}/>
              </button>
            </div>
          </GlassCard>
        ))}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:36,marginBottom:12,opacity:.4}}>🔍</div>
            <p style={{fontSize:13,color:C.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>No plugins found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {id:"insights",icon:"◈",label:"Insights"},
  {id:"journal",icon:"✦",label:"Journal"},
  {id:"chat",icon:"◎",label:"Chat"},
  {id:"panic",icon:"🆘",label:"Panic"},
  {id:"plugins",icon:"⬡",label:"Plugins"},
];

export default function MindMateFrontend(){
  const [screen,setScreen] = useState("insights");

  const renderScreen = ()=>{
    switch(screen){
      case "insights": return <InsightDashboard/>;
      case "journal":  return <JournalScreen/>;
      case "chat":     return <ChatScreen/>;
      case "panic":    return <PanicScreen/>;
      case "plugins":  return <PluginsScreen/>;
      default:         return <InsightDashboard/>;
    }
  };

  return(
    <div style={{minHeight:"100vh",background:C.void,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"24px 16px 32px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{CSS}</style>

      {/* Top label */}
      <div style={{marginBottom:18,display:"flex",alignItems:"center",gap:8,padding:"6px 16px",
        borderRadius:50,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",
        animation:"fadeUp .5s both"}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:C.neon,
          boxShadow:`0 0 8px ${C.neon}`,animation:"pulse 1.5s infinite"}}/>
        <span style={{fontSize:9,color:C.neon,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:".12em"}}>
          MINDMATE · FRONTEND LAYER · MOBILE + WEB
        </span>
      </div>

      {/* Phone frame */}
      <div style={{
        width:390,height:844,background:C.deep,borderRadius:52,
        display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",
        boxShadow:`0 0 0 1px rgba(255,255,255,.06),0 0 0 8px ${C.surface},0 0 0 9px rgba(255,255,255,.03),0 40px 100px rgba(0,0,0,.95),0 0 80px ${C.neon}0A`,
        animation:"fadeUp .55s .1s both",
      }}>
        {/* Notch */}
        <div style={{display:"flex",justifyContent:"center",paddingTop:11,background:C.deep,flexShrink:0,zIndex:10}}>
          <div style={{width:118,height:32,borderRadius:16,background:"#000",
            display:"flex",alignItems:"center",justifyContent:"center",gap:7,
            boxShadow:"inset 0 0 0 1px rgba(255,255,255,.04)"}}>
            <div style={{width:9,height:9,borderRadius:5,background:"#111"}}/>
            <div style={{width:56,height:17,borderRadius:9,background:"#0A0A0A"}}/>
          </div>
        </div>

        {/* Status bar */}
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 24px 4px",
          fontSize:11,color:C.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,flexShrink:0}}>
          <span>9:41</span>
          <span style={{display:"flex",gap:4,alignItems:"center",fontSize:10}}>●●● 🔋</span>
        </div>

        {/* Screen area */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",
          background:`linear-gradient(180deg,${C.surface} 0%,${C.void} 100%)`}}>
          {/* Ambient background orbs */}
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
            <Orb x={80} y={15} size={220} color={C.neon} delay={0}/>
            <Orb x={10} y={60} size={180} color={C.cyan} delay={2}/>
            <Orb x={70} y={85} size={160} color={C.rose} delay={4}/>
          </div>
          <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {renderScreen()}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{background:`${C.void}F8`,borderTop:`1px solid ${C.border}`,
          padding:"6px 4px 18px",flexShrink:0,display:"flex",backdropFilter:"blur(20px)"}}>
          {NAV_ITEMS.map(item=>{
            const on = screen===item.id;
            const isPanic = item.id==="panic";
            if(isPanic) return(
              <button key={item.id} onClick={()=>setScreen(item.id)} style={{
                flex:1,background:"none",border:"none",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0"}}>
                <div style={{width:38,height:38,borderRadius:13,
                  background:on?`${C.rose}33`:`${C.rose}18`,border:`1.5px solid ${C.rose}${on?"88":"44"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
                  boxShadow:on?`0 0 16px ${C.rose}55`:"none",transition:"all .2s",
                  animation:on?"panicPulse 2s ease-in-out infinite":"none"}}>
                  {item.icon}
                </div>
                <span style={{fontSize:8,fontFamily:"'Syne',sans-serif",fontWeight:700,
                  color:on?C.rose:C.muted,letterSpacing:".05em",textTransform:"uppercase"}}>{item.label}</span>
              </button>
            );
            return(
              <button key={item.id} onClick={()=>setScreen(item.id)} style={{
                flex:1,background:"none",border:"none",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0",position:"relative"}}>
                {on&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",
                  width:24,height:2,borderRadius:1,background:C.neon,boxShadow:`0 0 8px ${C.neon}`}}/>}
                <div style={{width:38,height:38,borderRadius:13,
                  background:on?`${C.a1}44`:"transparent",
                  border:on?`1px solid ${C.neon}33`:"1px solid transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
                  transition:"all .3s",boxShadow:on?`0 0 14px ${C.neon}22`:"none",
                  color:on?C.neon:C.muted,fontFamily:"'Syne',sans-serif",fontWeight:800}}>
                  {item.icon}
                </div>
                <span style={{fontSize:8,fontFamily:"'Syne',sans-serif",fontWeight:700,
                  color:on?C.neon:C.muted,letterSpacing:".05em",textTransform:"uppercase",transition:"color .3s"}}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section nav pills below phone */}
      <div style={{marginTop:20,display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",
        maxWidth:480,animation:"fadeUp .55s .25s both"}}>
        {NAV_ITEMS.map(s=>(
          <button key={s.id} onClick={()=>setScreen(s.id)} style={{
            padding:"5px 13px",borderRadius:50,
            background:screen===s.id?"rgba(167,139,250,.18)":"rgba(255,255,255,.02)",
            border:`1px solid ${screen===s.id?"rgba(167,139,250,.4)":"rgba(255,255,255,.05)"}`,
            color:screen===s.id?C.neon:"rgba(255,255,255,.25)",
            fontSize:10,fontWeight:screen===s.id?700:400,cursor:"pointer",
            fontFamily:"'Syne',sans-serif",transition:"all .2s",letterSpacing:".04em",
            boxShadow:screen===s.id?`0 0 10px ${C.neon}22`:"none"}}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Palette */}
      <div style={{marginTop:12,display:"flex",gap:5,animation:"fadeUp .55s .35s both"}}>
        {[C.neon,C.cyan,C.rose,C.amber,C.lime,C.pink,C.blue].map((col,i)=>(
          <div key={i} style={{width:12,height:12,borderRadius:3,background:col,
            boxShadow:`0 0 6px ${col}77`}}/>
        ))}
      </div>
    </div>
  );
}