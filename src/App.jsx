import { useState, useEffect, useRef } from "react";

// ── Storage helpers ──────────────────────────────────────────────
const STORAGE_KEYS = { diary: "selena_diary", used: "selena_used" };
const load = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── AI call ──────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ── Categories ───────────────────────────────────────────────────
const CATEGORIES = ["Dating","Hinge","First Dates","Dating Men","Dating in Korea","Situationships","Red Flags","Green Flags","Single Life","Romance"];

// ── Fonts ────────────────────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap";

export default function App() {
  const [tab, setTab] = useState("diary");
  const [entries, setEntries] = useState(() => load(STORAGE_KEYS.diary));
  const [usedIdeas, setUsedIdeas] = useState(() => load(STORAGE_KEYS.used));
  const [msg, setMsg] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [hooks, setHooks] = useState(null);
  const [loadingHooks, setLoadingHooks] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { save(STORAGE_KEYS.diary, entries); }, [entries]);
  useEffect(() => { save(STORAGE_KEYS.used, usedIdeas); }, [usedIdeas]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [entries, tab]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    const entry = { id: Date.now(), text: msg.trim(), ts: new Date().toISOString() };
    setEntries(prev => [...prev, entry]);
    setMsg("");
  };

  const generateIdeas = async () => {
    if (!selectedCat) return;
    setLoadingIdeas(true);
    setIdeas([]);
    const diaryText = entries.map(e => `- ${e.text}`).join("\n");
    const usedTexts = usedIdeas.map(u => u.title).join(", ");
    const prompt = `You are a TikTok content strategist for a Korean woman who posts funny, relatable short-form videos (8 seconds to 3 minutes) about dating life — dating in Korea, using Hinge, first dates, dating men, situationships, etc.

Here are her personal diary/life entries:
${diaryText || "(no entries yet)"}

Already used ideas (do NOT suggest these): ${usedTexts || "none"}

Category selected: "${selectedCat}"

Find the most relevant diary entries for this category and generate exactly 5 content ideas ranked by viral potential. Each idea must be grounded in her real experiences from the diary.

Respond ONLY with a valid JSON array, no markdown, no explanation:
[
  {
    "title": "short punchy idea title",
    "diaryRef": "the specific diary entry this is based on (quote it briefly)",
    "angle": "the comedic or emotional angle",
    "viralScore": 85,
    "format": "e.g. POV, storytime, reaction, rating"
  }
]`;
    try {
      const raw = await callClaude(prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setIdeas(parsed);
    } catch { setIdeas([]); }
    setLoadingIdeas(false);
  };

  const markUsed = (idea) => {
    setUsedIdeas(prev => [...prev, { ...idea, usedAt: new Date().toISOString() }]);
    setIdeas(prev => prev.filter(i => i.title !== idea.title));
    setSelectedIdeas(prev => prev.filter(i => i.title !== idea.title));
  };

  const toggleSelect = (idea) => {
    setSelectedIdeas(prev =>
      prev.find(i => i.title === idea.title)
        ? prev.filter(i => i.title !== idea.title)
        : [...prev, idea]
    );
  };

  const generateHooks = async () => {
    if (!selectedIdeas.length) return;
    setLoadingHooks(true);
    setHooks(null);
    setTab("hooks");
    const ideasText = selectedIdeas.map(i => `- "${i.title}": ${i.angle}`).join("\n");
    const prompt = `You are a viral TikTok hook specialist. Generate hooks for these content ideas for a Korean woman making funny, relatable dating content:

${ideasText}

For each idea, give:
1. Three TEXT hooks (the on-screen caption/title, max 10 words, punchy and scroll-stopping)
2. Two VISUAL hooks (a physical action she can do in the first 2 seconds of the video — e.g. "flip phone onto table", "look up from phone with dead eyes", "dramatically close laptop")

Respond ONLY with valid JSON, no markdown:
[
  {
    "idea": "idea title",
    "textHooks": ["hook1", "hook2", "hook3"],
    "visualHooks": ["visual1", "visual2"]
  }
]`;
    try {
      const raw = await callClaude(prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      setHooks(JSON.parse(clean));
    } catch { setHooks([]); }
    setLoadingHooks(false);
  };

  // ── Styles ────────────────────────────────────────────────────
  const s = {
    app: { minHeight: "100vh", background: "#faf7f4", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" },
    header: { background: "#1a1a1a", padding: "28px 24px 20px", textAlign: "center" },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f5e6d3", letterSpacing: "-0.5px", margin: 0 },
    logoSub: { fontSize: 11, color: "#666", letterSpacing: 4, textTransform: "uppercase", marginTop: 4, fontWeight: 300 },
    tabs: { display: "flex", background: "#1a1a1a", borderTop: "1px solid #2a2a2a" },
    tab: (active) => ({
      flex: 1, padding: "14px 0", border: "none", cursor: "pointer", fontSize: 11,
      letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
      background: active ? "#f5e6d3" : "transparent",
      color: active ? "#1a1a1a" : "#666", fontWeight: active ? 500 : 300,
      transition: "all 0.2s"
    }),
    body: { maxWidth: 560, margin: "0 auto", padding: "0 0 80px" },
  };

  return (
    <>
      <link rel="stylesheet" href={FONT_URL} />
      <div style={s.app}>
        <div style={s.header}>
          <p style={s.logo}>✦ Selena's Content Studio</p>
          <p style={s.logoSub}>your personal tiktok brain</p>
        </div>
        <div style={s.tabs}>
          {[["diary","📱 Diary"],["ideas","💡 Ideas"],["hooks","🎣 Hooks"],["used","✅ Used"]].map(([id,label]) => (
            <button key={id} style={s.tab(tab===id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        <div style={s.body}>

          {/* ── DIARY TAB ── */}
          {tab === "diary" && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
              <div style={{ padding: "16px 20px 8px", borderBottom: "1px solid #ede8e2" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#999", letterSpacing: 1 }}>
                  {entries.length} entries saved · text like you're talking to a friend
                </p>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {entries.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#ccc" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
                    <p style={{ fontSize: 14, fontStyle: "italic" }}>Start typing your daily happenings...<br />Your entries become content gold.</p>
                  </div>
                )}
                {entries.map((e, i) => (
                  <div key={e.id} style={{
                    display: "flex", justifyContent: "flex-end", marginBottom: 12,
                    animation: "fadeIn 0.3s ease"
                  }}>
                    <div style={{
                      background: "#1a1a1a", color: "#f5e6d3", borderRadius: "18px 18px 4px 18px",
                      padding: "12px 16px", maxWidth: "80%", fontSize: 14, lineHeight: 1.5,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                      {e.text}
                      <div style={{ fontSize: 10, color: "#666", marginTop: 6, textAlign: "right" }}>
                        {new Date(e.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #ede8e2", background: "#faf7f4", display: "flex", gap: 10 }}>
                <textarea
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="What happened today? A date, a text, a feeling..."
                  rows={2}
                  style={{
                    flex: 1, padding: "12px 16px", borderRadius: 20, border: "1.5px solid #e0d8cf",
                    background: "#fff", fontSize: 14, resize: "none", fontFamily: "'DM Sans', sans-serif",
                    outline: "none", lineHeight: 1.5, color: "#1a1a1a"
                  }}
                />
                <button onClick={sendMessage} style={{
                  width: 44, height: 44, borderRadius: "50%", background: "#1a1a1a",
                  border: "none", color: "#f5e6d3", fontSize: 18, cursor: "pointer",
                  alignSelf: "flex-end", flexShrink: 0
                }}>↑</button>
              </div>
            </div>
          )}

          {/* ── IDEAS TAB ── */}
          {tab === "ideas" && (
            <div style={{ padding: "24px 20px" }}>
              <p style={{ fontSize: 13, color: "#999", marginBottom: 20, fontStyle: "italic" }}>
                Pick a category → AI finds your best stories from your diary
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setSelectedCat(selectedCat === c ? "" : c)} style={{
                    padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13,
                    border: selectedCat === c ? "2px solid #1a1a1a" : "1.5px solid #e0d8cf",
                    background: selectedCat === c ? "#1a1a1a" : "#fff",
                    color: selectedCat === c ? "#f5e6d3" : "#666",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
                  }}>{c}</button>
                ))}
              </div>

              <button onClick={generateIdeas} disabled={!selectedCat || loadingIdeas} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none", cursor: selectedCat ? "pointer" : "not-allowed",
                background: selectedCat ? "#1a1a1a" : "#e0d8cf", color: selectedCat ? "#f5e6d3" : "#aaa",
                fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
                marginBottom: 24, fontWeight: 500, transition: "all 0.2s"
              }}>
                {loadingIdeas ? "✦ Searching your diary..." : "✦ Find My Best Ideas"}
              </button>

              {selectedIdeas.length > 0 && (
                <button onClick={generateHooks} style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #c9a96e",
                  background: "rgba(201,169,110,0.1)", color: "#9a7a40", fontSize: 13,
                  letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 24, fontWeight: 500, cursor: "pointer"
                }}>
                  🎣 Generate Hooks for {selectedIdeas.length} Selected
                </button>
              )}

              {ideas.map((idea, i) => (
                <div key={i} onClick={() => toggleSelect(idea)} style={{
                  background: selectedIdeas.find(s => s.title === idea.title) ? "#1a1a1a" : "#fff",
                  borderRadius: 16, padding: "20px", marginBottom: 12,
                  border: selectedIdeas.find(s => s.title === idea.title) ? "2px solid #1a1a1a" : "1.5px solid #e0d8cf",
                  cursor: "pointer", transition: "all 0.2s",
                  color: selectedIdeas.find(s => s.title === idea.title) ? "#f5e6d3" : "#1a1a1a"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, flex: 1, marginRight: 12 }}>
                      {idea.title}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <span style={{
                        background: idea.viralScore >= 80 ? "#c9a96e" : "#e0d8cf",
                        color: idea.viralScore >= 80 ? "#fff" : "#999",
                        fontSize: 11, padding: "3px 8px", borderRadius: 10, fontWeight: 500
                      }}>🔥 {idea.viralScore}</span>
                      <button onClick={e => { e.stopPropagation(); markUsed(idea); }} style={{
                        background: "transparent", border: "1px solid currentColor", borderRadius: 8,
                        padding: "3px 8px", fontSize: 10, cursor: "pointer", opacity: 0.6,
                        color: "inherit", fontFamily: "'DM Sans', sans-serif", letterSpacing: 1
                      }}>USED ✓</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8, fontStyle: "italic" }}>
                    From your diary: "{idea.diaryRef}"
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    <span style={{ opacity: 0.5 }}>Angle: </span>{idea.angle}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                    {idea.format}
                  </div>
                </div>
              ))}

              {ideas.length === 0 && !loadingIdeas && (
                <div style={{ textAlign: "center", padding: "40px", color: "#ccc", fontSize: 13, fontStyle: "italic" }}>
                  Select a category and hit generate ✦
                </div>
              )}
            </div>
          )}

          {/* ── HOOKS TAB ── */}
          {tab === "hooks" && (
            <div style={{ padding: "24px 20px" }}>
              {!hooks && !loadingHooks && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#ccc" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎣</div>
                  <p style={{ fontSize: 14, fontStyle: "italic" }}>Select ideas from the Ideas tab<br />then generate hooks here.</p>
                </div>
              )}
              {loadingHooks && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
                  <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite", display: "inline-block" }}>✦</div>
                  <p style={{ fontSize: 14, fontStyle: "italic" }}>Crafting your viral hooks...</p>
                </div>
              )}
              {hooks && hooks.map((h, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 16, border: "1.5px solid #e0d8cf" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>
                    {h.idea}
                  </p>
                  <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#c9a96e", marginBottom: 10, fontWeight: 500 }}>
                    📝 Text Hooks
                  </p>
                  {h.textHooks?.map((hook, j) => (
                    <div key={j} style={{
                      background: "#faf7f4", borderRadius: 10, padding: "12px 14px",
                      marginBottom: 8, fontSize: 14, fontWeight: 500, lineHeight: 1.4,
                      borderLeft: "3px solid #1a1a1a"
                    }}>
                      "{hook}"
                    </div>
                  ))}
                  <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#c9a96e", margin: "16px 0 10px", fontWeight: 500 }}>
                    🎬 Visual Hooks
                  </p>
                  {h.visualHooks?.map((v, j) => (
                    <div key={j} style={{
                      background: "#1a1a1a", color: "#f5e6d3", borderRadius: 10,
                      padding: "12px 14px", marginBottom: 8, fontSize: 13, lineHeight: 1.4
                    }}>
                      {v}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ── USED TAB ── */}
          {tab === "used" && (
            <div style={{ padding: "24px 20px" }}>
              <p style={{ fontSize: 13, color: "#999", marginBottom: 20, fontStyle: "italic" }}>
                {usedIdeas.length} ideas turned into videos ✓
              </p>
              {usedIdeas.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#ccc", fontSize: 13, fontStyle: "italic" }}>
                  Ideas you mark as used will appear here ✦
                </div>
              )}
              {[...usedIdeas].reverse().map((idea, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 10, border: "1.5px solid #e0d8cf", opacity: 0.7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15 }}>{idea.title}</span>
                    <span style={{ fontSize: 11, color: "#999" }}>
                      {new Date(idea.usedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>{idea.format} · {idea.angle}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        textarea:focus { border-color: #1a1a1a !important; }
      `}</style>
    </>
  );
}