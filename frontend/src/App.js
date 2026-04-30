import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const riskColor = (risk) => {
  const r = (risk || "").toLowerCase();
  if (r.includes("high")) return "#ef4444";
  if (r.includes("medium")) return "#f59e0b";
  return "#10b981";
};

const portalButton = (active) => ({
  flex: 1,
  border: "none",
  borderRadius: 999,
  padding: "12px 16px",
  fontSize: 24,
  fontWeight: 700,
  cursor: "pointer",
  background: active ? "white" : "transparent",
  color: "#0f172a",
  transition: "all 0.2s ease",
});

const LoginView = ({ onLogin }) => {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("patient@medmemory.ai");
  const [password, setPassword] = useState("patient123");
  const [error, setError] = useState("");

  const pickRole = (selected) => {
    setRole(selected);
    if (selected === "doctor") {
      setEmail("doctor@medmemory.ai");
      setPassword("doctor123");
    } else {
      setEmail("patient@medmemory.ai");
      setPassword("patient123");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      onLogin(res.data);
    } catch {
      setError("Invalid login credentials. Please try demo accounts.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "#f3f4f6" }}>
      <div style={{
        background: "radial-gradient(circle at top left, #b833ff 0%, #6b0fd5 35%, #2b0055 70%, #07000f 100%)",
        color: "#f8fafc",
        padding: "60px 70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 30,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", width: 72, height: 72, borderRadius: 18, display: "grid", placeItems: "center", fontSize: 34 }}>∿</div>
          <h1 style={{ margin: 0, fontSize: 54 }}>MediMemory AI</h1>
        </div>
        <div>
          <h2 style={{ fontSize: 78, lineHeight: 1.1, margin: 0 }}>Welcome to the Future of Healthcare</h2>
          <p style={{ marginTop: 18, fontSize: 36, opacity: 0.95 }}>Secure, intelligent, and always accessible medical records.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 22, padding: 26 }}>
            <div style={{ fontSize: 62, fontWeight: 800 }}>10K+</div>
            <div style={{ fontSize: 38 }}>Active Patients</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 22, padding: 26 }}>
            <div style={{ fontSize: 62, fontWeight: 800 }}>500+</div>
            <div style={{ fontSize: 38 }}>Verified Doctors</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#dbe4ef", color: "#0f4a8a", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 26 }}>RK</div>
            <div>
              <h2 style={{ fontSize: 52, margin: 0, color: "#0f172a" }}>Patient Login</h2>
              <p style={{ fontSize: 30, color: "#475569", margin: "4px 0 0" }}>Diabetes + hypertension</p>
            </div>
          </div>
          <p style={{ fontSize: 30, color: "#475569", marginTop: 0 }}>Login to access your healthcare portal</p>

          <div style={{ background: "#e5e7eb", borderRadius: 999, display: "flex", padding: 8, marginTop: 24 }}>
            <button style={portalButton(role === "patient")} onClick={() => pickRole("patient")}>Patient Login</button>
            <button style={portalButton(role === "doctor")} onClick={() => pickRole("doctor")}>Doctor Login</button>
          </div>

          <form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 24 }}>
            <label style={{ fontSize: 34, fontWeight: 600, color: "#0f172a" }}>Email / Mobile Number</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" style={{ border: "none", background: "#e5e7eb", borderRadius: 14, padding: "20px 18px", fontSize: 30 }} />
            <label style={{ fontSize: 34, fontWeight: 600, color: "#0f172a" }}>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" style={{ border: "none", background: "#e5e7eb", borderRadius: 14, padding: "20px 18px", fontSize: 30 }} />
            <button type="submit" style={{
              marginTop: 8,
              border: "none",
              borderRadius: 14,
              padding: "20px 22px",
              fontSize: 34,
              fontWeight: 700,
              color: "white",
              background: "linear-gradient(90deg, #a21caf 0%, #3b0764 60%, #020617 100%)",
              cursor: "pointer",
            }}>
              Login as {role === "doctor" ? "Doctor" : "Patient"}
            </button>
          </form>

          {error && <p style={{ color: "#dc2626", fontSize: 28 }}>{error}</p>}

          <p style={{ marginTop: 12, fontSize: 24, color: "#475569" }}>
            Demo: Doctor `doctor@medmemory.ai / doctor123` | Patient `patient@medmemory.ai / patient123`
          </p>
        </div>
      </div>
    </div>
  );
};

const ListCard = ({ title, items }) => (
  <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, color: "#0f172a" }}>
    <strong>{title}</strong>
    <ul style={{ margin: "8px 0 0 18px" }}>{(items || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_BASE}/analyze`, formData);
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoginView onLogin={setUser} />;

  return (
    <div style={{ fontFamily: "Inter, Arial", background: "#0b1220", minHeight: "100vh", padding: 30, color: "#e2e8f0" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", background: "#111827", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>MedMemory AI — {user.role === "doctor" ? "Doctor Portal" : "Patient Portal"}</h1>
            <p style={{ color: "#94a3b8" }}>Welcome, {user.name}</p>
          </div>
          <button onClick={() => setUser(null)} style={{ background: "#374151", color: "white", border: "none", borderRadius: 8, padding: "8px 12px" }}>Logout</button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0])} />
          <button type="submit" style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "8px 14px" }}>
            Run AI Analyzer
          </button>
        </form>

        {loading && <p>Analyzing...</p>}
        {result && (
          <div style={{ marginTop: 24 }}>
            <h2>Clinical Snapshot</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
              <div style={{ background: "#1f2937", padding: 12, borderRadius: 10 }}><strong>Disease:</strong> {result.disease}</div>
              <div style={{ background: "#1f2937", padding: 12, borderRadius: 10 }}><strong>Medication:</strong> {result.medication}</div>
              <div style={{ background: "#1f2937", padding: 12, borderRadius: 10 }}><strong>Risk:</strong> <span style={{ color: riskColor(result.risk), fontWeight: 700 }}>{result.risk}</span></div>
            </div>
            <h3 style={{ marginTop: 20 }}>Timeline</h3>
            <div style={{ borderLeft: "3px solid #475569", paddingLeft: 14 }}>{(result.timeline || []).map((t, i) => <div key={i}><b>{t.year}</b> — {t.event}</div>)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12, marginTop: 18 }}>
              <ListCard title="Prior Episodes" items={result.prior_episodes} />
              <ListCard title="Medication History" items={result.medication_history} />
              <ListCard title="Risk Signals" items={result.risk_signals} />
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: 14, marginTop: 14 }}>
              <strong>Treatment Response:</strong> {result.treatment_response}<br />
              <strong>Care Insight:</strong> {result.care_insight}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
