import { useState } from "react";

const NICHES = ["Fashion", "Food", "Tech", "Travel", "Fitness", "Comedy", "Finance", "Beauty", "Gaming", "DIY"];
const FORMATS = ["POV:", "Day in my life", "Hot take:", "Things that just make sense", "Story time:", "Rating", "Tutorial", "Trend reaction", "Unboxing", "\"Nobody talks about this but...\""];
const HOOKS = [
  "I tried this for 30 days and...",
  "Why does nobody talk about this?",
  "Stop doing this if you want to...",
  "This changed everything for me.",
  "The truth about...",
  "I can't believe this actually works.",
  "Unpopular opinion:",
  "Wait until the end.",
  "This is your sign to...",
  "Real talk:"
];
const TWISTS = [
  "with a budget under $10",
  "in under 60 seconds",
  "that went completely wrong",
  "but make it aesthetic",
  "from a beginner's perspective",
  "that nobody asked for but needed",
  "using only things from Amazon",
  "that broke the internet",
  "according to TikTok",
  "but I'm brutally honest"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIdea() {
  return {
    niche: getRandom(NICHES),
    format: getRandom(FORMATS),
    hook: getRandom(HOOKS),
    twist: getRandom(TWISTS),
    id: Math.random()
  };
}

export default function App() {
  const [niche, setNiche] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [saved, setSaved] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const newIdeas = Array.from({ length: 3 }, () => {
        const idea = generateIdea();
        if (niche) idea.niche = niche;
        return idea;
      });
      setIdeas(newIdeas);
      setGenerating(false);
    }, 600);
  };

  const handleSave = (idea) => {
    if (!saved.find(s => s.id === idea.id)) {
      setSaved([idea, ...saved]);
    }
  };

  const handleRemove = (id) => setSaved(saved.filter(s => s.id !== id));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Georgia', serif",
      color: "#f0ece0",
      padding: "0 0 60px"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #ff2d55 0%, #ff6b35 50%, #ffcc02 100%)",
        padding: "40px 24px 32px",
        textAlign: "center",
        clipPath: "polygon(0 0, 100% 0, 100% 82%, 0 100%)",
        marginBottom: "8px"
      }}>
        <div style={{ fontSize: 13, letterSpacing: 6, textTransform: "uppercase", color: "rgba(0,0,0,0.6)", fontFamily: "monospace", marginBottom: 8 }}>
          ✦ Content Studio ✦
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 7vw, 52px)",
          fontWeight: 900,
          color: "#0a0a0f",
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: "-1px"
        }}>
          Short-Form<br />Idea Generator
        </h1>
        <p style={{ color: "rgba(0,0,0,0.55)", marginTop: 12, fontSize: 14, fontFamily: "monospace" }}>
          Never run out of content again.
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#16161e", borderRadius: 12, padding: 4 }}>
          {["generate", "saved"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              background: activeTab === tab ? "linear-gradient(135deg,#ff2d55,#ff6b35)" : "transparent",
              color: activeTab === tab ? "#fff" : "#666",
              fontWeight: activeTab === tab ? 700 : 400,
              transition: "all 0.2s"
            }}>
              {tab} {tab === "saved" && saved.length > 0 ? `(${saved.length})` : ""}
            </button>
          ))}
        </div>

        {activeTab === "generate" && (
          <>
            {/* Niche Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#ff6b35", fontFamily: "monospace", marginBottom: 10 }}>
                Pick your niche (optional)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {NICHES.map(n => (
                  <button key={n} onClick={() => setNiche(niche === n ? "" : n)} style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    border: niche === n ? "2px solid #ff2d55" : "1.5px solid #2a2a35",
                    background: niche === n ? "rgba(255,45,85,0.15)" : "#16161e",
                    color: niche === n ? "#ff2d55" : "#888",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "monospace",
                    transition: "all 0.15s",
                    fontWeight: niche === n ? 700 : 400
                  }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={generating} style={{
              width: "100%",
              padding: "18px",
              background: generating ? "#2a2a35" : "linear-gradient(135deg, #ff2d55 0%, #ff6b35 100%)",
              color: generating ? "#555" : "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: generating ? "not-allowed" : "pointer",
              fontFamily: "monospace",
              marginBottom: 28,
              transition: "all 0.2s",
              transform: generating ? "scale(0.98)" : "scale(1)"
            }}>
              {generating ? "✦ Thinking..." : "✦ Generate Ideas"}
            </button>

            {/* Ideas */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ideas.map((idea, i) => (
                <div key={idea.id} style={{
                  background: "#16161e",
                  borderRadius: 16,
                  padding: "22px",
                  border: "1px solid #2a2a35",
                  position: "relative",
                  animation: "fadeUp 0.4s ease both",
                  animationDelay: `${i * 0.1}s`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <span style={{
                      background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
                      color: "#fff",
                      fontSize: 10,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontFamily: "monospace",
                      fontWeight: 700
                    }}>
                      #{idea.niche}
                    </span>
                    <button onClick={() => handleSave(idea)} style={{
                      background: saved.find(s => s.id === idea.id) ? "rgba(255,204,2,0.15)" : "#0a0a0f",
                      border: saved.find(s => s.id === idea.id) ? "1px solid #ffcc02" : "1px solid #2a2a35",
                      color: saved.find(s => s.id === idea.id) ? "#ffcc02" : "#555",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 16,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}>
                      {saved.find(s => s.id === idea.id) ? "★" : "☆"}
                    </button>
                  </div>

                  <div style={{ fontSize: 11, color: "#ff6b35", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>
                    Format
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#f0ece0", marginBottom: 14 }}>
                    {idea.format}
                  </div>

                  <div style={{ fontSize: 11, color: "#ff6b35", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>
                    Hook
                  </div>
                  <div style={{ fontSize: 15, color: "#c8c4b0", marginBottom: 14, fontStyle: "italic" }}>
                    "{idea.hook}"
                  </div>

                  <div style={{
                    background: "#0a0a0f",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#666",
                    fontFamily: "monospace"
                  }}>
                    🎬 Twist: <span style={{ color: "#aaa" }}>{idea.twist}</span>
                  </div>
                </div>
              ))}
            </div>

            {ideas.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#333", fontFamily: "monospace", fontSize: 13 }}>
                ✦ Hit generate to spark your next viral idea ✦
              </div>
            )}
          </>
        )}

        {activeTab === "saved" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {saved.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#333", fontFamily: "monospace", fontSize: 13 }}>
                ✦ No saved ideas yet. Star your favorites! ✦
              </div>
            ) : saved.map(idea => (
              <div key={idea.id} style={{
                background: "#16161e",
                borderRadius: 16,
                padding: "22px",
                border: "1px solid #ffcc0240"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{
                    background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
                    color: "#fff",
                    fontSize: 10,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontFamily: "monospace",
                    fontWeight: 700
                  }}>
                    #{idea.niche}
                  </span>
                  <button onClick={() => handleRemove(idea.id)} style={{
                    background: "transparent",
                    border: "1px solid #2a2a35",
                    color: "#555",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "monospace"
                  }}>
                    remove
                  </button>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#f0ece0", marginBottom: 8 }}>{idea.format}</div>
                <div style={{ fontSize: 15, color: "#c8c4b0", marginBottom: 12, fontStyle: "italic" }}>"{idea.hook}"</div>
                <div style={{ background: "#0a0a0f", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#aaa", fontFamily: "monospace" }}>
                  🎬 {idea.twist}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}