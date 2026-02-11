"use client";

import React from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getLoginUrl } from "@/lib/auth";

const handleLogin = async () => {
  window.location.href = await getLoginUrl();
};

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden gradient-bg pt-20 pb-32 px-6 sm:px-8 lg:px-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-200/40 to-teal-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-sky-100 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-slate-600 font-medium">Scale your virtual events effortlessly</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 leading-tight">
              Welcome to{" "}
              <span className="gradient-text">BlueScale</span>
            </h1>

            <h2 className="text-xl sm:text-2xl font-medium mb-6 text-slate-600">
              Where Ideas Scale to New Heights
            </h2>

            <p className="text-base sm:text-lg text-slate-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              BlueScale is a modern platform that makes hosting, attending, and managing
              webinars seamless. Deliver impactful virtual experiences with confidence and ease.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="contained"
                size="large"
                onClick={handleLogin}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
                    boxShadow: '0 6px 20px rgba(14, 165, 233, 0.45)',
                  },
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: 500,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  '&:hover': {
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.04)',
                  },
                }}
              >
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-teal-400/20 rounded-3xl blur-2xl transform rotate-6"></div>
              <div className="relative bg-white rounded-3xl shadow-xl shadow-sky-200/50 p-8 border border-sky-100">
                <Image
                  src="/bluescale_logo.png"
                  alt="BlueScale"
                  width={280}
                  height={280}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
