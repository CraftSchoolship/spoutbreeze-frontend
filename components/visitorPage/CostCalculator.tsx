"use client";

import React, { useState, useMemo } from "react";

// Monthly cost per vCPU for a cloud VM (on-demand, sized for peak users)
const VCPU_MONTHLY_RATE = 10;
// BBB can handle roughly 25 concurrent users per vCPU
const USERS_PER_VCPU = 25;
// Typical CDN/streaming cost per 1000 viewer-hours (YouTube/Twitch = free; self-hosted ~$0.01)
const STREAMING_PER_1K_VIEWER_HOURS = 5;

function calcCores(users: number) {
  return Math.max(2, Math.ceil(users / USERS_PER_VCPU));
}

function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function CostCalculator() {
  const [attendees, setAttendees] = useState(2000);
  const [moderators, setModerators] = useState(5);
  const [hoursPerSession, setHoursPerSession] = useState(2);
  const [sessionsPerMonth, setSessionsPerMonth] = useState(4);

  const { traditional, blueScale, savings, savingsPct } = useMemo(() => {
    const totalHours = hoursPerSession * sessionsPerMonth;

    // Traditional: one big BBB server for all attendees + moderators, always provisioned
    const traditional = calcCores(attendees + moderators) * VCPU_MONTHLY_RATE;

    // BlueScale: tiny BBB for moderators only + cheap streaming delivery for attendees
    const bbbCost = calcCores(moderators) * VCPU_MONTHLY_RATE;
    const streamingCost = (attendees * totalHours / 1000) * STREAMING_PER_1K_VIEWER_HOURS;
    const blueScale = bbbCost + streamingCost;

    const savings = Math.max(0, traditional - blueScale);
    const savingsPct = traditional > 0 ? Math.round((savings / traditional) * 100) : 0;
    return { traditional, blueScale, savings, savingsPct };
  }, [attendees, moderators, hoursPerSession, sessionsPerMonth]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-teal-400/20 rounded-3xl blur-2xl transform rotate-3" />
      <div className="relative bg-white rounded-3xl shadow-xl shadow-sky-200/50 border border-sky-100 p-6 flex flex-col gap-4">

        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-slate-800">💰 Savings Calculator</span>
          <span className="text-xs bg-teal-50 text-teal-600 border border-teal-100 rounded-full px-2 py-0.5 font-medium">Live</span>
        </div>

        <p className="text-xs text-slate-500 -mt-2">
          See how much you save by streaming to thousands while keeping BBB small.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <SliderField
            label="Attendees"
            value={attendees}
            min={100}
            max={20000}
            step={100}
            display={attendees >= 20000 ? "20k+" : attendees.toLocaleString()}
            onChange={setAttendees}
          />
          <SliderField
            label="Moderators"
            value={moderators}
            min={1}
            max={50}
            step={1}
            display={String(moderators)}
            onChange={setModerators}
          />
          <SliderField
            label="Hours / session"
            value={hoursPerSession}
            min={1}
            max={8}
            step={0.5}
            display={`${hoursPerSession}h`}
            onChange={setHoursPerSession}
          />
          <SliderField
            label="Sessions / month"
            value={sessionsPerMonth}
            min={1}
            max={30}
            step={1}
            display={String(sessionsPerMonth)}
            onChange={setSessionsPerMonth}
          />
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-100 mt-1">
          <div className="flex items-center justify-between bg-red-50 px-4 py-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">Traditional BBB</p>
              <p className="text-base font-bold text-red-500">{formatUSD(traditional)}<span className="text-xs font-normal text-slate-400"> /mo</span></p>
            </div>
            <span className="text-2xl">🖥️</span>
          </div>
          <div className="flex items-center justify-between bg-teal-50 px-4 py-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">With BlueScale</p>
              <p className="text-base font-bold text-teal-600">{formatUSD(blueScale)}<span className="text-xs font-normal text-slate-400"> /mo</span></p>
            </div>
            <span className="text-2xl">🚀</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/80 font-medium">Monthly savings</p>
            <p className="text-2xl font-extrabold text-white">{formatUSD(savings)}</p>
            <p className="text-xs text-white/70">{formatUSD(savings * 12)} / year</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-3 text-center">
            <p className="text-3xl font-extrabold text-white">{savingsPct}%</p>
            <p className="text-xs text-white/80">cheaper</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Scales to 10s of thousands · Full interactivity · No huge BBB servers
        </p>
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
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #0ea5e9 0%, #06b6d4 ${((value - min) / (max - min)) * 100}%, #e2e8f0 ${((value - min) / (max - min)) * 100}%, #e2e8f0 100%)`,
        }}
      />
    </div>
  );
}
