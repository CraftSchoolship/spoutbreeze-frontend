"use client";

import React, { useState, useMemo } from "react";
import { getLoginUrl } from "@/lib/auth";

// Cost model constants
const VCPU_MONTHLY_RATE = 10;
const USERS_PER_VCPU = 25;
const STREAMING_PER_1K_VIEWER_HOURS = 5;

function calcCores(users: number) {
  return Math.max(2, Math.ceil(users / USERS_PER_VCPU));
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function calcCosts(attendees: number, moderators: number, hoursPerSession: number, sessionsPerMonth: number) {
  const totalHours = hoursPerSession * sessionsPerMonth;
  const traditional = calcCores(attendees + moderators) * VCPU_MONTHLY_RATE;
  const bbbCost = calcCores(moderators) * VCPU_MONTHLY_RATE;
  const streamingCost = (attendees * totalHours / 1000) * STREAMING_PER_1K_VIEWER_HOURS;
  const blueScale = bbbCost + streamingCost;
  const savings = Math.max(0, traditional - blueScale);
  const savingsPct = traditional > 0 ? Math.round((savings / traditional) * 100) : 0;
  return { traditional, blueScale, bbbCost, streamingCost, savings, savingsPct };
}

function generateReportHTML(
  name: string,
  email: string,
  attendees: number,
  moderators: number,
  hoursPerSession: number,
  sessionsPerMonth: number,
  costs: ReturnType<typeof calcCosts>
) {
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
    .savings-box { background: linear-gradient(135deg, #0ea5e9, #06b6d4); border-radius: 16px; padding: 28px 32px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .savings-main { }
    .savings-label { font-size: 13px; opacity: 0.85; font-weight: 500; }
    .savings-amount { font-size: 42px; font-weight: 800; line-height: 1.1; }
    .savings-year { font-size: 14px; opacity: 0.75; margin-top: 4px; }
    .savings-pct { background: rgba(255,255,255,0.2); border-radius: 12px; padding: 16px 24px; text-align: center; }
    .savings-pct-num { font-size: 36px; font-weight: 800; }
    .savings-pct-label { font-size: 12px; opacity: 0.8; }
    .benefits { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .benefit { display: flex; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #334155; }
    .benefit:last-child { margin-bottom: 0; }
    .check { color: #0d9488; font-weight: 700; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
    .cta-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px 24px; text-align: center; margin-top: 20px; }
    .cta-text { font-size: 14px; color: #0369a1; font-weight: 600; margin-bottom: 6px; }
    .cta-url { font-size: 13px; color: #0ea5e9; }
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
  <p class="subtitle">Estimated cost reduction by switching from traditional BigBlueButton to BlueScale's streaming architecture</p>

  <div class="section">
    <div class="section-title">Your Webinar Configuration</div>
    <div class="params-grid">
      <div class="param"><div class="param-label">Concurrent Attendees</div><div class="param-value">${attendees.toLocaleString()}</div></div>
      <div class="param"><div class="param-label">Moderators (BBB)</div><div class="param-value">${moderators}</div></div>
      <div class="param"><div class="param-label">Hours per Session</div><div class="param-value">${hoursPerSession}h</div></div>
      <div class="param"><div class="param-label">Sessions per Month</div><div class="param-value">${sessionsPerMonth}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Monthly Cost Breakdown</div>
    <table>
      <tr><th>Cost Item</th><th>Traditional BBB</th><th>With BlueScale</th></tr>
      <tr>
        <td>BBB Server (${calcCores(attendees + moderators)} vCPUs vs ${calcCores(moderators)} vCPUs)</td>
        <td class="cost-red">${fmt(costs.traditional)}</td>
        <td class="cost-teal">${fmt(costs.bbbCost)}</td>
      </tr>
      <tr>
        <td>Streaming delivery for ${attendees.toLocaleString()} viewers</td>
        <td>Included (BBB handles all)</td>
        <td class="cost-teal">${fmt(costs.streamingCost)}</td>
      </tr>
      <tr style="font-weight:700; font-size:15px;">
        <td><strong>Total / month</strong></td>
        <td class="cost-red"><strong>${fmt(costs.traditional)}</strong></td>
        <td class="cost-teal"><strong>${fmt(costs.blueScale)}</strong></td>
      </tr>
    </table>
  </div>

  <div class="savings-box">
    <div class="savings-main">
      <div class="savings-label">Your estimated monthly savings</div>
      <div class="savings-amount">${fmt(costs.savings)}</div>
      <div class="savings-year">${fmt(costs.savings * 12)} per year</div>
    </div>
    <div class="savings-pct">
      <div class="savings-pct-num">${costs.savingsPct}%</div>
      <div class="savings-pct-label">cheaper</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Why BlueScale Works</div>
    <div class="benefits">
      <div class="benefit"><span class="check">✓</span> Your BBB session runs with only ${moderators} moderator(s) — dramatically reducing server load</div>
      <div class="benefit"><span class="check">✓</span> Attendees follow a live stream (Twitch, YouTube, or RTMP) — no BBB license seats consumed</div>
      <div class="benefit"><span class="check">✓</span> Chat messages from ${attendees.toLocaleString()} viewers are relayed back to BBB, so moderators stay in control</div>
      <div class="benefit"><span class="check">✓</span> Moderator responses stream back to attendees in seconds — full interactivity maintained</div>
      <div class="benefit"><span class="check">✓</span> Scales to tens of thousands of simultaneous viewers with no additional BBB infrastructure</div>
    </div>
  </div>

  <div class="cta-box">
    <div class="cta-text">Ready to start saving ${fmt(costs.savings * 12)} per year?</div>
    <div class="cta-url">Create your free account at bluescale.io</div>
  </div>

  <div class="footer">This report was generated by BlueScale's interactive savings calculator. Estimates are based on standard cloud VM pricing at $${VCPU_MONTHLY_RATE}/vCPU/month and streaming delivery at $${STREAMING_PER_1K_VIEWER_HOURS}/1k viewer-hours.</div>
</body>
</html>`;
}

export default function CostCalculator() {
  const [attendees, setAttendees] = useState(2000);
  const [moderators, setModerators] = useState(5);
  const [hoursPerSession, setHoursPerSession] = useState(2);
  const [sessionsPerMonth, setSessionsPerMonth] = useState(4);

  const [step, setStep] = useState<"calc" | "email" | "report">("calc");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const costs = useMemo(
    () => calcCosts(attendees, moderators, hoursPerSession, sessionsPerMonth),
    [attendees, moderators, hoursPerSession, sessionsPerMonth]
  );

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setStep("report");
  };

  const handleDownloadPDF = () => {
    const html = generateReportHTML(name, email, attendees, moderators, hoursPerSession, sessionsPerMonth, costs);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  const handleSignUp = async () => {
    window.location.href = await getLoginUrl();
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
            Adjust your setup and see how much you save by streaming to thousands while keeping BBB small.
          </p>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <SliderField label="Attendees" value={attendees} min={100} max={20000} step={100}
              display={attendees >= 20000 ? "20k+" : attendees.toLocaleString()} onChange={setAttendees} />
            <SliderField label="Moderators" value={moderators} min={1} max={50} step={1}
              display={String(moderators)} onChange={setModerators} />
            <SliderField label="Hours / session" value={hoursPerSession} min={1} max={8} step={0.5}
              display={`${hoursPerSession}h`} onChange={setHoursPerSession} />
            <SliderField label="Sessions / month" value={sessionsPerMonth} min={1} max={30} step={1}
              display={String(sessionsPerMonth)} onChange={setSessionsPerMonth} />
          </div>

          {/* Cost comparison */}
          <div className="rounded-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between bg-red-50 px-4 py-2.5">
              <div>
                <p className="text-xs text-slate-500 font-medium">Traditional BBB</p>
                <p className="text-sm font-bold text-red-500">{fmt(costs.traditional)}<span className="text-xs font-normal text-slate-400"> /mo</span></p>
              </div>
              <span className="text-xl">🖥️</span>
            </div>
            <div className="flex items-center justify-between bg-teal-50 px-4 py-2.5">
              <div>
                <p className="text-xs text-slate-500 font-medium">With BlueScale</p>
                <p className="text-sm font-bold text-teal-600">{fmt(costs.blueScale)}<span className="text-xs font-normal text-slate-400"> /mo</span></p>
              </div>
              <span className="text-xl">🚀</span>
            </div>
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
            Scales to 10s of thousands · Full interactivity · No huge BBB servers
          </p>
        </div>
      </div>

      {/* Email capture modal */}
      {step === "email" && (
        <Modal onClose={() => setStep("calc")}>
          <div className="flex flex-col items-center gap-1 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-1"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>
              📊
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your Savings Report is Ready</h2>
            <p className="text-sm text-slate-500 text-center">
              Enter your details to receive a personalized PDF report showing your{" "}
              <strong className="text-teal-600">{fmt(costs.savings * 12)}/year</strong> potential savings.
            </p>
          </div>

          {/* Preview strip */}
          <div className="bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-100 rounded-2xl px-5 py-4 mb-5 flex justify-between">
            <div className="text-center">
              <p className="text-xs text-slate-500">Traditional</p>
              <p className="text-base font-bold text-red-500">{fmt(costs.traditional)}<span className="text-xs text-slate-400">/mo</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">BlueScale</p>
              <p className="text-base font-bold text-teal-600">{fmt(costs.blueScale)}<span className="text-xs text-slate-400">/mo</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">You save</p>
              <p className="text-base font-bold text-sky-600">{fmt(costs.savings)}<span className="text-xs text-slate-400">/mo</span></p>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Your Name</label>
              <input
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Work Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-1 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
            >
              {submitting ? "Generating report…" : "📄 Generate My Report"}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-3">
            No spam. We&apos;ll only use your email to send the report and occasional BlueScale updates.
          </p>
        </Modal>
      )}

      {/* Report modal */}
      {step === "report" && (
        <Modal onClose={() => setStep("calc")} wide>
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}>B</div>
              <div>
                <p className="font-bold text-slate-900">BlueScale Savings Report</p>
                <p className="text-xs text-slate-500">Prepared for {name || email}</p>
              </div>
              <div className="ml-auto text-xs text-slate-400">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>

            {/* Big savings */}
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

            {/* Breakdown table */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Cost Breakdown</p>
              <div className="rounded-2xl border border-slate-100 overflow-hidden text-sm">
                <div className="grid grid-cols-3 bg-slate-50 px-4 py-2 font-semibold text-xs text-slate-500">
                  <span>Item</span><span className="text-center">Traditional BBB</span><span className="text-center">BlueScale</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-2.5 border-t border-slate-100">
                  <span className="text-slate-600">BBB Server ({calcCores(attendees + moderators)} → {calcCores(moderators)} vCPUs)</span>
                  <span className="text-center font-bold text-red-500">{fmt(costs.traditional)}</span>
                  <span className="text-center font-bold text-teal-600">{fmt(costs.bbbCost)}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-2.5 border-t border-slate-100">
                  <span className="text-slate-600">Streaming for {attendees.toLocaleString()} viewers</span>
                  <span className="text-center text-slate-400">—</span>
                  <span className="text-center font-bold text-teal-600">{fmt(costs.streamingCost)}</span>
                </div>
                <div className="grid grid-cols-3 px-4 py-2.5 border-t border-slate-200 bg-slate-50 font-bold">
                  <span className="text-slate-700">Total / month</span>
                  <span className="text-center text-red-500">{fmt(costs.traditional)}</span>
                  <span className="text-center text-teal-600">{fmt(costs.blueScale)}</span>
                </div>
              </div>
            </div>

            {/* Config params */}
            <div className="grid grid-cols-4 gap-2">
              {[
                ["Attendees", attendees.toLocaleString()],
                ["Moderators", String(moderators)],
                ["Hours/session", `${hoursPerSession}h`],
                ["Sessions/mo", String(sessionsPerMonth)],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 text-center border border-slate-100">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-base font-bold text-slate-700">{val}</p>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="bg-teal-50 rounded-2xl border border-teal-100 px-4 py-4 flex flex-col gap-2">
              {[
                `BBB runs with only ${moderators} moderator(s) — ${calcCores(moderators)} vCPUs instead of ${calcCores(attendees + moderators)}`,
                `${attendees.toLocaleString()} viewers watch via live stream — no BBB seats consumed`,
                "Chat messages from all viewers relay to BBB in real time — full interactivity",
                "Moderator replies stream back to attendees within seconds",
                "Scales to tens of thousands with zero BBB infrastructure changes",
              ].map((t, i) => (
                <div key={i} className="flex gap-2 text-sm text-teal-800">
                  <span className="text-teal-500 font-bold mt-0.5">✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-1">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-sky-200 text-sky-600 hover:bg-sky-50 transition-all"
              >
                ⬇ Download PDF Report
              </button>
              <button
                onClick={handleSignUp}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)", boxShadow: "0 4px 14px rgba(14,165,233,0.35)" }}
              >
                🚀 Create Account &amp; Start Saving
              </button>
            </div>

            <p className="text-xs text-center text-slate-400">
              Estimates based on ${VCPU_MONTHLY_RATE}/vCPU/month cloud VMs · ${STREAMING_PER_1K_VIEWER_HOURS}/1k viewer-hours streaming delivery
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full overflow-y-auto"
        style={{ maxWidth: wide ? 620 : 440, maxHeight: "90vh" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm transition-all z-10"
        >
          ✕
        </button>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function SliderField({ label, value, min, max, step, display, onChange }: SliderFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <label className="text-xs text-slate-500 font-medium">{label}</label>
        <span className="text-sm font-bold text-slate-700">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #0ea5e9 0%, #06b6d4 ${((value - min) / (max - min)) * 100}%, #e2e8f0 ${((value - min) / (max - min)) * 100}%, #e2e8f0 100%)`,
        }}
      />
    </div>
  );
}
