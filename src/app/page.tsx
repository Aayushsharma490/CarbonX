'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity, Zap, Leaf, ArrowRight, Globe, HardHat,
  Cpu, Shield, Layers, Database, Workflow, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function Page() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <div className="space-y-32 mb-32">
      <HeroSection />
      <FeatureGrid />
      <HardwareShowcase />
      <ProcessArchitecture />
      <TechnicalHighlights />
      <GlobalImpactTicker />
      <SustainabilityInsight />
    </div>
  );
}

function ProcessArchitecture() {
  const steps = [
    { icon: Cpu, label: "Sensor Core", detail: "High-freq sampling" },
    { icon: Database, label: "RX Registry", detail: "Encrypted sync" },
    { icon: Activity, label: "AI Analysis", detail: "Anomaly detection" },
    { icon: Leaf, label: "Carbon Ledger", detail: "Automated offsets" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-32 relative overflow-hidden">
      {/* Background Grid - Removed per user request for clean floating lines */}

      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl md:text-6xl font-black text-brand-green-dark tracking-tighter uppercase italic">
          The CarbonX <span className="text-brand-green-light">Stack</span>
        </h2>
        <p className="text-brand-green-dark/40 font-bold uppercase tracking-widest text-[10px]">End-to-end industrial intelligence architecture</p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-0">
        {/* Connection Lines (Desktop) */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green-light/20 to-transparent -translate-y-1/2 hidden md:block" />

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="relative z-10 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-[2.5rem] glass-thick border-4 border-white shadow-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-green-light text-brand-green-dark group-hover:text-white transition-all duration-500">
                <step.icon size={44} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-brand-green-dark uppercase italic tracking-tighter">{step.label}</div>
                <div className="text-[10px] font-bold text-brand-green-light uppercase tracking-widest mt-1">{step.detail}</div>
              </div>
            </div>

            {/* Animated Connector (Mobile) */}
            {i < steps.length - 1 && (
              <div className="md:hidden w-px h-12 bg-brand-green-light/20 my-4 mx-auto" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TechnicalHighlights() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div className="relative group">
        <div className="absolute -inset-4 bg-brand-green-light/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="tech-border p-12 glass shadow-2xl rounded-3xl space-y-8 relative">
          <div className="absolute top-4 right-4 text-[8px] font-black text-brand-green-light/40 uppercase tracking-[0.5em] vertical-rl">
            Specs-v4.0.0
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-brand-green-light">
              <ShieldCheck size={20} />
              <span className="text-xs font-black uppercase tracking-widest">Safety Integrity</span>
            </div>
            <h3 className="text-4xl font-black text-brand-green-dark uppercase italic tracking-tighter">Hardened <br /> Forensic Base</h3>
          </div>

          <p className="text-brand-green-dark/60 font-medium leading-relaxed">
            Every CarbonX node is encased in 5mm industrial-grade anodized aluminum. Designed to operate at temperatures up to 85-¦C with zero thermal throttling.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-6">
            <div className="space-y-1">
              <div className="text-2xl font-black text-brand-green-dark italic">IP67</div>
              <div className="text-[10px] font-bold text-brand-green-dark/30 uppercase">Ingress Protection</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-brand-green-dark italic">4.2TB/s</div>
              <div className="text-[10px] font-bold text-brand-green-dark/30 uppercase">Bus Bandwidth</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-brand-green-light/10 border-brand-green-light/20 text-brand-green-light px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
            Telemetry Insight
          </Badge>
          <h2 className="text-5xl md:text-7xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.85]">
            Forensics <br /> Beyond <span className="text-brand-green-light">Data</span>
          </h2>
        </div>

        <div className="space-y-8">
          {[
            { icon: Workflow, title: "Neural Flow", desc: "Real-time process mapping via RX/TX mesh." },
            { icon: Layers, title: "Depth Analysis", desc: "Harmonic distortion tracking across 3-phases." },
            { icon: Shield, title: "Edge Security", desc: "Zero-knowledge proof validation for every sync." }
          ].map((item, i) => (
            <div key={i} className="flex gap-6 group">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-brand-green-dark group-hover:bg-brand-green-dark group-hover:text-white transition-all duration-300">
                <item.icon size={28} />
              </div>
              <div>
                <h4 className="text-xl font-black text-brand-green-dark uppercase italic tracking-tight">{item.title}</h4>
                <p className="text-brand-green-dark/50 text-sm font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center relative py-12 px-4 overflow-hidden">
      {/* Refined Industrial Background */}
      <div className="absolute inset-0 grid-overlay opacity-40 -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl aspect-square bg-brand-green-light/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,0.6fr] gap-10 items-center w-full max-w-[90rem] mx-auto relative z-10 px-6 lg:px-20">
        <div className="space-y-10 text-center lg:text-left z-20 lg:pr-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 p-2 pr-6 glass rounded-full border border-brand-green-light/20 mb-2"
          >
            <div className="p-2 bg-brand-green-light rounded-full">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-dark/60">System Ready • v4.0</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl sm:text-7xl xl:text-8xl 2xl:text-9xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.8] text-glow"
            >
              Industrial <br />
              <span className="text-brand-green-light underline decoration-[12px] underline-offset-[12px]">Intelligence</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-brand-green-dark/50 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Monitor every watt, detect every anomaly, and optimize your entire plant with one unified AI dashboard.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <Button className="h-20 px-12 rounded-[2rem] bg-brand-green-dark text-white hover:bg-brand-green-dark/95 text-xl font-black uppercase italic tracking-widest gap-4 shadow-2xl shadow-brand-green-dark/30 group border-b-4 border-black/20 transform active:translate-y-1 transition-all">
                {isAuthenticated ? "Enter Command" : "Get Started"}
                <ArrowRight className="group-hover:translate-x-3 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Device Image Showcase */}
        <div className="relative h-[400px] lg:h-[600px] flex flex-col items-center justify-center group z-10 w-full">
          <div className="absolute inset-0 bg-brand-green-light/5 blur-[100px] rounded-full scale-75 animate-pulse" />

          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="w-full max-w-sm lg:max-w-md aspect-square glass-thick md:rounded-[60px] rounded-[40px] border border-white flex items-center justify-center relative shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 dot-pattern opacity-10" />
            <div className="absolute top-6 left-6 p-2 glass rounded-xl border-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green-light animate-ping" />
            </div>

            <div className="relative z-10 w-full h-full p-8 transition-transform duration-700 group-hover:scale-110">
              <Image
                src="/image.png"
                alt="CarbonX Edge Node"
                fill
                className="object-contain p-4 drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    { title: "Plant Scale", desc: "RX/TX mesh networking for seamless factory-wide data aggregation.", icon: Globe, theme: "theme-mint" },
    { title: "AI Integrity", desc: "Neural forecasting models detecting anomalies before failure.", icon: Activity, theme: "theme-peach" },
    { title: "Zero Loss", desc: "Identify 3-phase imbalances and energy leakages instantly.", icon: Zap, theme: "theme-blue" },
    { title: "Sustainability", desc: "Automated carbon footprint reporting and tree offset tracking.", icon: Leaf, theme: "theme-yellow" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -12, scale: 1.02 }}
            className={cn("p-10 rounded-[2.5rem] shadow-sm border border-black/5 relative overflow-hidden group", f.theme)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="w-16 h-16 rounded-[1.25rem] bg-white/60 flex items-center justify-center mb-8 shadow-sm">
              <f.icon className="text-brand-green-dark" size={32} />
            </div>
            <h3 className="text-2xl font-black text-brand-green-dark mb-3 tracking-tight italic uppercase">{f.title}</h3>
            <p className="text-brand-green-dark/60 text-sm font-medium leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HardwareShowcase() {
  const [mode, setMode] = useState<'operational' | 'debug' | 'emergency'>('operational');

  const modeContent = {
    operational: { title: "Standard Protocol", desc: "High-precision sampling active. AES-256 encrypted sync loop running every 500ms." },
    debug: { title: "Telemetry Audit", desc: "Detailed wave-form analysis enabled. Reporting phase-level harmonic distortion." },
    emergency: { title: "Critical Safe", desc: "Automatic disconnect sequence primed. Cooling protocols initialized." }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 py-32 relative">
      <div className="absolute top-0 right-10 w-64 h-64 bg-brand-yellow/5 blur-[120px] rounded-full -z-10" />

      <div className="flex-1 space-y-10 text-center lg:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-green-dark text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-green-dark/20">
            Hardware 4.0
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.85]">
            The <span className="text-brand-green-light">CarbonX</span> <br /> Core Node
          </h2>
          <p className="text-xl text-brand-green-dark/40 font-medium max-w-lg leading-relaxed">
            Industrial-grade RX/TX nodes designed for harsh environments and zero-latency forensics.
          </p>
        </div>

        {/* Hardware Mode Switcher */}
        <div className="space-y-6 glass p-8 rounded-[2.5rem] border border-black/5 bg-white/40">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-brand-green-light uppercase tracking-[0.3em]">{modeContent[mode].title}</p>
            <p className="text-sm font-medium text-brand-green-dark/60 italic">{modeContent[mode].desc}</p>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {(['operational', 'debug', 'emergency'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 border-b-4",
                  mode === m
                    ? "bg-brand-green-dark text-white border-black/20 shadow-xl"
                    : "bg-white border-black/5 text-brand-green-dark/40 hover:bg-black/5 border-b-transparent"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-2xl h-[550px] relative">
        <motion.div
          animate={{
            scale: mode === 'emergency' ? [1, 1.05, 1] : 1,
            rotate: mode === 'debug' ? [0, 3, 0, -3, 0] : 0
          }}
          transition={{ duration: 0.4, repeat: mode !== 'operational' ? Infinity : 0 }}
          className="w-full h-full glass-thick md:rounded-[80px] rounded-[50px] border-2 border-dashed border-black/10 flex items-center justify-center relative shadow-2xl overflow-hidden"
        >
          <div className={cn(
            "absolute inset-0 transition-all duration-1000 blur-[100px] opacity-40",
            mode === 'operational' ? "bg-brand-green-light" : mode === 'debug' ? "bg-brand-yellow" : "bg-red-500"
          )} />
          <div className="absolute inset-0 dot-pattern opacity-10" />

          <div className="flex flex-col items-center gap-10 relative z-10 w-full h-full justify-center p-12">
            <div className="relative w-64 h-64">
              <Image
                src="/image.png"
                alt="CarbonX Hardware Node"
                fill
                className={cn(
                  "object-contain drop-shadow-2xl transition-all duration-500",
                  mode === 'emergency' ? "brightness-50 sepia hue-rotate-[-50deg] saturate-200" :
                    mode === 'debug' ? "brightness-110 saturate-150 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" : ""
                )}
              />
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-green-dark font-black text-3xl italic uppercase tracking-tighter">TX-Node v4.0</div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-[10px] font-black uppercase text-brand-green-dark/30 tracking-widest">Active Link</span>
                <div className="w-12 h-1 bg-brand-green-light/20 rounded-full">
                  <motion.div
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-brand-green-light rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SustainabilityInsight() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-32 text-center space-y-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      <div className="space-y-6">
        <h2 className="text-5xl md:text-7xl font-black text-brand-green-dark tracking-tighter uppercase italic leading-[0.85]">
          Built for <span className="text-brand-green-light">Net-Zero</span>
        </h2>
        <p className="text-xl text-brand-green-dark/40 font-medium max-w-2xl mx-auto leading-relaxed">
          The only industrial platform combining high-resolution IoT forensics with automated carbon neutrality workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "CO2 Tracked", val: "1.2M+", sub: "Metric Tons Annually" },
          { label: "Offset Value", val: "850k", sub: "Simulated Tree Units" },
          { label: "Avg Reduction", val: "14%", sub: "Industrial Waste Recovery" }
        ].map((stat, i) => (
          <div key={i} className="glass p-12 rounded-[3rem] border border-black/5 bg-white group hover:border-brand-green-light/20 transition-all">
            <div className="text-5xl md:text-6xl font-black text-brand-green-dark mb-4 tabular-nums tracking-tighter text-glow group-hover:scale-110 transition-transform">{stat.val}</div>
            <div className="space-y-1">
              <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{stat.label}</div>
              <div className="text-xs font-bold text-brand-green-light/40 italic">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GlobalImpactTicker() {
  const metrics = [
    { label: "Net Zero Path", val: "Active" },
    { label: "Plant Registry", val: "Verified" },
    { label: "AI Prediction", val: "99.2%" },
    { label: "Mesh Uptime", val: "100%" },
    { label: "Security Level", val: "AES-256" },
  ];

  return (
    <div className="w-full bg-brand-green-dark py-4 overflow-hidden border-y border-white/10">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-20 items-center px-10">
            {metrics.map((m, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green-light" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{m.label}</span>
                <span className="text-[10px] font-black text-brand-green-light uppercase italic">{m.val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
