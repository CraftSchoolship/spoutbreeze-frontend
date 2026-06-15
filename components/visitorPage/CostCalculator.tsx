"use client";

import React, { useState, useMemo } from "react";

// ─── Cost model ───────────────────────────────────────────────────────────────
// $50 per every 20 moderators, × parallel sessions running concurrently
const UNIT_COST = 50;
const UNIT_SIZE = 20;

function units(users: number) {
  return Math.max(1, Math.ceil(users / UNIT_SIZE));
}

function calcCosts(attendees: number, moderators: number, parallelSessions: number) {
  const blueScale = units(moderators) * UNIT_COST * parallelSessions;
  const traditional = units(attendees + moderators) * UNIT_COST * parallelSessions;
  const savings = Math.max(0, traditional - blueScale);
  const savingsPct = traditional > 0 ? Math.round((savings / traditional) * 100) : 0;
  return { traditional, blueScale, savings, savingsPct };
}

function scaleTiers(attendees: number, moderators: number, parallelSessions: number) {
  const levels = [
    Math.max(20, Math.round(attendees * 0.25)),
    attendees,
    Math.min(20000, attendees * 4),
  ];
  return levels.map((a) => ({ attendees: a, ...calcCosts(a, moderators, parallelSessions) }));
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// ─── PDF report ───────────────────────────────────────────────────────────────
function generateReportHTML(
  name: string,
  email: string,
  attendees: number,
  moderators: number,
  hoursPerSession: number,
  parallelSessions: number,
) {
  const costs = calcCosts(attendees, moderators, parallelSessions);
  const tiers = scaleTiers(attendees, moderators, parallelSessions);
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>BlueScale Savings Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; padding: 40px; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e0f2fe; }
    .logo-box { background: linear-gradient(135deg, #0ea5e9, #06b6d4); border-radius: 12px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; font-weight: 800; }
    .brand { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #0ea5e9, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .tagline { font-size: 12px; color: #64748b; margin-top: 2px; }
    .meta { margin-left: auto; text-align: right; font-size: 12px; color: #64748b; }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .subtitle { font-size: 15px; color: #475569; margin-bottom: 32px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 12px; }
    .params-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .param { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; }
    .param-label { font-size: 12px; color: #64748b; }
    .param-value { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    th { background: #f1f5f9; padding: 12px 16px; font-size: 12px; font-weight: 600; text-align: left; color: #475569; }
    td { padding: 12px 16px; font-size: 14px; border-top: 1px solid #f1f5f9; }
    .cost-red { color: #ef4444; font-weight: 700; }
    .cost-teal { color: #0d9488; font-weight: 700; }
    .highlight-row td { background: #f0fdf4; font-weight: 700; }
    .savings-box { background: linear-gradient(135deg, #0ea5e9, #06b6d4); border-radius: 16px; padding: 28px 32px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .savings-amount { font-size: 42px; font-weight: 800; line-height: 1.1; }
    .savings-pct { background: rgba(255,255,255,0.2); border-radius: 12px; padding: 16px 24px; text-align: center; }
    .savings-pct-num { font-size: 36px; font-weight: 800; }
    .benefits { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .benefit { display: flex; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #334155; }
    .benefit:last-child { margin-bottom: 0; }
    .check { color: #0d9488; font-weight: 700; }
    .formula-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; font-size: 13px; }
    .formula-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .formula-row:last-child { margin-bottom: 0; }
    .diff-table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .diff-table th { background: #f1f5f9; padding: 10px 14px; font-size: 11px; text-align: left; }
    .diff-table td { padding: 12px 14px; font-size: 13px; border-top: 1px solid #f1f5f9; vertical-align: top; }
    .diff-table .bad { color: #ef4444; }
    .diff-table .good { color: #0d9488; }
    .flat-badge { display: inline-block; background: #dcfce7; color: #166534; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; margin-left: 6px; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    .cta-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px 24px; text-align: center; margin-top: 20px; }
    @media print { body { background: white; padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-box">B</div>
    <div>
      <div class="brand">BlueScale</div>
      <div class="tagline">Scale your virtual events effortlessly</div>
    </div>
    <div class="meta">
      <div><strong>Prepared for:</strong> ${name || email}</div>
      <div>${email}</div>
      <div>${date}</div>
    </div>
  </div>

  <h1>Infrastructure Savings Report</h1>
  <p class="subtitle">How BlueScale keeps your costs flat while traditional solutions scale up with every attendee</p>

  <div class="section">
    <div class="section-title">Your Configuration</div>
    <div class="params-grid">
      <div class="param"><div class="param-label">Attendees per session</div><div class="param-value">${attendees.toLocaleString()}</div></div>
      <div class="param"><div class="param-label">Moderators per session</div><div class="param-value">${moderators}</div></div>
      <div class="param"><div class="param-label">Hours per session</div><div class="param-value">${hoursPerSession}h</div></div>
      <div class="param"><div class="param-label">Parallel sessions</div><div class="param-value">${parallelSessions}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Pricing Formula</div>
    <div class="formula-box">
      <div class="formula-row">
        <span style="font-weight:600;color:#ef4444;width:120px;flex-shrink:0">Traditional:</span>
        <span style="font-family:monospace;font-size:12px;color:#475569">ceil((${attendees.toLocaleString()} + ${moderators}) / 20) x $50 x ${parallelSessions} sessions = <strong>${fmt(costs.traditional)}/mo</strong></span>
      </div>
      <div class="formula-row">
        <span style="font-weight:600;color:#0d9488;width:120px;flex-shrink:0">BlueScale:</span>
        <span style="font-family:monospace;font-size:12px;color:#475569">ceil(${moderators} / 20) x $50 x ${parallelSessions} sessions = <strong>${fmt(costs.blueScale)}/mo</strong></span>
      </div>
      <p style="font-size:12px;color:#64748b;margin-top:10px;">BlueScale only charges for moderators — attendees watch via free streaming platforms (YouTube/Twitch).</p>
    </div>
  </div>

  <div class="savings-box">
    <div>
      <div style="font-size:13px;opacity:0.85;font-weight:500;">Your estimated monthly savings</div>
      <div class="savings-amount">${fmt(costs.savings)}</div>
      <div style="font-size:14px;opacity:0.75;margin-top:4px">${fmt(costs.savings * 12)} per year &middot; ${costs.savingsPct}% cheaper</div>
    </div>
    <div class="savings-pct">
      <div class="savings-pct-num">${costs.savingsPct}%</div>
      <div style="font-size:12px;opacity:0.8;">cheaper</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Cost at Scale &mdash; The Flat Line Advantage</div>
    <table>
      <tr>
        <th>Attendees per session</th>
        <th>Traditional (grows)</th>
        <th>BlueScale <span class="flat-badge">FLAT</span></th>
        <th>Saving</th>
      </tr>
      ${tiers.map((t, i) => `
      <tr ${i === 1 ? 'class="highlight-row"' : ''}>
        <td>${t.attendees.toLocaleString()}${i === 1 ? " &larr; your setup" : ""}</td>
        <td class="cost-red">${fmt(t.traditional)}/mo</td>
        <td class="cost-teal">${fmt(t.blueScale)}/mo</td>
        <td>${fmt(t.savings)}/mo</td>
      </tr>`).join("")}
    </table>
    <p style="font-size:12px;color:#64748b;margin-top:8px;">BlueScale cost only moves when moderators cross a multiple of 20 &mdash; audience size never affects your bill.</p>
  </div>

  <div class="section">
    <div class="section-title">3 More Reasons BlueScale Wins</div>
    <table class="diff-table">
      <tr><th style="width:20%">Dimension</th><th style="width:40%">Traditional</th><th style="width:40%">BlueScale</th></tr>
      <tr>
        <td><strong>Infrastructure</strong></td>
        <td class="bad">Scales with every user. Each attendee adds CPU and memory pressure.</td>
        <td class="good">Completely flat. Same server for 10 or 10,000 attendees. Cost doubles only after 20 more moderators.</td>
      </tr>
      <tr>
        <td><strong>Setup time</strong></td>
        <td class="bad">Days of server provisioning, BBB tuning, and load-balancer configuration.</td>
        <td class="good">Live in minutes &mdash; connect BBB, link your streaming platform, done.</td>
      </tr>
      <tr>
        <td><strong>Chat sync</strong></td>
        <td class="bad">Moderators manually juggle BBB, streaming chat, and multiple dashboards.</td>
        <td class="good">Automatic bidirectional chat sync &mdash; viewer messages in BBB instantly, replies stream back in seconds.</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">How It Works</div>
    <div class="benefits">
      <div class="benefit"><span class="check">&#10003;</span> BBB runs with only ${moderators} moderator(s) &mdash; billed as ${units(moderators)} unit(s) of $50 regardless of audience size</div>
      <div class="benefit"><span class="check">&#10003;</span> ${attendees.toLocaleString()} viewers watch via live stream (YouTube, Twitch or RTMP) &mdash; zero BBB load added</div>
      <div class="benefit"><span class="check">&#10003;</span> Chat messages from all viewers relay into BBB in real time &mdash; moderators see every question in one place</div>
      <div class="benefit"><span class="check">&#10003;</span> Moderator replies push back to the streaming platform within seconds &mdash; no manual copy-paste</div>
      <div class="benefit"><span class="check">&#10003;</span> Cost only changes when moderators cross a multiple of 20 &mdash; audience size never affects your bill</div>
    </div>
  </div>

  <div class="cta-box">
    <div style="font-size:14px;color:#0369a1;font-weight:600;margin-bottom:6px;">Ready to start saving ${fmt(costs.savings * 12)} per year?</div>
    <div style="font-size:13px;color:#0ea5e9;">Create your free account at bluescale.io</div>
  </div>

  <div class="footer">Pricing: $50 per 20 users/session x parallel sessions. BlueScale counts only moderators; traditional solutions count all users. Free streaming via YouTube/Twitch.</div>
</body>
</html>`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CostCalculator() {
  const [attendees, setAttendees] = useState(2000);
  const [moderators, setModerators] = useState(5);
  const [hoursPerSession, setHoursPerSession] = useState(2);
  const [parallelSessions, setParallelSessions] = useState(4);

  const [step, setStep] = useState<"calc" | "email" | "report">("calc");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const costs = useMemo(
    () => calcCosts(attendees, moderators, parallelSessions),
    [attendees, moderators, parallelSessions],
  );
  const tiers = useMemo(
    () => scaleTiers(attendees, moderators, parallelSessions),
    [attendees, moderators, parallelSessions],
  );

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setEmailError("Please enter a valid email address."); return; }
    setEmailError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setStep("report");
  };

  const handleDownloadPDF = () => {
    const html = generateReportHTML(name, email, attendees, moderators, hoursPerSession, parallelSessions);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  const handleSignUp = async () => {
    window.location.href = "/auth/signin";
  };

  return (
    <>
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-teal-400/20 rounded-3xl blur-2xl transform rotate-3" />
        <div className="relative bg-white rounded-3xl shadow-xl shadow-sky-200/50 border border-sky-100 p-6 flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">💰 Savings Calculator</span>
            <span className="text-xs bg-teal-50 text-teal-600 border border-teal-100 rounded-full px-2 py-0.5 font-medium">Live</span>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            BlueScale bills only for <strong className="text-teal-600">moderators</strong> — attendees watch free streams.
            Traditional solutions bill for <strong className="text-red-400">every user</strong>.
          </p>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <SliderField label="Attendees / session" value={attendees} min={20} max={20000} step={20}
              display={attendees >= 20000 ? "20k+" : attendees.toLocaleString()} onChange={setAttendees} />
            <SliderField label="Moderators / session" value={moderators} min={1} max={100} step={1}
              display={String(moderators)} onChange={setModerators} />
            <SliderField label="Hours / session" value={hoursPerSession} min={1} max={8} step={0.5}
              display={`${hoursPerSession}h`} onChange={setHoursPerSession} />
            <SliderField label="Parallel sessions" value={parallelSessions} min={1} max={20} step={1}
              display={String(parallelSessions)} onChange={setParallelSessions} />
          </div>

          {/* Pricing formula strip */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 leading-relaxed">
            <div className="flex gap-2 mb-1">
              <span className="font-semibold text-red-400 w-20 shrink-0">Traditional:</span>
              <span>
                ceil(({attendees.toLocaleString()} + {moderators}) / 20) &times; $50 &times; {parallelSessions} =&nbsp;
                <strong className="text-red-500">{fmt(costs.traditional)}/mo</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-teal-600 w-20 shrink-0">BlueScale:</span>
              <span>
                ceil({moderators} / 20) &times; $50 &times; {parallelSessions} =&nbsp;
                <strong className="text-teal-600">{fmt(costs.blueScale)}/mo</strong>
              </span>
            </div>
          </div>

          {/* Cost at scale */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Cost as your audience grows</p>
            <div className="rounded-2xl overflow-hidden border border-slate-100">
              <div className="grid grid-cols-3 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400">
                <span>Attendees</span>
                <span className="text-center text-red-400">Traditional</span>
                <span className="text-center text-teal-500">BlueScale</span>
              </div>
              {tiers.map((t, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 px-3 py-2 text-xs border-t ${i === 1 ? "bg-teal-50 border-teal-100" : "border-slate-100"}`}
                >
                  <span className={`font-medium ${i === 1 ? "text-teal-700" : "text-slate-500"}`}>
                    {t.attendees >= 1000
                      ? `${(t.attendees / 1000).toFixed(t.attendees % 1000 === 0 ? 0 : 1)}k`
                      : t.attendees}
                    {i === 1 && <span className="ml-1 text-teal-400">&#9664;</span>}
                  </span>
                  <span className="text-center font-bold text-red-500">{fmt(t.traditional)}</span>
                  <span className="text-center font-bold text-teal-600">{fmt(t.blueScale)}</span>
                </div>
              ))}
              <div className="px-3 py-1.5 bg-teal-600 flex justify-between items-center">
                <span className="text-xs text-white/90 font-medium">BlueScale flat &harr; Traditional grows &uarr;</span>
                <span className="text-xs text-white font-bold">{costs.savingsPct}% saved</span>
              </div>
            </div>
          </div>

          {/* 3 differentiators */}
          <div className="flex flex-col gap-1.5">
            {[
              { icon: "🖥️", label: "Infrastructure", bad: "Grows with every user", good: "Fixed regardless of audience" },
              { icon: "⚡", label: "Setup time",     bad: "Days of configuration",  good: "Live in minutes" },
              { icon: "💬", label: "Chat sync",      bad: "Manual juggling",         good: "Auto bidirectional sync" },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-base w-5 shrink-0">{d.icon}</span>
                <span className="text-xs font-semibold text-slate-500 w-20 shrink-0">{d.label}</span>
                <div className="flex flex-1 gap-1 min-w-0">
                  <span className="flex-1 text-xs text-red-500 bg-red-50 rounded-lg px-2 py-0.5 text-center truncate">{d.bad}</span>
                  <span className="flex-1 text-xs text-teal-700 bg-teal-50 rounded-lg px-2 py-0.5 text-center truncate">{d.good}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Savings banner */}
          <div className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80 font-medium">Monthly savings</p>
              <p className="text-xl font-extrabold text-white">{fmt(costs.savings)}</p>
              <p className="text-xs text-white/70">{fmt(costs.savings * 12)} / year</p>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
              <p className="text-2xl font-extrabold text-white">{costs.savingsPct}%</p>
              <p className="text-xs text-white/80">cheaper</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep("email")}
            className="w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all"
            style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)", boxShadow: "0 4px 14px rgba(14,165,233,0.35)" }}
          >
            📄 Get My Free Savings Report
          </button>
          <p className="text-center text-xs text-slate-400 -mt-1">
            Free streaming via YouTube / Twitch &middot; Cost doubles only past 20 mods
          </p>
        </div>
      </div>

      {/* ── Email capture modal ── */}
      {step === "email" && (
        <Modal onClose={() => setStep("calc")}>
          <div className="flex flex-col items-center gap-1 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-1"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>📊</div>
            <h2 className="text-xl font-bold text-slate-900">Your Savings Report is Ready</h2>
            <p className="text-sm text-slate-500 text-center">
              Enter your details to receive a full PDF showing your{" "}
              <strong className="text-teal-600">{fmt(costs.savings * 12)}/year</strong> potential savings.
            </p>
          </div>

          <div className="bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-100 rounded-2xl px-4 py-3 mb-5 grid grid-cols-3 gap-2 text-center text-xs">
            <div><p className="text-slate-400">Traditional</p><p className="text-base font-bold text-red-500">{fmt(costs.traditional)}<span className="text-xs text-slate-400">/mo</span></p></div>
            <div><p className="text-slate-400">BlueScale</p><p className="text-base font-bold text-teal-600">{fmt(costs.blueScale)}<span className="text-xs text-slate-400">/mo</span></p></div>
            <div><p className="text-slate-400">You save</p><p className="text-base font-bold text-sky-600">{fmt(costs.savings)}<span className="text-xs text-slate-400">/mo</span></p></div>
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Your Name</label>
              <input type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Work Email <span className="text-red-400">*</span></label>
              <input type="email" placeholder="you@company.com" value={email} required onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-1 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>
              {submitting ? "Generating report..." : "📄 Generate My Report"}
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-3">No spam. Report delivered instantly. Unsubscribe any time.</p>
        </Modal>
      )}

      {/* ── Report modal ── */}
      {step === "report" && (
        <Modal onClose={() => setStep("calc")} wide>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>B</div>
              <div>
                <p className="font-bold text-slate-900">BlueScale Savings Report</p>
                <p className="text-xs text-slate-500">Prepared for {name || email}</p>
              </div>
              <div className="ml-auto text-xs text-slate-400">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>

            <div className="rounded-2xl px-6 py-5 text-white flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)" }}>
              <div>
                <p className="text-sm opacity-80">Estimated monthly savings</p>
                <p className="text-4xl font-extrabold">{fmt(costs.savings)}</p>
                <p className="text-sm opacity-70 mt-0.5">{fmt(costs.savings * 12)} per year</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-4 text-center">
                <p className="text-4xl font-extrabold">{costs.savingsPct}%</p>
                <p className="text-xs opacity-80">cheaper</p>
              </div>
            </div>

            {/* Formula */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-600 mb-1.5">Pricing formula</p>
              <div className="flex gap-2 mb-1">
                <span className="font-semibold text-red-400 w-24 shrink-0">Traditional:</span>
                <span>ceil(({attendees.toLocaleString()} + {moderators}) / 20) &times; $50 &times; {parallelSessions} sessions = <strong className="text-red-500">{fmt(costs.traditional)}/mo</strong></span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-teal-600 w-24 shrink-0">BlueScale:</span>
                <span>ceil({moderators} / 20) &times; $50 &times; {parallelSessions} sessions = <strong className="text-teal-600">{fmt(costs.blueScale)}/mo</strong></span>
              </div>
            </div>

            {/* Cost at scale */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Cost at Scale — BlueScale stays flat</p>
              <div className="rounded-2xl border border-slate-100 overflow-hidden text-sm">
                <div className="grid grid-cols-4 bg-slate-50 px-4 py-2 font-semibold text-xs text-slate-500">
                  <span>Attendees</span>
                  <span className="text-center text-red-400">Traditional</span>
                  <span className="text-center text-teal-600">BlueScale</span>
                  <span className="text-center">Saving</span>
                </div>
                {tiers.map((t, i) => (
                  <div key={i} className={`grid grid-cols-4 px-4 py-2.5 border-t text-xs ${i === 1 ? "bg-teal-50 border-teal-100 font-bold" : "border-slate-100"}`}>
                    <span className={i === 1 ? "text-teal-700" : "text-slate-600"}>
                      {t.attendees.toLocaleString()}{i === 1 ? " ★" : ""}
                    </span>
                    <span className="text-center text-red-500">{fmt(t.traditional)}/mo</span>
                    <span className="text-center text-teal-600">{fmt(t.blueScale)}/mo</span>
                    <span className="text-center text-slate-700">{fmt(t.savings)}/mo</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">★ Your current setup · BlueScale cost only rises when moderators cross a multiple of 20.</p>
            </div>

            {/* 3 differentiators */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">3 More Reasons BlueScale Wins</p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: "🖥️", label: "Infrastructure", bad: "Every attendee adds server load — massive machines for large crowds", good: "Fixed cost. Attendees never touch BBB. Cost only doubles past 20 moderators." },
                  { icon: "⚡", label: "Setup time", bad: "Days of server provisioning, BBB tuning, load-balancer config", good: "Live in minutes — connect BBB, link streaming platform, done" },
                  { icon: "💬", label: "Chat sync", bad: "Moderators manually juggle BBB, streaming chat and multiple tabs", good: "Automatic bidirectional sync — viewer messages in BBB instantly, replies stream back" },
                ].map((d) => (
                  <div key={d.label} className="grid grid-cols-3 gap-2 text-xs rounded-xl overflow-hidden border border-slate-100">
                    <div className="bg-slate-50 px-3 py-2.5 flex items-start gap-1.5 font-semibold text-slate-600">
                      <span>{d.icon}</span><span>{d.label}</span>
                    </div>
                    <div className="bg-red-50 px-3 py-2.5 text-red-600">{d.bad}</div>
                    <div className="bg-teal-50 px-3 py-2.5 text-teal-700">{d.good}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Config params */}
            <div className="grid grid-cols-4 gap-2">
              {[
                ["Attendees", attendees.toLocaleString()],
                ["Moderators", String(moderators)],
                ["Hours/session", `${hoursPerSession}h`],
                ["Parallel sessions", String(parallelSessions)],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 text-center border border-slate-100">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-base font-bold text-slate-700">{val}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleDownloadPDF}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-sky-200 text-sky-600 hover:bg-sky-50 transition-all">
                &#8659; Download PDF Report
              </button>
              <button onClick={handleSignUp}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)", boxShadow: "0 4px 14px rgba(14,165,233,0.35)" }}>
                🚀 Create Account &amp; Start Saving
              </button>
            </div>

            <p className="text-xs text-center text-slate-400">
              $50 per 20 users/session &times; parallel sessions &middot; Free streaming via YouTube/Twitch
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full overflow-y-auto"
        style={{ maxWidth: wide ? 640 : 440, maxHeight: "90vh" }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm transition-all z-10">
          &#10005;
        </button>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

// ─── Slider field ─────────────────────────────────────────────────────────────
interface SliderFieldProps {
  label: string; value: number; min: number; max: number; step: number; display: string;
  onChange: (v: number) => void;
}
function SliderField({ label, value, min, max, step, display, onChange }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <label className="text-xs text-slate-500 font-medium">{label}</label>
        <span className="text-sm font-bold text-slate-700">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right,#0ea5e9 0%,#06b6d4 ${pct}%,#e2e8f0 ${pct}%,#e2e8f0 100%)` }}
      />
    </div>
  );
}
